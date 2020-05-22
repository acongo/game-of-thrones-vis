let methodMap = new Map();
methodMap.set('Sword', 'Blade');
methodMap.set('Knife', 'Blade');
methodMap.set('Spear', 'Blade');
methodMap.set('Axe', 'Blade');
methodMap.set('Ice Javelin', 'Blade');
methodMap.set('Steak', 'Blade');
methodMap.set('Arakh', 'Blade');
methodMap.set('Arrow', 'Arrow');
methodMap.set('Flaming arrow', 'Arrow');
methodMap.set('Giant arrow', 'Arrow');
methodMap.set('Hammer', 'Blunt Trauma');
methodMap.set('Club', 'Blunt Trauma');
methodMap.set('Hands', 'Blunt Trauma');
methodMap.set('Rubble', 'Blunt Trauma');
methodMap.set('Bell', 'Blunt Trauma');
methodMap.set('Poison', 'Poison');
methodMap.set('Poison dart', 'Poison');
methodMap.set('Antler', 'Teeth/Tusk/Claws');
methodMap.set('Teeth', 'Teeth/Tusk/Claws');
methodMap.set('Tusk', 'Teeth/Tusk/Claws');
methodMap.set('Rat', 'Teeth/Tusk/Claws');
methodMap.set('Dogs', 'Teeth/Tusk/Claws');
methodMap.set('Claws', 'Teeth/Tusk/Claws');
methodMap.set('Fire', 'Fire');
methodMap.set('Wildfire', 'Fire');
methodMap.set('Dragonfire (Dragon)', 'Fire');
methodMap.set('Rope', 'Strangulation');
methodMap.set('Noose', 'Strangulation');
methodMap.set('Pillow', 'Strangulation');
methodMap.set('Hands/Necklace', 'Strangulation');
methodMap.set('Shadow Demon', 'Magic');
methodMap.set('Magic', 'Magic');
methodMap.set('Falling', 'Falling');
methodMap.set('Moon Door', 'Falling');

let methodGroups = [
  'Blade',
  'Arrow',
  'Blunt Trauma',
  'Poison',
  'Teeth/Tusk/Claws',
  'Fire',
  'Strangulation',
  'Magic',
  'Falling',
  'Other',
];

let methodColors = [
  '#1f77b4', //Blue
  '#74d489', //Seafoam
  '#ff7f0e', //Orange
  '#278f36', //Green
  '#c4ae6a', //Brown
  '#d62728', //Red
  '#e377c2', //Pink
  '#831ab8', //Purple
  '#17becf', //Cyan
  '#f0e443', //Yellow
];
export { methodMap, methodGroups, methodColors };
