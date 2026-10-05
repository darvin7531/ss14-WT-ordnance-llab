import { state, setState } from '../state.js';
import { XENOS, CHEMS } from '../data.js';
import { currentBundle, heatmapHtml, mixtureText } from '../ui.js';
import { simulateOpenGrid } from '../engine/explosion.js';
import { simulateHit, outcomeLabel, shardDamagePerHit } from '../engine/combat.js';
import { fmt } from '../engine/ordnance.js';

function simulateScenario(){
  const {stats,engine}=currentBundle(state);
  const xeno=XENOS[state.selectedXeno];
  const n=Math.max(1,Math.min(2,Number(state.grenadeCount)||1));
  const simultaneous=n>1&&state.multiMode==='simultaneous';
  let totalBody=0,totalPre=0,shield=Number(state.genericShield)||0,vanguardWasHit=false;
  const hits=[];
  if(simultaneous){
    const sim=simulateOpenGrid(engine,n);
    const intensity=sim.intensityAt(state.target.x,state.target.y);
    const hit=simulateHit({xenoId:state.selectedXeno,intensity,activeClassShield:state.classShield,genericShield:shield,vanguardWasHit});
    hits.push(hit);totalBody+=hit.bodyDamage;totalPre+=hit.preShieldDamage;shield=hit.shieldLeft;
  }else{
    const sim=simulateOpenGrid(engine);
    const intensity=sim.intensityAt(state.target.x,state.target.y);
    for(let i=0;i<n;i++){
      const hit=simulateHit({xenoId:state.selectedXeno,intensity,activeClassShield:state.classShield,genericShield:shield,vanguardWasHit});
      hits.push(hit);totalBody+=hit.bodyDamage;totalPre+=hit.preShieldDamage;shield=hit.shieldLeft;vanguardWasHit ||= hit.vanguardTriggered;
    }
  }
  const shardHits=Math.max(0,Math.min(stats.shards,Number(state.shardHits)||0));
  const shardEach=shardDamagePerHit(xeno);
  const shardDamage=shardHits*shardEach;
  totalBody+=shardDamage;
  return {stats,engine,xeno,n,simultaneous,hits,totalBody,totalPre,shield,shardHits,shardEach,shardDamage,outcome:outcomeLabel(totalBody,xeno)};
}

export function renderCombat(root){
  const {stats,engine}=currentBundle(state);
  const scenario=simulateScenario();
  const displaySim=simulateOpenGrid(engine,scenario.simultaneous?scenario.n:1);
  const damageAt=i=>simulateHit({xenoId:state.selectedXeno,intensity:i,activeClassShield:false,genericShield:0}).bodyDamage;
  const selIntensity=displaySim.intensityAt(state.target.x,state.target.y);
  const first=scenario.hits[0];
  root.innerHTML=`
    <div class="page-head"><div><span class="eyebrow">боевой симулятор</span><h1>Что реально получит T3</h1><p>Кликни по тайлу на карте. Урон учитывает ExplosionArmor и текущую flood-fill intensity; обычный XenoArmor поверх blast не применяется.</p></div><a class="button ghost" href="#/builder">Изменить смесь</a></div>
    <section class="panel combat-config">
      <div class="field"><label>Цель</label><select id="xenoSelect">${Object.entries(XENOS).map(([id,x])=>`<option value="${id}" ${id===state.selectedXeno?'selected':''}>${x.name} · ${x.hp} HP · EA ${x.ea}</option>`).join('')}</select></div>
      <div class="field"><label>Гранаты</label><div class="segmented small"><button data-count="1" class="seg ${state.grenadeCount===1?'active':''}">1</button><button data-count="2" class="seg ${state.grenadeCount===2?'active':''}">2</button></div></div>
      ${state.grenadeCount===2?`<div class="field"><label>Как срабатывают</label><select id="multiMode"><option value="sequential" ${state.multiMode==='sequential'?'selected':''}>По очереди — два отдельных попадания</option><option value="simultaneous" ${state.multiMode==='simultaneous'?'selected':''}>Одновременно рядом — engine combine</option></select></div>`:''}
      <div class="field"><label>Обычный щит, HP</label><input id="genericShield" type="number" min="0" step="10" value="${state.genericShield||0}"></div>
      ${scenario.xeno.specialShield?`<label class="checkline"><input id="classShield" type="checkbox" ${state.classShield?'checked':''}><span>Активный классовый щит (${scenario.xeno.specialShield==='crusher'?'Crusher Defensive':'Vanguard'})</span></label>`:''}
    </section>
    <div class="two-col combat-layout">
      <section class="panel">
        <div class="panel-head"><div><span class="eyebrow">Open-grid карта</span><h2>Поставь цель</h2><p>Число в тайле — blast-урон выбранной касте <b>без щита</b>.</p></div><span class="pill">цель: (${state.target.x}, ${state.target.y})</span></div>
        ${heatmapHtml(displaySim,{selected:state.target,size:9,clickable:true,showDamageFor:damageAt})}
        <div class="callout info">Выбранный тайл: intensity <b>${fmt(selIntensity)}</b>. ${scenario.simultaneous?'Показана объединённая intensity двух одновременных одинаковых взрывов.':'Каждая последовательная граната использует эту intensity отдельно.'}</div>
      </section>
      <section class="panel combat-result">
        <div class="panel-head"><div><span class="eyebrow">Результат</span><h2>${scenario.xeno.name}</h2><p>${mixtureText(state.mix)}</p></div><span class="verdict ${scenario.outcome.tone}">${scenario.outcome.text}</span></div>
        <div class="big-result"><div><span>Урон по телу</span><b>${fmt(scenario.totalBody)}</b><small>из ${scenario.xeno.hp} до смерти</small></div><div><span>Останется до смерти</span><b>${fmt(Math.max(0,scenario.xeno.hp-scenario.totalBody))}</b><small>до крита: ${fmt(Math.max(0,scenario.xeno.crit-scenario.totalBody))}</small></div></div>
        <div class="progress"><i style="width:${Math.min(100,scenario.totalBody/scenario.xeno.hp*100)}%"></i></div>
        <div class="hit-list">${scenario.hits.map((h,i)=>`<div class="hit-row"><b>${scenario.simultaneous?'Объединённый взрыв':`Взрыв ${i+1}`}</b><span>${fmt(h.bodyDamage)} body</span><span>${fmt(h.preShieldDamage)} до щита</span><span>stun ${fmt(h.control.stun)} c</span><span>slow ${fmt(h.control.slow)} c</span></div>`).join('')}</div>
        ${first?.special?`<div class="callout warn">${first.special}</div>`:''}
        ${scenario.xeno.fireImmune?'<div class="callout warn">Эта каста имеет RMCImmuneToFireTileDamage: обычный пожар не считай полноценным дополнительным DPS.</div>':''}
        <div class="field shard-field"><label>Попавшие осколки: <b>${scenario.shardHits} / ${stats.shards}</b></label><input id="shardHits" type="range" min="0" max="${stats.shards}" value="${scenario.shardHits}"><small>Каждый попавший CMProjectileShrapnel = 25 Piercing, AP20. Здесь добавляется оценка ${fmt(scenario.shardEach)} урона за попадание без активного щита.</small></div>
        ${scenario.shardDamage?`<div class="callout info">Оценка от ${scenario.shardHits} осколк.: +${fmt(scenario.shardDamage)} урона. Направления случайные, приложение не считает это гарантированным попаданием.</div>`:''}
        <div class="callout danger"><b>Не лаборатория:</b> карта не моделирует стены, двери, airtights, движение цели, разные точки двух бросков и состояние щита между секундами. Для пустой открытой сетки blast intensity повторяет серверную схему.</div>
      </section>
    </div>`;
  root.querySelector('#xenoSelect').onchange=e=>setState({selectedXeno:e.target.value,classShield:false,genericShield:0});
  root.querySelectorAll('[data-count]').forEach(b=>b.onclick=()=>setState({grenadeCount:Number(b.dataset.count)}));
  root.querySelector('#multiMode')?.addEventListener('change',e=>setState({multiMode:e.target.value}));
  root.querySelector('#genericShield').onchange=e=>setState({genericShield:Math.max(0,Number(e.target.value)||0)});
  root.querySelector('#classShield')?.addEventListener('change',e=>setState({classShield:e.target.checked}));
  root.querySelector('#shardHits').oninput=e=>setState({shardHits:Number(e.target.value)});
  root.querySelectorAll('.heat-cell[data-x]').forEach(b=>b.onclick=()=>setState({target:{x:Number(b.dataset.x),y:Number(b.dataset.y)}});
}
