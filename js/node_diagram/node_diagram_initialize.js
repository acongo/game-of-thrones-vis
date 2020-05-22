import { excludedCharacters } from '../../data/excludedNodeDiagramCharacters.js';
import { characterImages } from '../../data/characterImages.js';
import {
  methodMap,
  methodGroups,
  methodColors,
} from '../../data/killMethodGroups.js';

const numSeasons = 8;
let select_play = document.getElementById('season-selection');
let select_slider = document.getElementById('selectSlider');
let selectedOption = 1;

// When the button is changed, run the update function
d3.select('#selectSlider').on('input', function () {
  // recover the option that has been chosen
  selectedOption = d3.select(this).property('value');
  select_play.textContent = selectedOption;
  d3.select(select_slider).attr('value', selectedOption);
  nodeDiagram.data = dataBySeason[selectedOption];
  nodeDiagram.update();
});

const nodeDiagramConfig = {
  parentElement: '#node-diagram',
  legendElement: '#color-legend',
};

let nodeDiagrams = new NodeDiagram(nodeDiagramConfig);
let dataBySeason = {};

d3.csv('data/game_of_thrones_deaths.csv').then((data) => {
  data = data.filter((death) => !excludedCharacters.includes(death.killer));
  for (let i = 1; i <= numSeasons; ++i) {
    let killers = formatKillerDataForSeason(
      data.filter((d) => +d.season === i)
    );
    let { nodes, links } = getNodesAndLinks(killers);
    dataBySeason[i] = {
      killers: killers,
      nodes: nodes,
      links: links,
    };
  }

  nodeDiagrams.data = dataBySeason[selectedOption];
  nodeDiagrams.characters = characterImages;
  nodeDiagrams.methodGroups = methodGroups;
  nodeDiagrams.methodColors = methodColors;
  nodeDiagrams.update();
});

function getNodesAndLinks(killers) {
  let nodes = [];
  let links = [];
  createNodesAndLinks(killers, nodes, links);
  return {
    nodes: nodes,
    links: links,
  };
}

function formatKillerDataForSeason(data) {
  let killers = new Map();
  data.forEach((death) => {
    if (killers.has(death.killer)) {
      addVictimsAndMethods(killers, death);
    } else {
      createNewKillerObject(killers, death);
    }
  });
  return killers;
}

function addVictimsAndMethods(killers, death) {
  let killer = killers.get(death.killer);
  killer.victims.add(death.name);
  let method = methodMap.get(death.method)
    ? methodMap.get(death.method)
    : 'Other';
  if (killer.methods.has(method)) {
    let count = killer.methods.get(method);
    killer.methods.set(method, ++count);
  } else {
    killer.methods.set(method, 1);
  }
}

function createNewKillerObject(killers, death) {
  killers.set(death.killer, {
    victims: new Set().add(death.name),
    methods: new Map([
      [methodMap.get(death.method) ? methodMap.get(death.method) : 'Other', 1],
    ]),
  });
}

function createNodesAndLinks(killers, nodes, links) {
  // Used to keep track of character data for later node creation
  let characters = new Set();

  createLinks(killers, characters, links);
  createNodes(characters, nodes);
}

function createLinks(killers, characters, links) {
  killers.forEach((killerValue, killer) => {
    if (!excludedCharacters.includes(killer)) {
      let victims = killerValue.victims;
      let hasSignificantKill = false;
      victims.forEach((victim) => {
        if (!excludedCharacters.includes(victim)) {
          hasSignificantKill = true;
          links.push({
            source: killer,
            target: victim,
          });
          characters.add(victim);
        }
      });
      if (hasSignificantKill) {
        characters.add(killer);
      }
    }
  });
}

function createNodes(characters, nodes) {
  characters.forEach((character) => {
    nodes.push({
      id: character,
    });
  });
}
