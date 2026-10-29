import assert from 'node:assert/strict';
import { CHEMS, PRESETS } from '../src/data.js';
import { CHEM_DETAILS } from '../src/chem-info.js';
import { calculateStats } from '../src/engine/ordnance.js';
import { analyzeIngredients } from '../src/engine/ingredients.js';
import { clampProductionCount, planProduction, summarizeBatches } from '../src/engine/chemistry.js';

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
// Производственный счётчик отделён от боевого: смесь на единицу не меняется.
assert.equal(clampProductionCount(0),1);
assert.equal(clampProductionCount('7'),7);
assert.equal(clampProductionCount(101),100);
assert.equal(clampProductionCount('not-a-number'),1);

const shortMix=[{chem:'anfo',u:5},{chem:'iron',u:1}];
const singlePlan=planProduction(shortMix,{count:1,useStocked:true});
const triplePlan=planProduction(shortMix,{count:3,useStocked:true});
assert.deepEqual(singlePlan.totalMix,[{chem:'anfo',u:5},{chem:'iron',u:1}]);
assert.deepEqual(triplePlan.totalMix,[{chem:'anfo',u:15},{chem:'iron',u:3}]);
assert.equal(triplePlan.count,3);
assert.equal(triplePlan.totalVolume,18);
// Рецепт округляется после суммирования потребностей, а не 3 раза по отдельности.
assert.equal(singlePlan.expanded.craft.anfo,6);
assert.equal(triplePlan.expanded.craft.anfo,16);
assert.equal(triplePlan.expanded.raw.welding_fuel,8);
assert.equal(triplePlan.steps.find(s=>s.id==='anfo').batches.length,1);
assert.equal(summarizeBatches([120,120,15]),'2 × 120 + 15');
const hugePlan=planProduction([{chem:'anfo',u:120}],{count:50,useStocked:true});
assert.equal(hugePlan.steps.find(s=>s.id==='anfo').batches.length,50);
assert(hugePlan.notes.find(s=>s.text.includes('50 × 120')));

// Industry Freezer: не более 3 ёмкостей с ограничением 60u на одну загрузку.
const smallFreezer=planProduction([{chem:'paraformaldehyde',u:54}],{count:1});
const smallLoad=smallFreezer.steps.find(s=>s.id==='paraformaldehyde');
assert.deepEqual(smallLoad.loads[0].containers,[18,18,18]);
assert.equal(smallLoad.seconds,120);
const largeFreezer=planProduction([{chem:'paraformaldehyde',u:3}],{count:100});
const freezerStep=largeFreezer.steps.find(s=>s.id==='paraformaldehyde');
assert.equal(freezerStep.total,300);
assert.equal(freezerStep.loads.length,2);
assert(freezerStep.loads.every(l=>l.containers.length<=3&&l.containers.every(u=>u<=60)));

console.log('smoke ok');
