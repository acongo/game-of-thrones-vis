class GotMap {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 650,
      containerHeight: _config.containerHeight || 700,
    };
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.svg = d3
      .select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg
      .append('g')
      .attr(
        'transform',
        'translate(-450,-700), scale(0.6,0.6), rotate(64 0 0)'
      );

    // Initialize a geographic path generator
    // Projection: https://github.com/d3/d3-geo/blob/v1.11.9/README.md#geoAlbers
    vis.path = d3.geoPath().projection(d3.geoAlbers());
  }

  update(season) {
    let vis = this;
    let data = vis.got_geo;
    vis.render();
  }

  render() {
    let vis = this;
    let geoPath = vis.chart
      .selectAll('.geo-path')
      .data(
        topojson.feature(vis.got_geo, vis.got_geo.objects.political).features
      );
    var format = d3.format('.2s');

    let geoPathEnter = geoPath
      .enter()
      .append('path')
      .attr('class', 'geo-path')
      .attr('id', (d) => {
        if (!d.properties.name) {
          //data set didn't have this region name
          return 'Beyond the Wall'.replace(/\s/g, '');
        }
        return d.properties.name.replace(/\s/g, '');
      })
      .attr('d', vis.path);

    //add color to regions corresponding to number of deaths
    geoPathEnter
      .merge(geoPath)
      .transition()
      .attr('fill', (d) => {
        return vis.getAlliance(d.properties.name, true);
      });
    geoPath.exit().remove();

    vis.addCircles();
    //add names to regions
    let text = vis.chart
      .selectAll('text')
      .data(
        topojson.feature(vis.got_geo, vis.got_geo.objects.political).features
      )
      .join('text')
      .attr('fill', 'white')
      .attr('transform', function (d) {
        let x = vis.path.centroid(d)[0];
        let y = vis.path.centroid(d)[1];
        return 'translate(' + [x, y] + ')rotate(-64)';
      })
      .attr('text-anchor', 'middle')
      .attr('class', 'labels')
      .text(function (d) {
        if (d.properties.name == "Bran's Gift") {
          //we don't want to show this region
          return ' ';
        } else if (!d.properties.name) {
          //data set didn't have this region name
          return 'Beyond the Wall';
        } else if (d.properties.name === 'New Gift') {
          return 'The Wall';
        }
        return d.properties.name;
      })
      .on('click', function (d) {
        let name;
        if (!d.properties.name) {
          //data set didn't have this region name
          name = 'Beyond the Wall';
        } else {
          name = d.properties.name;
        }
        if (vis.selectedRegion) {
          if (vis.selectedRegion == name) {
            d3.select('#' + vis.selectedRegion.replace(/\s/g, ''))
              .attr('stroke', '#e82424')
              .attr('stroke-width', '1px');
            vis.barChart.region = 'none';
            vis.selectedRegion = null;
            vis.barChart.update();
          } else {
            d3.select('#' + vis.selectedRegion.replace(/\s/g, ''))
              .attr('fill', vis.getAlliance(vis.selectedRegion, true))
              .attr('stroke', '#e82424')
              .attr('stroke-width', '1px');
            d3.select('#' + name.replace(/\s/g, ''))
              .attr('stroke', 'red')
              .attr('stroke-width', '9px');
            vis.selectedRegion = name;
            vis.barChart.region = name;
            vis.barChart.update();
          }
          //
        } else {
          d3.select('#' + name.replace(/\s/g, ''))
            .attr('stroke', 'red')
            .attr('stroke-width', '9px');
          vis.selectedRegion = name;
          vis.barChart.region = name;
          vis.barChart.update();
        }
      });

    vis.addLegend();
    vis.addColorLegend();
  }

  getAlliance(alliance, returnColor) {
    if (returnColor) {
      if (alliance === 'The Vale') {
        //"House Arryn"
        return '#382b5c';
      } else if (alliance === 'Crownsland' || alliance === 'Stormlands') {
        //"House Baratheon"
        return '#2b5c44';
      } else if (alliance === 'The Iron Islands') {
        //"House Greyjoy"
        return '#5a7d96';
      } else if (alliance === 'The Westerlands') {
        //"House Lannister"
        return '#c79634';
      } else if (alliance === 'Dorne') {
        //"House Martell"
        return '#8e31b0';
      } else if (alliance === 'Riverlands') {
        //"House Tully"
        return '#286eb8';
      } else if (alliance === 'The Reach') {
        //"House Tyrell"
        return '#576957';
      } else if (alliance === 'The North') {
        //"House Stark"
        return '#728287';
      } else if (alliance === 'The Wall' || alliance === 'New Gift') {
        //"Night's Watch"
        return 'black';
      } else {
        //"The North/whitewalkers and wildlings"
        return '#0bb9bb';
      }
    } else {
      if (alliance === 'The Vale') {
        return 'House Arryn';
      } else if (alliance === 'Crownsland' || alliance === 'Stormlands') {
        return 'House Baratheon';
      } else if (alliance === 'The Iron Islands') {
        return 'House Greyjoy';
      } else if (alliance === 'The Westerlands') {
        return 'House Lannister';
      } else if (alliance === 'Dorne') {
        return 'House Martell';
      } else if (alliance === 'Riverlands') {
        return 'House Tully';
      } else if (alliance === 'The Reach') {
        return 'House Tyrell';
      } else if (alliance === 'The North') {
        return 'House Stark';
      } else if (alliance === 'The Wall') {
        return "Night's Watch";
      } else {
        return 'Whitewalkers and Wildlings';
      }
    }
  }

  addCircles() {
    let vis = this;

    const circleScale = d3
      .scaleLinear()
      .domain([vis.minDeathValue, vis.maxDeathValue])
      .range([30, 100])
      .nice();

    var circles = vis.chart
      .selectAll('circle')
      .data(
        topojson.feature(vis.got_geo, vis.got_geo.objects.political).features
      );
    circles
      .join('circle')
      .transition()
      .duration(400)
      .attr('fill', '#b70b0b')
      .attr('cx', function (d) {
        return vis.path.centroid(d)[0];
      })
      .attr('cy', function (d) {
        return vis.path.centroid(d)[1];
      })
      .attr('r', (d) => {
        if (vis.death_data[d.properties.name]) {
          return circleScale(vis.death_data[d.properties.name]);
        }
      })
      .attr('fill-opacity', 0.6);
  }

  addLegend() {
    let vis = this;

    // add legend text
    var legendHeader = vis.svg.append('g');
    legendHeader
      .attr('transform', `translate(90,675)`)
      .attr('class', 'legend-text')
      .append('text')
      .text('Death Count')
      .style('font', '35px times');

    var legendRulingHeader = vis.svg.append('g');
    legendRulingHeader
      .attr('transform', `translate(415,675)`)
      .attr('class', 'legend-text')
      .append('text')
      .text('Ruling House')
      .style('font', '35px times');

    vis.addCircleLegend();
    vis.addColorLegend();
  }

  addCircleLegend() {
    let vis = this;
    const svg = d3.select('.map_legend');
    const height = +svg.attr('height');
    const width = +svg.attr('width');
    vis.addBoarderToLegend(svg, height, width);
    vis.addCirclesToLegend(height, width);
    vis.addDeathCountToLegend(height, width);
  }

  addColorLegend() {
    let vis = this;
    const svg = d3.select('.color_legend');
    const height = +svg.attr('height');
    const width = +svg.attr('width');

    let allegiances = [
      'The Vale',
      'Crownsland',
      'The Iron Islands',
      'The Westerlands',
      'Dorne',
      'Riverlands',
      'The Reach',
      'The North',
      'The Wall',
      'Beyond the Wall',
    ];

    vis.addBoarderToLegend(svg, height, width);
    vis.addColorSquaresToLegend(svg, height, width, allegiances);
    vis.addAllegianceToColorLegend(height, width, allegiances);
  }

  addAllegianceToColorLegend(height, width, allegiances) {
    let vis = this;
    let deathValArray = [
      vis.minDeathValue,
      (vis.minDeathValue + vis.maxDeathValue) / 2,
      vis.maxDeathValue,
    ];

    const legendSvg = d3.select('.color_legend');

    let text = legendSvg
      .selectAll('text')
      .data(allegiances)
      .join('text')
      .transition()
      .attr('fill', 'black')
      .attr('text-anchor', 'left')
      .attr('transform', function (d, i) {
        var x = 60;
        var y = 30 + i * 25;
        return 'translate(' + [x, y] + ')';
      })
      .transition()
      .text(function (d) {
        return '- ' + vis.getAlliance(d, false);
      });
  }

  addColorSquaresToLegend(svg, height, width, allegiances) {
    let vis = this;

    // Data and color scale
    var colorScheme = d3.schemeReds[9];
    //TODO this domain may need to be changed..
    var colorScale = d3
      .scaleQuantile()
      .domain([0, vis.maxDeathValue])
      .range(['#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c']);

    const legend = svg.append('g').attr('transform', `translate(100,-40)`);

    let deathValArray = [
      0,
      vis.maxDeathValue * (1 / 4),
      vis.maxDeathValue * (1 / 2),
      vis.maxDeathValue * (3 / 4),
      vis.maxDeathValue,
    ];

    var legendSquares = legend
      .selectAll('rect')
      .data(allegiances)
      .join('rect')
      .attr('fill', (d) => {
        return vis.getAlliance(d, true);
      })
      .attr('width', 20)
      .attr('height', 20)
      .attr('transform', function (d, i) {
        var x = -70;
        var y = 55 + i * 25;
        return 'translate(' + [x, y] + ')';
      });
  }

  addDeathCountToLegend(height, width) {
    let vis = this;

    let deathValArray = [
      vis.maxDeathValue / 3,
      vis.maxDeathValue * (2 / 3),
      vis.maxDeathValue,
    ];

    const legend = d3.select('.map_legend');

    let text = legend
      .selectAll('text')
      .data(deathValArray)
      .join('text')
      .transition()
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .attr('transform', function (d, i) {
        if (i == 0) {
          var x = 45;
        } else if (i == 1) {
          var x = 145;
        } else {
          var x = 280;
        }
        var y = 180;
        return 'translate(' + [x, y] + ')';
      })
      .transition()
      .text(function (d) {
        var f = d3.format('.0f');
        return f(d) + ' Deaths';
      });
  }

  addCirclesToLegend(height, width) {
    let vis = this;

    vis.svg.append('g');

    const legendSvg = d3.select('.map_legend');

    const legend = legendSvg.append('g').attr('transform', `translate(100,0)`);

    const radiusArray = [52, 74, 97];

    var legendCircles = legend
      .selectAll('circle')
      .data(radiusArray)
      .join('circle')
      .attr('fill', '#b70b0b')
      .attr('r', (d) => {
        return d;
      })
      .attr('transform', function (d, i) {
        if (i == 0) {
          var x = -60;
        } else if (i == 1) {
          var x = 45;
        } else {
          var x = 180;
        }
        var y = 100;
        return 'translate(' + [x, y] + '), scale(0.6,0.6)';
      });
  }

  addBoarderToLegend(svg, height, width) {
    let vis = this;
    // add legend border
    const legendBoarder = svg.append('g');

    const legendSvg = d3.select('.map_legend');

    var legendBoarderAdd = legendBoarder.selectAll('rect').data([0, 1]);
    legendBoarderAdd
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

    const legendBoarderTop = svg.append('g');

    var legendBoarderTopAdd = legendBoarderTop.selectAll('rect').data([0, 1]);
    legendBoarderTopAdd
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
}
