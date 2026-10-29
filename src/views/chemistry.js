import { state, setState } from '../state.js';
import { CHEMS, RECIPES } from '../data.js';
import { planProduction, summarizeBatches, sourceLabel } from '../engine/chemistry.js';
import { fmt, packFinalBeakers } from '../engine/ordnance.js';
import { mixtureText, productionCountPicker, bindProductionCount } from '../ui.js';

function inputsText(step,batch){
  return Object.entries(step.recipe.inputs||{}).map(([id,ratio])=>`${CHEMS[id]?.name||id} ${fmt(batch*ratio)}`).join(' + ');
}

function batchInstructions(step){
  const batches=step.batches;
  if(batches.length<=5){
    return batches.map((b,j)=>`<p><b>${batches.length>1?`Партия ${j+1}: `:''}</b>${inputsText(step,b)} → ${CHEMS[step.id].name} ${fmt(b)}</p>`).join('');
  }
  const first=batches[0],last=batches.at(-1);
  return `<p><b>Всего ${batches.length} партий:</b> ${summarizeBatches(batches)} ед. готового вещества. Компоненты смешивать отдельно для каждой партии.</p>
    <p><b>Обычная партия:</b> ${inputsText(step,first)} → ${CHEMS[step.id].name} ${fmt(first)}</p>
    ${Math.abs(first-last)>1e-9?`<p><b>Последняя партия:</b> ${inputsText(step,last)} → ${CHEMS[step.id].name} ${fmt(last)}</p>`:''}`;
}

function machineInstructions(step){
  const first=step.loads[0],last=step.loads.at(-1);
  if(step.loads.length===1){
    return `Смешай формальдегид + воду 1:1. Разложи по ${first.containers.length} ёмкостям: <b>${first.containers.map(fmt).join(' / ')}</b> ед. продукта на ёмкость. Закрой Industry Freezer.`;
  }
  return `Смешай формальдегид + воду 1:1 и обработай за <b>${step.loads.length} загрузок</b> (не более трёх ёмкостей по ${step.recipe.batch} ед. продукта одновременно).
    <br>Первая загрузка: <b>${first.containers.map(fmt).join(' / ')}</b> ед. на ёмкость.
    <br>Последняя загрузка: <b>${last.containers.map(fmt).join(' / ')}</b> ед. на ёмкость.`;
}

export function renderChemistry(root){
  const {count,expanded:exp,totalMix,totalVolume,steps,notes}=planProduction(state.mix,{count:state.productionCount,useStocked:state.useStocked});
  const raw=Object.entries(exp.raw).sort((a,b)=>b[1]-a[1]);
  const singleVolume=state.mix.reduce((sum,row)=>sum+(Number(row.u)||0),0);
  const singleBeakers=packFinalBeakers(state.casing,state.mix);
  root.innerHTML=`
    <div class="page-head"><div><span class="eyebrow">производство</span><h1>Химия по шагам</h1><p>${mixtureText(state.mix)}</p></div><label class="switch"><input id="stockToggle" type="checkbox" ${state.useStocked?'checked':''}><span></span><b>Штатные баки готовы</b></label></div>
    ${productionCountPicker(state.productionCount)}
    <div class="batch-overview">
      <div><span>Изделий</span><b>${count}</b></div>
      <div><span>На один заряд</span><b>${fmt(singleVolume)} ед.</b></div>
      <div><span>Всего смеси</span><b>${fmt(totalVolume)} ед.</b></div>
      <div><span>Комплектов мензурок</span><b>${count}</b><small>${singleBeakers.length} менз. / изделие</small></div>
    </div>
    <div class="two-col chemistry-layout">
      <div>
        <section class="panel"><div class="panel-head"><div><span class="eyebrow">Сырьё</span><h2>Сырьё на ${count} шт.</h2><p>С учётом крафта и округления рецептов на всю партию.</p></div></div><div class="need-list">${raw.map(([id,u])=>`<div class="need-row"><span>${CHEMS[id]?.name||id}<small>${sourceLabel(id,state.useStocked)}</small></span><b>${fmt(u)} ед.</b></div>`).join('')||'<div class="empty">Сырьё не требуется.</div>'}</div></section>
        <section class="panel"><div class="panel-head"><div><span class="eyebrow">Фасовка</span><h2>Состав на 1 изделие / на ${count} шт.</h2></div></div>
          <div class="need-list">${totalMix.map(row=>`<div class="need-row"><span>${CHEMS[row.chem]?.name||row.chem}</span><b>${fmt(row.u/count)} / ${fmt(row.u)} ед.</b></div>`).join('')||'<div class="empty">Смесь пуста.</div>'}</div>
          <div class="callout info">Общую заготовку нужно распределить на ${count} отдельных зарядов. Нельзя залить весь объём в один корпус.</div>
        </section>
        ${notes.length?`<section class="panel"><div class="panel-head"><div><span class="eyebrow">Безопасность</span><h2>Не взорви химлабу</h2></div></div><div class="alerts">${notes.map(n=>`<div class="alert ${n.tone}">${n.text}</div>`).join('')}</div></section>`:''}
      </div>
      <div>
        <section class="panel"><div class="panel-head"><div><span class="eyebrow">Маршрут</span><h2>${steps.length} производственных шагов</h2></div></div>
          <div class="recipe-steps">${steps.map((s,i)=>{
            if(s.type==='machine') return `<article class="recipe-step machine"><div class="recipe-num">${i+1}</div><div><div class="recipe-title"><b>${CHEMS[s.id].name} — ${fmt(s.total)} ед.</b><span class="badge machine">морозилка</span></div><p>${machineInstructions(s)}</p><div class="recipe-meta"><span>≈ ${Math.floor(s.seconds/60)}:${String(s.seconds%60).padStart(2,'0')}</span><span>${s.loads.length} загрузок</span><span>цикл 20 сек</span><span>3 ед./цикл/ёмкость</span></div></div></article>`;
            return `<article class="recipe-step"><div class="recipe-num">${i+1}</div><div><div class="recipe-title"><b>${CHEMS[s.id].name} — ${fmt(s.total)} ед.</b>${s.sensitive?'<span class="badge danger">чувствительная</span>':''}${s.recipe.vessel==='silver'?'<span class="badge machine">серебряная мензурка</span>':''}</div>${batchInstructions(s)}<small>${s.recipe.note||''}</small></div></article>`;
          }).join('')}</div>
        </section>
      </div>
    </div>`;
  root.querySelector('#stockToggle').onchange=e=>setState({useStocked:e.target.checked});
  bindProductionCount(root,count=>setState({productionCount:count}));
}
