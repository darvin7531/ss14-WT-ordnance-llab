import { CASINGS, CHEMS } from '../data.js';

export const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
export const f32 = v => Math.fround(v);
export function roundToEven(v){
  const lo=Math.floor(v), frac=v-lo;
  if(frac<0.5)return lo; if(frac>0.5)return lo+1; return lo%2===0?lo:lo+1;
}
export const round2 = v => Math.round(v * 100) / 100;
export const fmt = n => !Number.isFinite(n) ? '—' : (Math.abs(n-Math.round(n))<1e-9 ? String(Math.round(n)) : String(round2(n)));

export function normalizeMix(mix){
  const map = new Map();
  for(const row of mix || []){
    if(!CHEMS[row.chem] || CHEMS[row.chem].available===false) continue;
    const u = Math.max(0, Number(row.u)||0);
    if(!u) continue;
    map.set(row.chem, (map.get(row.chem)||0)+u);
  }
  return [...map].map(([chem,u])=>({chem,u}));
}

export function totalVolume(mix){
  return normalizeMix(mix).reduce((a,x)=>a+x.u,0);
}

export function calculateStats(casingId, mix, {blastDampener=false, vesselParts=null}={}){
  const casing = CASINGS[casingId];
  if(!casing) throw new Error(`Unknown casing ${casingId}`);
  const rows = normalizeMix(mix);
  let powerRaw=f32(0), falloffRaw=f32(casing.baseFalloff);
  let fireIntensityRaw=f32(0), fireRadiusRaw=f32(0), fireDurationRaw=f32(0);
  let ironTotal=0;

  for(const {chem,u} of rows){
    const c=CHEMS[chem];
    const q=f32(u);
    powerRaw=f32(powerRaw + f32(q*f32(c.p)));
    falloffRaw=f32(falloffRaw + f32(q*f32(c.f)));
    fireIntensityRaw=f32(fireIntensityRaw + f32(q*f32(c.i)));
    fireRadiusRaw=f32(fireRadiusRaw + f32(q*f32(c.r)));
    fireDurationRaw=f32(fireDurationRaw + f32(q*f32(c.d)));
    if(c.shrapnel) ironTotal += u;
  }

  const power=f32(Math.min(powerRaw,casing.powerCap));
  const falloffBeforeDamp=f32(Math.max(falloffRaw,casing.minFalloff));
  const falloff=blastDampener ? f32(falloffBeforeDamp*2) : falloffBeforeDamp;

  let shards=0;
  if(power>0){
    // Сервер floors железо для каждого ReagentQuantity отдельно. Если известна упаковка по мензуркам — считаем её.
    if(Array.isArray(vesselParts) && vesselParts.length){
      for(const vessel of vesselParts){
        for(const part of vessel.parts||[]){
          if(part.chem==='iron') shards += Math.trunc(part.u*0.25);
        }
      }
    } else {
      shards=Math.trunc(ironTotal*0.25);
    }
  }
  shards=Math.min(shards,casing.shardCap);

  let fireIntensity=0,fireRadius=0,fireDuration=0;
  if(fireIntensityRaw>0){
    fireIntensity=f32(clamp(fireIntensityRaw,casing.fire.i[0],casing.fire.i[1]));
    fireRadius=f32(clamp(fireRadiusRaw,casing.fire.r[0],casing.fire.r[1]));
    fireDuration=f32(clamp(fireDurationRaw,casing.fire.d[0],casing.fire.d[1]));
  }

  // ExecuteExplosion casts these to int before spawning tile fire.
  const fireActual={
    intensity: fireIntensity>0 ? Math.trunc(fireIntensity) : 0,
    radius: fireRadius>0 ? Math.trunc(fireRadius) : 0,
    duration: fireDuration>0 ? Math.trunc(fireDuration) : 0,
  };
  const fireShape = fireActual.intensity>30 && casing.allowStarShape ? 'star' : (fireActual.intensity>0?'diamond':'none');
  const fireRayRange = fireShape==='star' ? Math.min(roundToEven(f32(fireRadius*1.5)), Math.trunc(casing.fire.r[1])) : 0;

  return {
    casingId,casing,rows,volume:rows.reduce((a,x)=>a+x.u,0),
    powerRaw,power,falloffRaw,falloffBeforeDamp,falloff,blastDampener,
    shards,ironTotal,
    fireIntensityRaw,fireRadiusRaw,fireDurationRaw,
    fireIntensity,fireRadius,fireDuration,fireActual,fireShape,fireRayRange,
  };
}

export function engineParams(stats){
  if(stats.power<=0 || stats.falloff<=0) return {totalIntensity:0,slope:0,maxIntensity:0,radiusParameter:0,stepSize:0};
  const maxIntensity=f32(stats.power/5);
  const slope=f32(Math.max(f32(stats.falloff/5),0.1));
  const radiusParameter=f32(maxIntensity/slope);
  const calcRadius=f32(Math.max(0,f32(radiusParameter-1)));
  const totalIntensity=f32(Math.PI/3*slope*Math.pow(calcRadius,3));
  return {totalIntensity,slope,maxIntensity,radiusParameter,stepSize:f32(slope/2)};
}

export function packFinalBeakers(casingId,mix){
  const casing=CASINGS[casingId];
  const rows=normalizeMix(mix);
  const capacities=[];
  const requested=rows.reduce((a,x)=>a+x.u,0);
  let remaining=Math.min(requested,casing.volume);
  let budget=casing.volume;
  while(remaining>1e-9 && budget>=60){
    const cap=(remaining>60 && budget>=120)?120:60;
    capacities.push(cap);
    remaining=Math.max(0,remaining-cap);
    budget-=cap;
  }
  const vessels=capacities.map((capacity,i)=>({name:`Мензурка ${i+1}`,capacity,parts:[],used:0}));

  // Железо группируем первым: так меньше риск потерять осколки на floor() между разными ReagentQuantity.
  const ordered=[...rows].sort((a,b)=>(a.chem==='iron'?-1:0)-(b.chem==='iron'?-1:0));
  let vi=0;
  for(const row of ordered){
    let left=row.u;
    while(left>1e-9 && vi<vessels.length){
      const v=vessels[vi];
      const take=Math.min(left,v.capacity-v.used);
      if(take>1e-9){v.parts.push({chem:row.chem,u:take});v.used+=take;left-=take;}
      if(v.capacity-v.used<1e-9)vi++;
    }
  }
  return vessels;
}
