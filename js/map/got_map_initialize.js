// Initialize chart
let gotMap = new GotMap({ parentElement: '#map' });
let barChart = new GotBarChart({ parentElement: '#barchart' });

let orig_data = [];

// Load data
Promise.all([
  d3.json('data/got_map_data.topo.json'),
  d3.csv('data/game_of_thrones_deaths.csv'),
]).then((files) => {
  let deaths_data = files[1];

  deaths_data.forEach((d) => {
    const columns = Object.keys(d);
    for (const col of columns) {
      if (col == 'season' || col == 'episode' || col == 'death_no') {
        d[col] = +d[col];
      }
    }
  });

  orig_data = files[1];

  getDeathsForSeason(deaths_data, 1);
  gotMap.barChart = barChart;
  gotMap.got_geo = files[0];
  gotMap.death_data = this.death_data;
  gotMap.render(1);

  barChart.death_data = deaths_data;
  barChart.region = 'none';
  barChart.update();
});

//bins locations from csv file to applicable json region name
function getDeathsForSeason(deaths_data, season) {
  let location_and_deaths = {};

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

  location_and_deaths[beyond_the_wall] = 0;
  location_and_deaths[the_wall] = 0;
  location_and_deaths[the_north] = 0;
  location_and_deaths[the_vale] = 0;
  location_and_deaths[riverlands] = 0;
  location_and_deaths[the_iron_islands] = 0;
  location_and_deaths[the_westerlands] = 0;
  location_and_deaths[the_reach] = 0;
  location_and_deaths[crownsland] = 0;
  location_and_deaths[stormlands] = 0;
  location_and_deaths[dorne] = 0;
  location_and_deaths[other_region] = 0;

  deaths_data.forEach((d) => {
    const columns = Object.keys(d);
    if (d.season == season) {
      if (d.location == beyond_the_wall || d.location == 'Hardhome') {
        location_and_deaths[beyond_the_wall]++;
      } else if (
        d.location == the_wall ||
        d.location == 'Castle Black' ||
        d.location == "Mole's Town" ||
        d.location == "Mole's Town" ||
        d.location == 'The Gift' ||
        d.location == 'The Wall'
      ) {
        location_and_deaths[the_wall]++;
      } else if (
        d.location == the_north ||
        d.location == 'Dreadfort' ||
        d.location == 'Kingsroad' ||
        d.location == 'Last Hearth' ||
        d.location == 'Moat Cailin' ||
        d.location == 'Winterfell'
      ) {
        location_and_deaths[the_north]++;
      }
      //Eastern road begins in Riverlands but ends in the Vale so was classified as the Vale
      else if (
        d.location == the_vale ||
        d.location == 'Eastern Road' ||
        d.location == 'The Eyrie'
      ) {
        location_and_deaths[the_vale]++;
      } else if (
        d.location == riverlands ||
        d.location == 'Harrenhal' ||
        d.location == 'Hollow Hill' ||
        d.location == 'Riverrun' ||
        d.location == "Robb Stark's camp" ||
        d.location == 'The Twins'
      ) {
        location_and_deaths[riverlands]++;
      } else if (
        d.location == the_iron_islands ||
        d.location == 'Iron Islands'
      ) {
        location_and_deaths[the_iron_islands]++;
      } else if (
        d.location == the_westerlands ||
        d.location == 'Casterly Rock' ||
        d.location == 'Oxcross'
      ) {
        location_and_deaths[the_westerlands]++;
      } else if (
        d.location == the_reach ||
        d.location == 'Highgarden' ||
        d.location == 'Roseroad'
      ) {
        location_and_deaths[the_reach]++;
      } else if (
        d.location == crownsland ||
        d.location == "King's Landing" ||
        d.location == 'Dragonstone'
      ) {
        location_and_deaths[crownsland]++;
      } else if (d.location == stormlands || d.location == "Storm's End") {
        location_and_deaths[stormlands]++;
      } else if (d.location == dorne) {
        location_and_deaths[dorne]++;
      } else {
        //includes Astapor, Braavos, The Narrow Sea, areas in Essos, "unkown", vaes dothrak, Valyria
        location_and_deaths[other_region]++;
      }
    }
  });
  this.death_data = location_and_deaths;
  gotMap.death_data = location_and_deaths;
  getMaxAndMinDeathValues();
}

let select_play = document.getElementById('season-selection');
let select_slider = document.getElementById('selectSlider');

// When the button is changed, run the update function
d3.select('#selectSlider').on('input', function (d) {
  // recover the option that has been chosen
  var selectedOption = d3.select(this).property('value');
  select_play.textContent = selectedOption;
  d3.select(select_slider).attr('value', selectedOption);
  getDeathsForSeason(orig_data, selectedOption);
  gotMap.update(selectedOption);
  barChart.season = selectedOption;
  barChart.update();
});

var moving = false;
var timer = 0;
var playButton = d3.select('#play-button');

playButton.on('click', function () {
  let select_playNEW = document.getElementById('season-selection');
  let select_sliderNEW = document.getElementById('selectSlider');

  select_play.textContent = select_slider.value;
  var button = d3.select(this);
  if (button.text() == 'Pause') {
    moving = false;
    clearInterval(timer);
    button.text('Play');
  } else {
    moving = true;
    timer = setInterval(step, 1000);
    button.text('Pause');
  }
});

function step() {
  let season = document.getElementById('season-selection');
  if (select_slider.value < 8) {
    select_slider.stepUp(1);
    season.textContent = select_slider.value.toString();
  } else {
    select_slider.value = 1;
    season.textContent = select_slider.value.toString();
  }
  getDeathsForSeason(orig_data, select_slider.value);
  gotMap.update(select_slider.value);
  barChart.season = select_slider.value;
  barChart.update();
}

function getMaxAndMinDeathValues() {
  gotMap.minDeathValue = 0;
  gotMap.maxDeathValue = 0;
  var arr = Object.keys(this.death_data).map(function (key) {
    return this.death_data[key];
  });
  gotMap.minDeathValue = Math.min.apply(null, arr);
  gotMap.maxDeathValue = Math.max.apply(null, arr);
}
