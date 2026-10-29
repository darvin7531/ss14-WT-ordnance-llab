import { state, setState, loadPreset } from '../state.js';
import { CASINGS, CHEMS, PRESETS } from '../data.js';
import { casingTabs, presetCards, statStrip, mixtureText, ingredientBreakdown, productionCountPicker, bindProductionCount } from '../ui.js';
import { planProduction } from '../engine/chemistry.js';
import { fmt, packFinalBeakers } from '../engine/ordnance.js';

function shortRecipe(){
  const {count,expanded:exp,steps,notes:safety,totalVolume}=planProduction(state.mix,{count:state.productionCount,useStocked:state.useStocked});
  const beakers=packFinalBeakers(state.casing,state.mix);
  const raw=Object.entries(exp.raw).sort((a,b)=>b[1]-a[1]);
  const singleVolume=state.mix.reduce((sum,row)=>sum+(Number(row.u)||0),0);
  return `<div class="batch-overview">
    <div><span>Изделий в партии</span><b>${count}</b></div>
    <div><span>Смесь на один заряд</span><b>${fmt(singleVolume)} ед.</b></div>
    <div><span>Смесь на всю партию</span><b>${fmt(totalVolume)} ед.</b></div>
    <div><span>Финальные мензурки</span><b>${beakers.length} × ${count}</b><small>по ${beakers.length} на изделие</small></div>
  </div>
  <div class="quick-columns">
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">1. Подготовь</span><h2>Что взять на ${count} шт.</h2></div><span class="pill">${state.useStocked?'баки OT считаются готовыми':'полный крафт'}</span></div>
      <div class="need-list">${raw.map(([id,u])=>`<div class="need-row"><span>${CHEMS[id]?.name||id}</span><b>${fmt(u)} ед.</b></div>`).join('')||'<div class="empty">Сырьё не требуется.</div>'}</div>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">2. Изготовь</span><h2>Маршрут на ${count} шт.</h2></div><a class="text-link" href="#/chemistry">подробно →</a></div>
      <div class="timeline">${steps.slice(0,6).map((s,i)=>`<div class="timeline-row"><span class="stepnum">${i+1}</span><div><b>${CHEMS[s.id]?.name||s.id} — ${fmt(s.total)} ед.</b><small>${s.type==='machine'?`Морозилка OT · ≈ ${Math.round(s.seconds/60*10)/10} мин · ${s.loads.length} загрузок`:(s.batches.length>1?`${s.batches.length} партии`:s.recipe.note)}</small></div></div>`).join('')}${steps.length>6?`<div class="more">+ ещё ${steps.length-6} шаг(а) — открой «Химия»</div>`:''}</div>
    </section>
  </div>
  ${safety.length?`<div class="alerts">${safety.map(n=>`<div class="alert ${n.tone}">${n.text}</div>`).join('')}</div>`:''}
  <section class="panel">
    <div class="panel-head"><div><span class="eyebrow">3. Собери</span><h2>Финальные мензурки · 1 шт.</h2><p>Собери ${count} одинаковых комплектов. Значения ниже — на один заряд.</p></div></div>
    <div class="beakers">${beakers.map(v=>`<div class="beaker"><div class="beaker-title"><b>${v.name}</b><span>${fmt(v.used)} / ${v.capacity}</span></div>${v.parts.map(p=>`<div class="beaker-part"><span>${CHEMS[p.chem]?.name||p.chem}</span><b>${fmt(p.u)}</b></div>`).join('')}</div>`).join('')}</div>
    ${CASINGS[state.casing].note?`<div class="callout info">${CASINGS[state.casing].note}</div>`:''}
  </section>`;
}

export function renderQuick(root){
  const activePreset=PRESETS.find(p=>p.casing===state.casing && JSON.stringify(p.mix)===JSON.stringify(Object.fromEntries(state.mix.map(x=>[x.chem,x.u]))));
  root.innerHTML=`
    <div class="page-head"><div><span class="eyebrow">быстрый режим</span><h1>Собрать боеприпас без боли</h1><p>Выбери корпус → нажми готовый рецепт → следуй шагам. Всё остальное приложение посчитает само.</p></div><a class="button ghost" href="#/builder">Открыть конструктор</a></div>
    <section class="panel hero-panel">
      <div class="panel-head"><div><span class="eyebrow">Корпус</span><h2>${CASINGS[state.casing].name}</h2></div><label class="switch"><input id="stockToggle" type="checkbox" ${state.useStocked?'checked':''}><span></span><b>Штатные баки уже есть</b></label></div>
      ${casingTabs(state.casing)}
    </section>
    ${productionCountPicker(state.productionCount)}
    <section class="section"><div class="section-title"><div><span class="eyebrow">Рецепт</span><h2>Готовые варианты</h2></div></div>${presetCards(state.casing,state.mix)}</section>
    <section class="panel result-card">
      <div class="panel-head"><div><span class="eyebrow">Текущий заряд</span><h2>${activePreset?.name||'Своя смесь'}</h2><p>${mixtureText(state.mix)}</p></div><a class="button primary" href="#/combat">Проверить по T3 →</a></div>
      ${statStrip(state)}
      <div class="callout warn"><b>Важно:</b> «охват» теперь считается open-grid алгоритмом ExplosionSystem, а не как Power/Falloff. Стены и гермозатворы могут сильно изменить реальный рисунок.</div>
    </section>
    ${ingredientBreakdown(state)}
    ${shortRecipe()}`;

  root.querySelectorAll('[data-casing]').forEach(b=>b.onclick=()=>setState({casing:b.dataset.casing,mix:(PRESETS.find(p=>p.casing===b.dataset.casing&&p.recommended)||PRESETS.find(p=>p.casing===b.dataset.casing))?Object.entries((PRESETS.find(p=>p.casing===b.dataset.casing&&p.recommended)||PRESETS.find(p=>p.casing===b.dataset.casing)).mix).map(([chem,u])=>({chem,u})):[]}));
  root.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>loadPreset(b.dataset.preset));
  root.querySelector('#stockToggle').onchange=e=>setState({useStocked:e.target.checked});
  bindProductionCount(root,count=>setState({productionCount:count}));
}
