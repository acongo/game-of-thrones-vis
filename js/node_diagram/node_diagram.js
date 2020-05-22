class NodeDiagram {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      legendElement: _config.legendElement,
      legendWidth: _config.legendWidth || 200,
      legendHeight: _config.legendHeight || 300,
      legendMargin: _config.legendMargin || { top: 40, left: 25 },
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 0, bottom: 0, right: 0, left: 0 },
      nodeRadius: 25,
      killGraphPadding: 5,
      killGraphThickness: 10,
    };
    this.innerKillGraphRadius =
      this.config.nodeRadius + this.config.killGraphPadding;
    this.outerKillGraphRadius =
      this.innerKillGraphRadius + this.config.killGraphThickness;
    this.linkColor = '#b00c0c';
    this.tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('display', 'none');
    this.dragEnded = false;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // append svg and diagram
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.diagram = vis.svg
      .append('g')
      .attr('class', 'diagram')
      .attr(
        'transform',
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      )
      .attr('viewBox', [0, 0, vis.width, vis.height]);

    // Define arrowhead
    vis.diagram
      .append('defs')
      .selectAll('marker')
      .data(['arrowhead'])
      .join('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', -0.5)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', vis.linkColor)
      .attr('d', 'M0,-5L10,0L0,5');
  }

  update() {
    let vis = this;

    vis.links = vis.data.links.map((d) => Object.create(d));
    vis.nodes = vis.data.nodes.map((d) => Object.create(d));

    for (let node of vis.nodes) {
      node.x = vis.randomBounded(0, vis.width);
      node.y = vis.randomBounded(0, vis.height);
    }

    vis.simulation = d3
      .forceSimulation(vis.nodes)
      .force(
        'link',
        d3
          .forceLink(vis.links)
          .id((d) => d.id)
          .distance(100)
          .strength(1)
      )
      .force('charge', d3.forceManyBody().strength(-20).distanceMax(30))
      .force('collide', d3.forceCollide(vis.outerKillGraphRadius))
      .velocityDecay(0.3);

    vis.pie = d3
      .pie()
      .padAngle(0.05)
      .sort(null)
      .value((d) => d.value);
    vis.arc = d3
      .arc()
      .innerRadius(vis.innerKillGraphRadius)
      .outerRadius(vis.outerKillGraphRadius);
    vis.color = d3
      .scaleOrdinal()
      .domain(vis.methodGroups)
      .range(vis.methodColors);

    vis.render();
  }

  render() {
    let vis = this;
    let radius = vis.config.nodeRadius;

    vis.diagram.empty();
    d3.selectAll('.node').remove();
    d3.selectAll('use').remove();
    d3.selectAll('line').remove();

    const link = vis.diagram.selectAll('line').data(vis.links);
    const linkEnter = link
      .enter()
      .append('line')
      .attr('marker-end', 'url(#arrowhead)');

    var defs = vis.svg.append('defs').attr('id', 'imgdefs');

    vis.nodes.forEach((d) => {
      defs
        .append('pattern')
        .attr('id', d.id.replace(/[\s"'()]/g, '') + 'image')
        .attr('height', 1)
        .attr('width', 1)
        .attr('x', '0')
        .attr('y', '0')
        .append('image')
        .attr('height', radius * 2)
        .attr('width', radius * 2)
        .attr('preserveAspectRatio', 'none')
        .attr('xlink:href', this.getCharacterImage(d));
      defs
        .append('circle')
        .attr('class', 'characterNode')
        .attr('id', d.id.replace(/[\s"'()]/g, ''))
        .attr('fill', 'url(#' + d.id.replace(/[\s"'()]/g, '') + 'image)')
        .attr('r', radius);
    });

    let node = vis.diagram.selectAll('.node').data(vis.nodes, (d) => d.id);

    let nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .on('mouseover', (d) => vis.onMouseover(d))
      .on('mouseout', () => vis.onMouseout())
      .on('mousemove', () => vis.onMousemove(vis))
      .call(vis.drag(vis.simulation));
    nodeEnter
      .append('use')
      .attr('class', 'nodeImage')
      .attr('class', (d) => d.id.replace(/[\s"'()]/g, ''))
      .attr('xlink:href', (d) => '#' + d.id.replace(/[\s"'()]/g, ''));
    node.merge(nodeEnter);

    nodeEnter
      .selectAll('path')
      .data((d) => {
        let killerData = vis.data.killers.get(d.id);
        if (killerData) {
          let methods = killerData.methods;
          let pieData = [];
          for (let method of methods.entries()) {
            pieData.push({
              character: d.id,
              method: method[0],
              value: method[1],
            });
          }
          return vis.pie(pieData);
        }
        return vis.pie([]);
      })
      .enter()
      .append('path')
      .attr('class', 'donut')
      .attr('d', vis.arc)
      .attr('fill', (d) => vis.color(d.data.method))
      .attr('fill-opacity', '0.75')
      .attr('stroke', 'black')
      .attr('stroke-width', '0.5')
      .attr('stroke-opacity', '0.25')
      .on('mouseover', (d) => vis.onMouseover(d))
      .on('mouseout', () => vis.onMouseout())
      .on('mousemove', () => vis.onMousemove(vis))
      .call(vis.drag(vis.simulation));

    vis.simulation.on('tick', () => {
      // The following logic ensures nodes stay within the diagram viewbox
      nodeEnter.attr(
        'transform',
        (d) => `translate(${vis.xBound(d.x)},${vis.yBound(d.y)})`
      );

      linkEnter
        .attr('x1', (d) => (d.source.x = vis.xBound(d.source.x)))
        .attr('y1', (d) => (d.source.y = vis.yBound(d.source.y)))
        .attr('x2', (d) => (d.target.x = vis.xBound(d.target.x)))
        .attr('y2', (d) => (d.target.y = vis.yBound(d.target.y)))
        .attr('stroke', vis.linkColor)
        .attr('stroke-opacity', 0.6);
    });

    vis.addLegend();
  }

  addLegend() {
    let vis = this;
    const svg = d3
      .select(vis.config.legendElement)
      .attr('height', vis.config.legendHeight)
      .attr('width', vis.config.legendWidth)
      .attr(
        'transform',
        `translate(0,${
          vis.config.containerHeight / 2 - vis.config.legendHeight / 2
        })`
      );
    svg
      .append('g')
      .append('text')
      .text('Weapon')
      .attr('class', 'legend-text')
      .style('font', '20px times')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${vis.config.legendWidth / 2},25)`);

    vis.addBorderToLegend(svg);
    vis.addColorSquaresToLegend(svg);
    vis.addMethodTextToLegend(svg);
  }

  addColorSquaresToLegend(svg) {
    let vis = this;
    svg
      .append('g')
      .selectAll('rect')
      .data(vis.methodGroups)
      .join('rect')
      .attr('fill', vis.color)
      .attr('stroke', 'white')
      .attr('width', 20)
      .attr('height', 20)
      .attr('transform', function (d, i) {
        var x = vis.config.legendMargin.left;
        var y = vis.config.legendMargin.top + i * 25;
        return 'translate(' + [x, y] + ')';
      });
  }

  addMethodTextToLegend(svg) {
    let vis = this;
    svg
      .append('g')
      .selectAll('text')
      .data(vis.methodGroups)
      .enter()
      .append('text')
      .transition()
      .attr('fill', 'black')
      .attr('text-anchor', 'left')
      .attr('transform', function (d, i) {
        var x = vis.config.legendMargin.left + 30;
        var y = vis.config.legendMargin.top + 13 + i * 25;
        return 'translate(' + [x, y] + ')';
      })
      .transition()
      .text((d) => '- ' + d);
  }

  addBorderToLegend(svg) {
    let vis = this;
    let height = vis.config.legendHeight;
    let width = vis.config.legendWidth;
    const legendBorder = svg.append('g');

    var legendBorderAdd = legendBorder.selectAll('rect').data([0, 1]);
    legendBorderAdd
      .enter()
      .append('rect')
      .attr('y', 0)
      .attr('x', function (d, i) {
        return 0 + (width - 3) * d;
      })
      .attr('fill', 'black')
      .attr('opacity', '0.5')
      .attr('width', 3)
      .attr('height', height);

    const legendBorderTop = svg.append('g');

    var legendBorderTopAdd = legendBorderTop.selectAll('rect').data([0, 1]);
    legendBorderTopAdd
      .enter()
      .append('rect')
      .attr('y', function (d, i) {
        return 0 + (height - 3) * d;
      })
      .attr('x', 0)
      .attr('fill', 'black')
      .attr('opacity', '0.5')
      .attr('width', width)
      .attr('height', 3);
  }

  drag(simulation) {
    let vis = this;

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.1).restart();
      d.fx = d.x;
      d.fy = d.y;
      vis.tooltip.style('display', 'none');
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
      vis.tooltip.style('display', 'none');
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      vis.dragEnded = true;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  onMouseover(d) {
    let vis = this;
    let pos = d3.mouse(vis.diagram.node());
    vis.tooltip
      .text(d.id)
      .style('left', vis.tooltipXOffset(pos))
      .style('top', vis.tooltipYOffset(pos))
      .style('display', 'inline');
  }

  onMouseout() {
    let vis = this;
    vis.tooltip.style('display', 'none');
  }

  onMousemove() {
    let vis = this;
    let pos = d3.mouse(vis.diagram.node());
    vis.tooltip
      .style('left', vis.tooltipXOffset(pos))
      .style('top', vis.tooltipYOffset(pos));
    if (vis.dragEnded) {
      vis.tooltip.style('display', 'inline');
    }
  }

  tooltipXOffset(pos) {
    return `${pos[0] + 20}px`;
  }

  tooltipYOffset(pos) {
    return `${pos[1] + 335}px`;
  }

  getCharacterImage(d) {
    let vis = this;
    let character = {};
    let i;
    for (i = 0; i < vis.characters.characters.length; i++) {
      if (vis.characters.characters[i].characterName === d.id) {
        character = vis.characters.characters[i];
      }
    }

    if (
      character === {} ||
      Object.keys(character).indexOf('characterImageFull') === -1
    ) {
      return 'https://cdn.clipart.email/95c9d7aa26fb4713b0d59045888ec5af_generic-person-silhouette-at-getdrawingscom-free-for-personal-_300-300.png';
    } else {
      return character.characterImageFull;
    }
  }

  xBound(xPos) {
    return Math.max(
      this.outerKillGraphRadius,
      Math.min(this.width - this.outerKillGraphRadius, xPos)
    );
  }
  is;
  yBound(yPos) {
    return Math.max(
      this.outerKillGraphRadius,
      Math.min(this.height - this.outerKillGraphRadius, yPos)
    );
  }

  randomBounded(min, max) {
    return Math.random() * (max - min) + min;
  }
}
