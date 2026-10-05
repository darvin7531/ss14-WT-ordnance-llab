import { state, setState } from '../state.js';
import { CHEMS, RECIPES } from '../data.js';
import { expandProduction, productionSteps, safetyNotes, sourceLabel } from '../engine/chemistry.js';
import { fmt, packFinalBeakers } from '../engine/ordnance.js';
import { mixtureText } from '../ui.js';

function inputsText(step,batch){
  return Object.entries(step.recipe.inputs||{}).map(([id,ratio])=>`${CHEMS[id]?.name||id} ${fmt(batch*ratio)}`).join(' + ');
}

export function renderChemistry(root){
  const exp=expandProduction(state.mix,{useStocked:state.useStocked});
  const steps=productionSteps(exp);
  const notes=safetyNotes(exp);
  const raw=Object.entries(exp.raw).sort((a,b)=>b[1]-a[1]);
  root.innerHTML=`
    <div class="page-head"><div><span class="eyebrow">производство</span><h1>Химия по шагам</h1><p>${mixtureText(state.mix)}</p></div><label class="switch"><input id="stockToggle" type="checkbox" ${state.useStocked?'checked':''}><span></span><b>Штатные баки готовы</b></label></div>
    <div class="two-col chemistry-layout">
      <div>
        <section class="panel"><div class="panel-head"><div><span class="eyebrow">Сырьё</span><h2>Что должно быть под рукой</h2></div></div><div class="need-list">${raw.map(([id,u])=>`<div class="need-row"><span>${CHEMS[id]?.name||id}<small>${sourceLabel(id,state.useStocked)}</small></span><b>${fmt(u)} ед.</b></div>`).join('')}</div></section>
        ${notes.length?`<section class="panel"><div class="panel-head"><div><span class="eyebrow">Безопасность</span><h2>Не взорви химлабу</h2></div></div><div class="alerts">${notes.map(n=>`<div class="alert ${n.tone}">${n.text}</div>`).join('')}</div></section>`:''}
      </div>
      <div>
        <section class="panel"><div class="panel-head"><div><span class="eyebrow">Маршрут</span><h2>${steps.length} производственных шагов</h2></div></div>
          <div class="recipe-steps">${steps.map((s,i)=>{
            if(s.type==='machine') return `<article class="recipe-step machine"><div class="recipe-num">${i+1}</div><div><div class="recipe-title"><b>${CHEMS[s.id].name} — ${fmt(s.total)} ед.</b><span class="badge machine">морозилка</span></div><p>Смешай формальдегид + воду 1:1. Разложи по ${s.containers.length} ёмкостям: <b>${s.containers.map(fmt).join(' / ')}</b> ед. продукта на ёмкость. Закрой Industry Freezer.</p><div class="recipe-meta"><span>≈ ${Math.floor(s.seconds/60)}:${String(s.seconds%60).padStart(2,'0')}</span><span>цикл 20 сек</span><span>3 ед./цикл/ёмкость</span></div></div></article>`;
            return `<article class="recipe-step"><div class="recipe-num">${i+1}</div><div><div class="recipe-title"><b>${CHEMS[s.id].name} — ${fmt(s.total)} ед.</b>${s.sensitive?'<span class="badge danger">чувствительная</span>':''}${s.recipe.vessel==='silver'?'<span class="badge machine">серебряная мензурка</span>':''}</div>${s.batches.map((b,j)=>`<p><b>${s.batches.length>1?`Партия ${j+1}: `:''}</b>${inputsText(s,b)} → ${CHEMS[s.id].name} ${fmt(b)}</p>`).join('')}<small>${s.recipe.note||''}</small></div></article>`;
          }).join('')}</div>
        </section>
      </div>
    </div>`;
  root.querySelector('#stockToggle').onchange=e=>setState({useStocked:e.target.checked});
}
