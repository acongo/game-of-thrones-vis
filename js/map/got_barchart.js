class GotBarChart {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 650,
      containerHeight: _config.containerHeight || 700,
    };
    this.config.margin = _config.margin || {
      top: 115,
      bottom: 120,
      right: 10,
      left: 60,
    };

    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.chart = d3
      .select(vis.config.parentElement)
      .append('g')
      .attr(
        'transform',
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.xAxisLabel = 'House';
    vis.yAxisLabel = 'Number of Deaths';
  }

  update() {
    let vis = this;
    if (!vis.season) {
      vis.season = '1';
    }
    if (!vis.region) {
      vis.region = 'none';
    }

    vis.seasonData = this.formatDataBySeason(vis.death_data);

    vis.regionData = {};
    vis.regionData['House Arryn'] = 0;
    vis.regionData['House Baratheon'] = 0;
    vis.regionData['House Greyjoy'] = 0;
    vis.regionData['House Lannister'] = 0;
    vis.regionData['House Martell'] = 0;
    vis.regionData['House Stark'] = 0;
    vis.regionData['House Targaryen'] = 0;
    vis.regionData['House Tully'] = 0;
    vis.regionData['House Tyrell'] = 0;
    vis.regionData['House Bolton'] = 0;
    vis.regionData['Dothraki'] = 0;
    vis.regionData['Sons of the Harpy'] = 0;
    vis.regionData["Night's Watch"] = 0;
    vis.regionData['Other'] = 0;

    vis.contextData = {};
    vis.contextData['House Arryn'] = 0;
    vis.contextData['House Baratheon'] = 0;
    vis.contextData['House Greyjoy'] = 0;
    vis.contextData['House Lannister'] = 0;
    vis.contextData['House Martell'] = 0;
    vis.contextData['House Stark'] = 0;
    vis.contextData['House Targaryen'] = 0;
    vis.contextData['House Tully'] = 0;
    vis.contextData['House Tyrell'] = 0;
    vis.contextData['House Bolton'] = 0;
    vis.contextData['Dothraki'] = 0;
    vis.contextData['Sons of the Harpy'] = 0;
    vis.contextData["Night's Watch"] = 0;
    vis.contextData['Other'] = 0;

    let keys = Object.keys(vis.regionData);

    vis.seasonData.forEach((d) => {
      if (d.allegiance.indexOf('House Baratheon') !== -1) {
        vis.contextData['House Baratheon']++;
      } else if (keys.indexOf(d.allegiance) !== -1) {
        vis.contextData[d.allegiance]++;
      } else {
        vis.contextData['Other']++;
      }
    });

    if (vis.region != 'none') {
      vis.seasonData.forEach((d) => {
        if (d.region == vis.region) {
          if (d.allegiance.indexOf('House Baratheon') !== -1) {
            vis.regionData['House Baratheon']++;
          } else if (keys.indexOf(d.allegiance) !== -1) {
            vis.regionData[d.allegiance]++;
          } else {
            vis.regionData['Other']++;
          }
        }
      });
    }

    let maxValue = 0;
    Object.values(vis.contextData).forEach((v) => {
      if (v > maxValue) maxValue = v;
    });

    // draw axes
    vis.yScale = d3
      .scaleLinear()
      .domain([0, maxValue + 10])
      .range([vis.height, 0]);

    vis.xScale = d3
      .scaleBand()
      .domain(Object.keys(vis.contextData))
      .range([0, vis.width])
      .padding(0.1);

    let yAxis = d3.axisLeft(vis.yScale).tickSize(2);
    let xAxis = d3.axisBottom(vis.xScale).tickSize(0);
    vis.chart.selectAll('g').remove();
    vis.yAxisG = vis.chart.append('g').call(yAxis);
    vis.yAxisG
      .append('text')
      .attr('class', 'axis-label')
      .attr('y', -40)
      .attr('x', -vis.height / 2)
      .attr('position', 'relative')
      .attr('z-index', 10)
      .attr('transform', `rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .text(vis.yAxisLabel);

    vis.xAxisG = vis.chart
      .append('g')
      .call(xAxis)
      .attr('transform', `translate(0,${vis.height})`)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');
    vis.xAxisG.select('.domain').remove();
    vis.xAxisG
      .append('text')
      .attr('class', 'axis-label')
      .attr('y', vis.height)
      .attr('x', vis.width / 2)
      .attr('fill', 'black');

    let regionText;
    if (vis.region == 'none') {
      regionText = 'All Regions';
    } else {
      regionText = vis.region;
    }

    d3.select('.bartitle').remove();
    vis.svg
      .append('text')
      .attr('x', vis.width / 2 + 50)
      .attr('class', 'bartitle')
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '30px')
      .attr('fill', 'silver')
      .text('Deaths By Allegiance for Season ' + vis.season);

    this.render();
  }

  formatDataBySeason() {
    let vis = this;
    let currData = [];

    let beyond_the_wall = 'Beyond the Wall';
    //json data uses name New Gift but we want to use The Wall
    let the_wall = 'New Gift';
    let the_north = 'The North';
    let the_vale = 'The Vale';
    let riverlands = 'Riverlands';
    let the_iron_islands = 'The Iron Islands';
    let the_westerlands = 'The Westerlands';
    let the_reach = 'The Reach';
    let crownsland = 'Crownsland';
    let stormlands = 'Stormlands';
    let dorne = 'Dorne';
    let other_region = 'Other Region';

    vis.death_data.forEach((d) => {
      if (vis.season == d.season) {
        if (d.location == beyond_the_wall || d.location == 'Hardhome') {
          currData.push({ region: beyond_the_wall, allegiance: d.allegiance });
        } else if (
          d.location == the_wall ||
          d.location == 'Castle Black' ||
          d.location == "Mole's Town" ||
          d.location == "Mole's Town" ||
          d.location == 'The Gift' ||
          d.location == 'The Wall'
        ) {
          currData.push({ region: the_wall, allegiance: d.allegiance });
        } else if (
          d.location == the_north ||
          d.location == 'Dreadfort' ||
          d.location == 'Kingsroad' ||
          d.location == 'Last Hearth' ||
          d.location == 'Moat Cailin' ||
          d.location == 'Winterfell'
        ) {
          currData.push({ region: the_north, allegiance: d.allegiance });
        }
        //Eastern road begins in Riverlands but ends in the Vale so was classified as the Vale
        else if (
          d.location == the_vale ||
          d.location == 'Eastern Road' ||
          d.location == 'The Eyrie'
        ) {
          currData.push({ region: the_vale, allegiance: d.allegiance });
        } else if (
          d.location == riverlands ||
          d.location == 'Harrenhal' ||
          d.location == 'Hollow Hill' ||
          d.location == 'Riverrun' ||
          d.location == "Robb Stark's camp" ||
          d.location == 'The Twins'
        ) {
          currData.push({ region: riverlands, allegiance: d.allegiance });
        } else if (
          d.location == the_iron_islands ||
          d.location == 'Iron Islands'
        ) {
          currData.push({ region: the_iron_islands, allegiance: d.allegiance });
        } else if (
          d.location == the_westerlands ||
          d.location == 'Casterly Rock' ||
          d.location == 'Oxcross'
        ) {
          currData.push({ region: the_westerlands, allegiance: d.allegiance });
        } else if (
          d.location == the_reach ||
          d.location == 'Highgarden' ||
          d.location == 'Roseroad'
        ) {
          currData.push({ region: the_reach, allegiance: d.allegiance });
        } else if (
          d.location == crownsland ||
          d.location == "King's Landing" ||
          d.location == 'Dragonstone'
        ) {
          currData.push({ region: crownsland, allegiance: d.allegiance });
        } else if (d.location == stormlands || d.location == "Storm's End") {
          currData.push({ region: stormlands, allegiance: d.allegiance });
        } else if (d.location == dorne) {
          currData.push({ region: dorne, allegiance: d.allegiance });
        } else {
          //includes Astapor, Braavos, The Narrow Sea, areas in Essos, "unkown", vaes dothrak, Valyria
          currData.push({ region: other_region, allegiance: d.allegiance });
        }
      }
    });
    return currData;
  }

  render() {
    let vis = this;

    let contextData = vis.chart
      .selectAll('#contextBars')
      .data(Object.keys(vis.contextData));
    let contextDataGlyphs = vis.chart
      .selectAll('image')
      .data(Object.keys(vis.contextData));
    let div = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .attr('background-color', '#FCFEF0')
      .style('opacity', 3);

    let contextDataEnter = contextData
      .enter()
      .append('rect')
      .attr('id', 'contextBars')
      .attr('fill', (d) => {
        if (d === 'House Arryn') {
          return '#382b5c';
        } else if (d === 'House Baratheon') {
          return '#2b5c44';
        } else if (d === 'House Greyjoy') {
          return '#5a7d96';
        } else if (d === 'House Lannister') {
          return '#c79634';
        } else if (d === 'House Martell') {
          return '#8e31b0';
        } else if (d === 'House Targaryen') {
          return '#d43939';
        } else if (d === 'House Tully') {
          return '#286eb8';
        } else if (d === 'House Tyrell') {
          return '#576957';
        } else if (d === 'House Stark') {
          return '#728287';
        } else if (d === 'House Bolton') {
          return '#30154d';
        } else if (d === 'Dothraki') {
          return '#474007';
        } else if (d === 'Sons of the Harpy') {
          return '#41007d';
        } else if (d === "Night's Watch") {
          return 'black';
        } else {
          return '#525252';
        }
      })
      .attr('y', (d) => vis.yScale(vis.contextData[d]))
      .attr('x', (d) => vis.xScale(d))
      .attr('width', vis.xScale.bandwidth())
      .attr('height', (d) => +(vis.height - vis.yScale(vis.contextData[d])))
      .attr('stroke', 'black')
      .attr('opacity', (d) => {
        if (vis.region == 'none') {
          return '1.00';
        } else {
          return '0.70';
        }
      });

    let glyphsEnter = contextDataGlyphs
      .enter()
      .append('image')
      .attr('xlink:href', (d) => {
        if (d === 'House Arryn') {
          return '/data/images/houseglyphs/arryn.png';
        } else if (d === 'House Baratheon') {
          return '/data/images/houseglyphs/baratheon.png';
        } else if (d === 'House Greyjoy') {
          return '/data/images/houseglyphs/greyjoy.png';
        } else if (d === 'House Lannister') {
          return '/data/images/houseglyphs/lannister.png';
        } else if (d === 'House Martell') {
          return '/data/images/houseglyphs/martell.png';
        } else if (d === 'House Targaryen') {
          return '/data/images/houseglyphs/targaryen.png';
        } else if (d === 'House Tully') {
          return '/data/images/houseglyphs/tully.png';
        } else if (d === 'House Tyrell') {
          return '/data/images/houseglyphs/tyrell.png';
        } else if (d === 'House Stark') {
          return '/data/images/houseglyphs/stark.png';
        } else if (d === 'House Bolton') {
          return '/data/images/houseglyphs/bolton.png';
        } else if (d === 'Dothraki') {
          return '/data/images/houseglyphs/dothraki.png';
        } else if (d === 'Sons of the Harpy') {
          return '/data/images/houseglyphs/sonsoftheharpy.png';
        } else if (d === "Night's Watch") {
          return '/data/images/houseglyphs/nightswatch.png';
        } else {
          return '/data/images/houseglyphs/noallegiance.png';
        }
      })
      .attr('width', vis.xScale.bandwidth() - 3)
      .attr('height', vis.xScale.bandwidth() - 3)
      .attr('y', (d) => vis.yScale(vis.contextData[d]) - vis.xScale.bandwidth())
      .attr('x', (d) => vis.xScale(d))
      .on('mouseover', function (d) {
        d3.select(this).attr('fill', '#FCFEF0');
        div.transition().duration(200).style('opacity', 0.9);
        div
          .html(vis.formatTooltip(d))
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 40 + 'px');
      })
      .on('mouseout', function (d) {
        d3.select(this).attr('fill', '#799eed');
        div.transition().duration(500).style('opacity', 0);
      });

    contextDataGlyphs
      .merge(glyphsEnter)
      .transition()
      .duration(1000)
      .attr(
        'y',
        (d) => vis.yScale(vis.contextData[d]) - vis.xScale.bandwidth()
      );

    contextData
      .merge(contextDataEnter)
      .transition()
      .duration(1000)
      .attr('y', (d) => vis.yScale(vis.contextData[d]))
      .attr('x', (d) => vis.xScale(d))
      .attr('height', (d) => +(vis.height - vis.yScale(vis.contextData[d])))
      .attr('opacity', (d) => {
        if (vis.region == 'none') {
          return '1.00';
        } else {
          return '0.20';
        }
      });

    contextDataGlyphs.exit().remove();
    contextData.exit().remove();
    ///

    let data = vis.chart
      .selectAll('#regionBars')
      .data(Object.keys(vis.regionData));
    // TODO Keep all regions bars
    // embed selected region bar on top of above bars
    //
    let dataEnter = data
      .enter()
      .append('rect')
      .attr('id', 'regionBars')
      .attr('fill', (d) => {
        if (d === 'House Arryn') {
          return '#382b5c';
        } else if (d === 'House Baratheon') {
          return '#2b5c44';
        } else if (d === 'House Greyjoy') {
          return '#5a7d96';
        } else if (d === 'House Lannister') {
          return '#c79634';
        } else if (d === 'House Martell') {
          return '#8e31b0';
        } else if (d === 'House Targaryen') {
          return '#d43939';
        } else if (d === 'House Tully') {
          return '#286eb8';
        } else if (d === 'House Tyrell') {
          return '#576957';
        } else if (d === 'House Stark') {
          return '#728287';
        } else if (d === 'House Bolton') {
          return '#30154d';
        } else if (d === 'Dothraki') {
          return '#474007';
        } else if (d === 'Sons of the Harpy') {
          return '#41007d';
        } else if (d === "Night's Watch") {
          return 'black';
        } else {
          return '#525252';
        }
      })
      .attr('y', (d) => vis.yScale(vis.regionData[d]))
      .attr('x', (d) => vis.xScale(d))
      .attr('width', vis.xScale.bandwidth())
      .attr('height', (d) => +(vis.height - vis.yScale(vis.regionData[d])))
      .attr('stroke', 'red')
      .attr('stroke-width', '3px')
      .on('mouseover', function (d) {
        //
      })
      .on('mouseout', function (d) {
        //
      });

    data
      .merge(dataEnter)
      .transition()
      .duration(1000)
      .attr('y', (d) => vis.yScale(vis.regionData[d]))
      .attr('x', (d) => vis.xScale(d))
      .attr('height', (d) => +(vis.height - vis.yScale(vis.regionData[d])));

    data.exit().remove();

    console.log(vis.region);
    this.createLegend();
  }

  createLegend() {
    let vis = this;
    console.log('ADAS');
    d3.select('#barlegend').remove();
    let legendG = d3
      .select(vis.config.parentElement)
      .append('g')
      .attr('id', 'barlegend')
      .attr('background', 'white');

    let barsG = legendG.append('g').attr('transform', () => {
      if (vis.region === 'none') {
        return `translate(${vis.width * 0.5},60)`;
      } else {
        return `translate(${vis.width * 0.5 - 150},60)`;
      }
    });
    barsG.transition().duration(1000);
    barsG
      .append('rect')
      .attr('x', 0)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#382b5c')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 10)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#2b5c44')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 20)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#5a7d96')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 30)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#c79634')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 40)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#8e31b0')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 50)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#d43939')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 60)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#286eb8')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 70)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#576957')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 80)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#728287')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 90)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#30154d')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 100)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#474007')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 110)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#41007d')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 120)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', 'black')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');
    barsG
      .append('rect')
      .attr('x', 130)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#525252')
      .attr('opacity', () => {
        if (vis.region !== 'none') {
          return '0.3';
        } else {
          return '1.0';
        }
      })
      .attr('stroke', 'black');

    let redbarsG = legendG
      .append('g')
      .attr('transform', `translate(${vis.width / 2 + 50},60)`);
    redbarsG.transition().duration(1000);
    redbarsG
      .append('rect')
      .attr('x', 70)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#382b5c')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 80)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#2b5c44')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 90)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#5a7d96')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 100)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#c79634')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 110)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#8e31b0')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 120)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#d43939')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 130)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#286eb8')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 140)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#576957')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 150)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#728287')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 160)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#30154d')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 170)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#474007')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 180)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#41007d')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 190)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', 'black')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');
    redbarsG
      .append('rect')
      .attr('x', 200)
      .attr('height', 15)
      .attr('width', 10)
      .attr('fill', '#525252')
      .attr('stroke', 'red')
      .attr('stroke-width', '1px');

    if (vis.region === 'none') {
      redbarsG.attr('display', 'none');
    }

    let region;
    if (vis.region === 'New Gift') {
      region = 'The Wall';
    } else {
      region = vis.region;
    }

    barsG
      .append('text')
      .attr('x', 0)
      .attr('y', -7)
      .text('Deaths in All Regions')
      .style('font-size', '15px')
      .attr('transform', 'translate(-14,-5)')
      .attr('alignment-baseline', 'middle');
    redbarsG
      .append('text')
      .attr('x', 68)
      .attr('y', -7)
      .text('Deaths in ')
      .attr('transform', 'translate(-14,-5)')
      .style('font-size', '15px')
      .attr('alignment-baseline', 'middle');
    redbarsG
      .append('text')
      .attr('x', 150)
      .attr('y', -7)
      .text(region)
      .attr('transform', 'translate(-14,-5)')
      .attr('alignment-baseline', 'middle')
      .attr('class', 'regionText');
  }

  formatTooltip(d) {
    console.log(d);
    let vis = this;
    let html = '<b> Allegiance: </b>' + d + '</br></br>';
    if (d === 'House Arryn') {
      html +=
        '<i><b>As High As Honor</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'House Baratheon') {
      html +=
        '<i><b>Ours is the Fury</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'House Greyjoy') {
      html +=
        '<i><b>We Do Not Sow</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'House Lannister') {
      html +=
        '<i><b>Hear Me Roar!</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'House Martell') {
      html +=
        '<i><b>Unbowed, Unbent, Unbroken</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'House Targaryen') {
      html +=
        '<i><b>Fire and Blood</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'House Tully') {
      html +=
        '<i><b>Family, Duty, Honor</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'House Tyrell') {
      html +=
        '<i><b>Growing Strong</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'House Stark') {
      html +=
        '<i><b>Winter Is Coming</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'House Bolton') {
      html +=
        '<i><b>A Naked Man Has Few Secrets, but a Flayed Man Has None</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'Dothraki') {
      html +=
        '<i><b>Me Zisosh Disse</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === "Night's Watch") {
      html +=
        '<i><b>I Am The Sword In The Darkness</i></b></br>' +
        '</br><b>Total Deaths: </b>' +
        vis.contextData[d];
    } else if (d === 'Other' || d === 'Sons of the Harpy') {
      html += '<b>Total Deaths: </b>' + vis.contextData[d];
    }

    if (vis.region !== 'none') {
      html += '</br><b>Deaths in ' + vis.region + ':</b> ' + vis.regionData[d];
    }
    return html;
  }
}
