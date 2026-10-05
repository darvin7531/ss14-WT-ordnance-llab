import { CHEMS } from '../data.js';
import { CHEM_DETAILS } from '../chem-info.js';
import { calculateStats, normalizeMix, packFinalBeakers } from './ordnance.js';

const near=(a,b,eps=1e-6)=>Math.abs(a-b)<=eps;

function statsFor(casingId,mix,blastDampener){
  const vessels=packFinalBeakers(casingId,mix);
  return calculateStats(casingId,mix,{blastDampener,vesselParts:vessels});
}

export function analyzeIngredients(casingId,mix,{blastDampener=false}={}){
  const rows=normalizeMix(mix);
  const base=statsFor(casingId,rows,blastDampener);
  return rows.map(row=>{
    const without=rows.filter(x=>x.chem!==row.chem);
    const alt=statsFor(casingId,without,blastDampener);
    const c=CHEMS[row.chem];
    const d=CHEM_DETAILS[row.chem]||{};
    const nominal={
      power:row.u*(c.p||0),
      falloff:row.u*(c.f||0),
      intensity:row.u*(c.i||0),
      radius:row.u*(c.r||0),
      duration:row.u*(c.d||0),
      shards:c.shrapnel?Math.floor(row.u*.25):0,
    };
    // Positive effective.falloff means the ingredient improved blast spread by lowering final Falloff.
    const effective={
      power:base.power-alt.power,
      falloff:alt.falloff-base.falloff,
      intensity:base.fireActual.intensity-alt.fireActual.intensity,
      radius:base.fireActual.radius-alt.fireActual.radius,
      duration:base.fireActual.duration-alt.fireActual.duration,
      shards:base.shards-alt.shards,
    };
    const fireEntityChanged=base.fireEntity!==alt.fireEntity || base.firePenetrating!==alt.firePenetrating;
    const colorChanged=base.fireColor!==alt.fireColor;
    const numericZero=Object.values(effective).every(v=>near(v,0));
    const combatZero=numericZero && !fireEntityChanged;
    const notes=[];
    if(nominal.power>0 && effective.power+1e-6<nominal.power) notes.push(`из ${trim(nominal.power)} nominal Power реально остаётся +${trim(effective.power)} — остальное съел Power cap`);
    if(nominal.falloff<0 && effective.falloff+1e-6<Math.abs(nominal.falloff)) notes.push(`часть снижения Falloff потеряна из-за Min Falloff/cap-состояния`);
    if(nominal.intensity>0 && effective.intensity<=0) notes.push(`+${trim(nominal.intensity)} raw Intensity не меняет фактический Fire Intensity — уже cap/округление`);
    if(nominal.radius>0 && effective.radius<=0) notes.push(`+${trim(nominal.radius)} raw Radius не меняет фактический Fire Radius — уже cap/округление`);
    if(nominal.duration>0 && effective.duration<=0) notes.push(`+${trim(nominal.duration)} raw Duration не меняет фактический Fire Duration — уже cap/округление`);
    if(c.shrapnel && effective.shards<=0) notes.push('железо не добавило ни одного нового осколка после floor/cap');
    if(fireEntityChanged) notes.push(`меняет тип огня: ${alt.fireEntity} → ${base.fireEntity}${base.firePenetrating?' (penetrating)':''}`);
    if(colorChanged && base.fireColor) notes.push(`меняет итоговый цвет огня на ${base.fireColor}`);
    const visibleColorOnly=numericZero && !fireEntityChanged && colorChanged && base.fireActual.intensity>0;
    if(visibleColorOnly) notes.push('боевые параметры не меняются: реагент фактически работает как краситель/визуальный модификатор');
    else if(combatZero && !colorChanged) notes.push('в этой конкретной смеси реагент не меняет итоговые blast/fire/shard параметры');

    const usefulness=visibleColorOnly?'cosmetic':combatZero?'wasted':(notes.length?'partial':'useful');
    return {id:row.chem,u:row.u,chem:c,detail:d,nominal,effective,combatZero,usefulness,notes,fireEntityChanged,colorChanged,baseFireEntity:base.fireEntity,withoutFireEntity:alt.fireEntity,finalColor:base.fireColor,withoutColor:alt.fireColor};
  });
}

export function mixWarnings(casingId,mix,opts={}){
  return analyzeIngredients(casingId,mix,opts)
    .filter(x=>x.usefulness==='wasted'||x.usefulness==='cosmetic'||x.usefulness==='partial')
    .map(x=>({
      tone:x.usefulness==='wasted'?'warn':x.usefulness==='cosmetic'?'info':'info',
      text:`${x.chem.name} (${trim(x.u)}u): ${x.notes.join('; ')}.`
    }));
}

function trim(v){
  const n=Math.round(v*100)/100;
  return Number.isInteger(n)?String(n):String(n);
}
