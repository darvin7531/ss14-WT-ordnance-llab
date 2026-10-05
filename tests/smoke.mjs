import assert from 'node:assert/strict';
import { CHEMS, PRESETS } from '../src/data.js';
import { CHEM_DETAILS } from '../src/chem-info.js';
import { calculateStats } from '../src/engine/ordnance.js';
import { analyzeIngredients } from '../src/engine/ingredients.js';

const mix=p=>Object.entries(p.mix).map(([chem,u])=>({chem,u}));
const oldSun=PRESETS.find(p=>p.id==='m15_sun');
const mk2=PRESETS.find(p=>p.id==='m15_sun_mk2');
assert(oldSun && mk2,'sun presets missing');

const oldStats=calculateStats('m15',mix(oldSun));
assert.equal(oldStats.fireActual.intensity,30);
assert.equal(oldStats.fireActual.radius,6);
assert.equal(oldStats.fireActual.duration,32);
assert(Math.abs(oldStats.power-2.4)<0.02);

const carbon=analyzeIngredients('m15',mix(oldSun)).find(x=>x.id==='carbon');
assert(carbon);
assert.equal(carbon.combatZero,true);
assert.equal(carbon.usefulness,'cosmetic');

const mk2Stats=calculateStats('m15',mix(mk2));
assert.equal(mk2Stats.fireActual.intensity,30);
assert.equal(mk2Stats.fireActual.radius,6);
assert.equal(mk2Stats.fireActual.duration,32);
assert(Math.abs(mk2Stats.power-92.4)<0.05);

const napalmOnly=calculateStats('m15',[{chem:'napalm',u:70}]);
assert.equal(napalmOnly.fireEntity,'RMCTileFireNapalmBase');
const coloredNapalm=calculateStats('m15',[{chem:'napalm',u:70},{chem:'phosphorus',u:1}]);
assert.equal(coloredNapalm.fireEntity,'STTileFireDynamic');
assert(coloredNapalm.fireColor);

for(const id of Object.keys(CHEMS)) assert(CHEM_DETAILS[id],`Missing CHEM_DETAILS for ${id}`);
console.log('smoke ok');
