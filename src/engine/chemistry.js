import { CHEMS, RECIPES, STOCKED, SENSITIVE } from '../data.js';

const ceilQ=(v,q)=>q>0?Math.ceil((v-1e-9)/q)*q:v;

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
      // Machine consumes 3+3 →3 every 20s per container, max 3 containers each interval.
      // Для минимального времени используем до трёх ёмкостей параллельно даже на объёмах < 60u.
      // Например 54u = 18/18/18 → 6 циклов → 120 секунд вместо 360 секунд в одной ёмкости.
      const containers=Math.min(3,Math.max(1,Math.ceil(total/3)));
      const per=[];
      let left=total;
      for(let i=0;i<containers;i++){
        const share=Math.ceil((left/(containers-i))/3)*3;
        const amount=Math.min(left,share); per.push(amount); left-=amount;
      }
      const cycles=Math.max(...per.map(x=>Math.ceil(x/3)));
      steps.push({id,total,type:'machine',containers:per,seconds:cycles*20,recipe});
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
    if(parts.length>1) notes.push({tone:'warn',text:`${meta.name}: ${total} ед. дели на ${parts.length} партии: ${parts.join(' + ')}. Не смешивай исходники на весь объём сразу.`});
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
