import { CHEMS, RECIPES, STOCKED, SENSITIVE } from '../data.js';
import { fmt } from './ordnance.js';

const ceilQ=(v,q)=>q>0?Math.ceil((v-1e-9)/q)*q:v;
export const MAX_PRODUCTION_COUNT=100;

// Количество изделий влияет на план производства, но не на характеристики отдельного заряда.
export function clampProductionCount(value){
  const n=Number(value);
  return Number.isFinite(n)?Math.max(1,Math.min(MAX_PRODUCTION_COUNT,Math.trunc(n))):1;
}

export function scaleProductionMix(mix,count=1){
  const n=clampProductionCount(count);
  const amounts=new Map();
  for(const row of mix||[]){
    if(!CHEMS[row.chem]||CHEMS[row.chem].available===false)continue;
    const u=Number(row.u);
    if(!Number.isFinite(u)||u<=0)continue;
    amounts.set(row.chem,(amounts.get(row.chem)||0)+u*n);
  }
  return [...amounts].map(([chem,u])=>({chem,u}));
}

// Крупные партии показываем компактно, не генерируя тысячи строк рецептов.
export function summarizeBatches(batches){
  const groups=[];
  for(const amount of batches){
    const last=groups.at(-1);
    if(last&&Math.abs(last.amount-amount)<1e-8)last.count++;
    else groups.push({amount,count:1});
  }
  return groups.map(g=>g.count>1?`${g.count} × ${fmt(g.amount)}`:`${fmt(g.amount)}`).join(' + ');
}

export function planProduction(mix,{count=1,useStocked=true}={}){
  const quantity=clampProductionCount(count);
  const totalMix=scaleProductionMix(mix,quantity);
  const expanded=expandProduction(totalMix,{useStocked});
  return {
    count:quantity,totalMix,
    totalVolume:totalMix.reduce((sum,row)=>sum+row.u,0),
    expanded,
    steps:productionSteps(expanded),
    notes:safetyNotes(expanded),
  };
}

export function splitBatches(total,limit){
  if(limit<=0) return [];
  const out=[]; let left=total;
  while(left>1e-9){const n=Math.min(left,limit);out.push(n);left-=n;}
  return out;
}

export function expandProduction(mix,{useStocked=true}={}){
  const demand={};
  for(const row of mix){demand[row.chem]=(demand[row.chem]||0)+row.u;}
  const craft={};
  const raw={};
  const visiting=new Set();

  function need(id,amount){
    if(amount<=1e-9) return;
    const chem=CHEMS[id];
    const recipe=RECIPES[id];
    if(!chem){raw[id]=(raw[id]||0)+amount;return;}
    if(useStocked && STOCKED.has(id)){raw[id]=(raw[id]||0)+amount;return;}
    if(!recipe || chem.available===false){raw[id]=(raw[id]||0)+amount;return;}
    if(visiting.has(id)){raw[id]=(raw[id]||0)+amount;return;}
    visiting.add(id);
    const output=ceilQ(amount,recipe.quantum||1);
    craft[id]=(craft[id]||0)+output;
    for(const [inp,ratio] of Object.entries(recipe.inputs||{})) need(inp,output*ratio);
    visiting.delete(id);
  }
  for(const [id,u] of Object.entries(demand)) need(id,u);
  return {demand,craft,raw};
}

export function productionSteps(expanded){
  const order=['methane','ammonia','polytrinic','ammonium_nitrate','glycerol','formaldehyde','hexamine','paraformaldehyde','anfo','nitroglycerin','cyclonite','octogen','napalm','clf3','napalm_sticky','napalm_hc'];
  const steps=[];
  for(const id of order){
    const total=expanded.craft[id]||0;
    if(!total) continue;
    const recipe=RECIPES[id];
    const batches=recipe.batch?splitBatches(total,recipe.batch):[total];
    if(recipe.machine==='freezer'){
      // Одновременно обрабатываются до 3 мензурок; каждая ограничена batch (60u).
      // На больших объёмах нужны несколько загрузок, а не три безразмерные ёмкости.
      const capacity=recipe.batch||60;
      const loads=[];
      let remaining=total;
      while(remaining>1e-9){
        const loadTotal=Math.min(remaining,capacity*3);
        const count=Math.min(3,Math.max(1,Math.ceil(loadTotal/3)));
        const containers=[];
        let left=loadTotal;
        for(let i=0;i<count;i++){
          const share=Math.min(capacity,Math.ceil((left/(count-i))/3)*3);
          const amount=Math.min(left,share);
          if(amount>1e-9)containers.push(amount);
          left-=amount;
        }
        const seconds=Math.max(...containers.map(amount=>Math.ceil(amount/3)))*20;
        loads.push({containers,seconds});
        remaining-=loadTotal;
      }
      steps.push({
        id,total,type:'machine',recipe,
        containers:loads[0]?.containers||[],loads,
        seconds:loads.reduce((sum,load)=>sum+load.seconds,0),
      });
      continue;
    }
    steps.push({id,total,type:'reaction',batches,recipe,sensitive:SENSITIVE[id]||null});
  }
  return steps;
}

export function sourceLabel(id,useStocked=true){
  const c=CHEMS[id];
  if(!c) return 'неизвестный источник';
  if(useStocked && STOCKED.has(id)) return 'штатный бак OT';
  if(c.sourceKind==='external') return c.source||'внешний источник';
  if(c.sourceKind==='machine') return 'промышленная морозилка OT';
  if(RECIPES[id]) return 'изготовить';
  return 'диспенсер / внешний источник';
}

export function safetyNotes(expanded){
  const notes=[];
  for(const [id,total] of Object.entries(expanded.craft)){
    const meta=SENSITIVE[id];
    if(!meta) continue;
    if(meta.safeProduct<=0){notes.push({tone:'danger',text:`${meta.name}: безопасного ненулевого замеса нет.`});continue;}
    const parts=splitBatches(total,meta.safeProduct);
    if(parts.length>1) notes.push({tone:'warn',text:`${meta.name}: ${total} ед. дели на ${parts.length} партии: ${summarizeBatches(parts)}. Не смешивай исходники на весь объём сразу.`});
    else notes.push({tone:'ok',text:`${meta.name}: ${total} ед. помещаются в одну безопасную партию (до ${meta.safeProduct}).`});
  }
  return notes;
}

function solutionMap(parts){
  const m={};
  for(const p of parts||[]) m[p.chem]=(m[p.chem]||0)+(Number(p.u)||0);
  return m;
}

export function analyzeSolutionHazards(parts,label='Ёмкость'){
  const m=solutionMap(parts);
  const out=[];
  const get=id=>m[id]||0;

  // ANFO: actual reaction is 2 AN + 1 welding fuel -> 2 ANFO; Sensitive threshold is reaction extent > 60.001.
  let extent=Math.min(get('ammonium_nitrate')/2,get('welding_fuel'));
  if(extent>0){
    const product=extent*2;
    out.push({tone:extent>60.001?'danger':'warn',text:`${label}: аммиачная селитра + сварочное топливо сами превратятся примерно в ${product.toFixed(2)} ед. АНФО.${extent>60.001?' Размер одной реакции превышает threshold 60.001 — риск немедленного взрыва.':''}`});
  }

  extent=Math.min(get('glycerol'),get('polytrinic'),get('sulfuric_acid'));
  if(extent>0){
    const product=extent*2;
    out.push({tone:extent>5.001?'danger':'warn',text:`${label}: прекурсоры нитроглицерина дадут ≈ ${product.toFixed(2)} ед.${extent>5.001?' Это выше безопасного reaction threshold.':''}`});
  }

  extent=Math.min(get('water'),get('potassium'));
  if(extent>0) out.push({tone:'danger',text:`${label}: вода + калий запускают реакцию гидроксида калия с threshold 0. Не держи их вместе.`});

  // Good napalm priority is higher than bad napalm. Consume the safe reaction first, then inspect dangerous leftovers.
  const nap=Math.min(get('water'),get('phoron'),get('aluminium'),get('sulfuric_acid'));
  const pLeft=get('phoron')-nap, aLeft=get('aluminium')-nap, sLeft=get('sulfuric_acid')-nap;
  if(Math.min(pLeft,aLeft,sLeft)>1e-9) out.push({tone:'danger',text:`${label}: после безопасной napalm-реакции остаются форон + алюминий + серная кислота без достаточной воды — может стартовать RMCNapalmBad (threshold 0).`});

  const clf=Math.min(get('water')/3,get('chlorine'),get('fluorine')/3);
  const cLeft=get('chlorine')-clf, fLeft=get('fluorine')-clf*3;
  if(Math.min(cLeft,fLeft/3)>1e-9) out.push({tone:'danger',text:`${label}: остаются хлор + фтор без достаточной воды — возможна RMCCLF3Bad (threshold 0).`});

  // These are not inherently explosive, but the payload will no longer contain the entered precursors.
  const oct=Math.min(get('paraformaldehyde'),get('ammonium_nitrate'),get('hexamine'),get('polytrinic'));
  if(oct>0) out.push({tone:'info',text:`${label}: полный набор прекурсоров октогена среагирует раньше циклонита (priority 5) и даст ≈ ${(oct*2).toFixed(2)} ед. октогена.`});
  else {
    const cyc=Math.min(get('hexamine'),get('polytrinic'));
    if(cyc>0) out.push({tone:'info',text:`${label}: гексамин + политриновая кислота превратятся примерно в ${cyc.toFixed(2)} ед. циклонита.`});
  }
  return out;
}
