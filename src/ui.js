import { CASINGS, CHEMS, PRESETS } from './data.js';
import { calculateStats, engineParams, fmt, packFinalBeakers } from './engine/ordnance.js';
import { simulateOpenGrid, maxCardinalReach } from './engine/explosion.js';
import { analyzeIngredients } from './engine/ingredients.js';
import { CHEM_DETAILS, effectParts, fireEntityLabel } from './chem-info.js';

export function escapeHtml(v=''){
  return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

export function metric(label,value,hint='',tone=''){
  return `<div class="metric ${tone}"><div class="metric-label">${label}</div><div class="metric-value">${value}</div>${hint?`<div class="metric-hint">${hint}</div>`:''}</div>`;
}

export function currentBundle(state){
  const vessels=packFinalBeakers(state.casing,state.mix);
  const stats=calculateStats(state.casing,state.mix,{blastDampener:state.blastDampener,vesselParts:vessels});
  const engine=engineParams(stats);
  const sim=simulateOpenGrid(engine);
  return {stats,engine,sim};
}

export function statStrip(state){
  const {stats,engine,sim}=currentBundle(state);
  return `<div class="metrics-grid compact">
    ${metric('Объём',`${fmt(stats.volume)} / ${stats.casing.volume}`,'ед.')}
    ${metric('Power',fmt(stats.power),stats.powerRaw>stats.power?`сырой ${fmt(stats.powerRaw)} → cap`: 'после cap')}
    ${metric('Falloff',fmt(stats.falloff),state.blastDampener?'с dampener':'итоговый')}
    ${metric('Центр',fmt(sim.intensityAt(0,0)*10),'raw blast dmg')}
    ${metric('Охват',`${maxCardinalReach(sim)} тайл.`,'по прямой, open-grid')}
    ${metric('Осколки',fmt(stats.shards),'25 Piercing / AP20')}
    ${metric('Огонь',stats.fireActual.intensity?`${stats.fireActual.intensity}/${stats.fireActual.radius}/${stats.fireActual.duration}`:'—','int / radius / sec')}
    ${metric('Тип огня',stats.fireActual.intensity?fireEntityLabel(stats.fireEntity,stats.firePenetrating):'—',stats.fireColor?'weighted цвет может переопределить special entity':'FireEntity')}
    ${metric('Цвет',stats.fireColor?`<span class="metric-color"><i style="background:${stats.fireColor}"></i>${stats.fireColor}</span>`:'—','только burncolormod > 0')}
  </div>`;
}

export function casingTabs(active){
  return `<div class="segmented casing-tabs">${Object.entries(CASINGS).map(([id,c])=>`<button class="seg ${id===active?'active':''}" data-casing="${id}"><b>${c.short}</b><span>${c.volume}u</span></button>`).join('')}</div>`;
}

export function presetCards(casingId,stateMix){
  const list=PRESETS.filter(p=>p.casing===casingId);
  if(!list.length) return `<div class="empty">Для этого корпуса готовых пресетов пока нет. Используй Конструктор.</div>`;
  const activeMix=JSON.stringify(Object.fromEntries(stateMix.map(x=>[x.chem,x.u])));
  return `<div class="preset-grid">${list.map(p=>{
    const pMix=JSON.stringify(p.mix);
    const active=pMix===activeMix;
    const s=calculateStats(p.casing,Object.entries(p.mix).map(([chem,u])=>({chem,u})));
    const e=engineParams(s), sim=simulateOpenGrid(e);
    return `<button class="preset-card ${active?'active':''}" data-preset="${p.id}">
      <div class="preset-top"><span class="badge ${p.kind}">${p.badge}</span>${p.recommended?'<span class="badge recommended">реком.</span>':''}<span class="difficulty ${p.difficulty}">${p.difficulty==='easy'?'просто':p.difficulty==='medium'?'средне':'сложно'}</span></div>
      <h3>${escapeHtml(p.name)}</h3>
      <p class="goal">${escapeHtml(p.goal)}</p>
      <p>${escapeHtml(p.desc)}</p>
      <div class="mini-stats"><span>P ${fmt(s.power)}</span><span>F ${fmt(s.falloff)}</span><span>центр ${fmt(sim.intensityAt(0,0)*10)}</span><span>охват ${maxCardinalReach(sim)}</span>${s.shards?`<span>${s.shards} оск.</span>`:''}${s.fireActual.intensity?`<span>🔥 ${s.fireActual.intensity}/${s.fireActual.radius}/${s.fireActual.duration}</span>`:''}</div>
    </button>`;
  }).join('')}</div>`;
}

export function mixtureText(mix){
  return mix.map(x=>`${CHEMS[x.chem]?.name||x.chem} ${fmt(x.u)}`).join(' + ');
}

export function heatmapHtml(sim,{selected={x:2,y:0},size=9,clickable=true,showDamageFor=null}={}){
  const lim=Math.min(size,Math.max(4,sim.limit));
  const cells=[];
  let max=0;
  for(let y=lim;y>=-lim;y--) for(let x=-lim;x<=lim;x++) max=Math.max(max,sim.intensityAt(x,y));
  for(let y=lim;y>=-lim;y--){
    for(let x=-lim;x<=lim;x++){
      const val=sim.intensityAt(x,y);
      const p=max?val/max:0;
      const sel=x===selected.x&&y===selected.y;
      const center=x===0&&y===0;
      const bg=val<=0?'transparent':`hsla(${Math.round(45-35*p)}, 92%, ${Math.round(24+18*p)}%, ${0.25+0.75*p})`;
      const txt=showDamageFor?showDamageFor(val):val*10;
      cells.push(`<button class="heat-cell ${sel?'selected':''} ${center?'center':''} ${val<=0?'zero':''}" ${clickable?'':'disabled'} data-x="${x}" data-y="${y}" title="(${x}, ${y}) · intensity ${val.toFixed(2)}" style="background:${bg}">${val>0?Math.round(txt):''}</button>`);
    }
  }
  return `<div class="heat-wrap"><div class="heat-caption"><span>Эпицентр — ✦</span><span>${showDamageFor?'число = урон цели':'число = raw blast damage'}</span></div><div class="heat-grid" style="--n:${lim*2+1}">${cells.join('')}</div></div>`;
}


export function ingredientBreakdown(state,{title='Зачем здесь каждый компонент'}={}){
  const rows=analyzeIngredients(state.casing,state.mix,{blastDampener:state.blastDampener});
  const zeroRows=rows.filter(x=>x.usefulness==='cosmetic'||x.usefulness==='wasted');
  return `<section class="panel ingredient-panel">
    <div class="panel-head">
      <div><span class="eyebrow">разбор смеси</span><h2>${title}</h2><p>Сверху — что реагент умеет в принципе. Ниже — что он <b>реально меняет именно в этой смеси</b> после cap, min Falloff и целочисленного fire. Проверка идёт по одному компоненту: остальные остаются на месте.</p></div>
      <a class="text-link" href="#/reagents">Полный справочник реагентов →</a>
    </div>
    ${zeroRows.length?`<div class="callout warn"><b>Кандидаты на замену:</b> ${zeroRows.map(x=>`${x.chem.name} ${fmt(x.u)}u`).join(', ')}. Каждый из них <b>по отдельности</b> сейчас можно убрать без изменения Power/Falloff/Fire/Shards; визуальный цвет может измениться. Не удаляй все сразу без повторной проверки.</div>`:''}
    <div class="ingredient-grid">
      ${rows.map(x=>{
        const d=CHEM_DETAILS[x.id]||{};
        const eff=[];
        if(Math.abs(x.effective.power)>1e-6)eff.push(`Power +${fmt(x.effective.power)}`);
        if(Math.abs(x.effective.falloff)>1e-6)eff.push(`Falloff ${x.effective.falloff>0?'−':'+'}${fmt(Math.abs(x.effective.falloff))}`);
        if(Math.abs(x.effective.intensity)>1e-6)eff.push(`Fire I ${x.effective.intensity>0?'+':''}${fmt(x.effective.intensity)}`);
        if(Math.abs(x.effective.radius)>1e-6)eff.push(`Fire R ${x.effective.radius>0?'+':''}${fmt(x.effective.radius)}`);
        if(Math.abs(x.effective.duration)>1e-6)eff.push(`Fire D ${x.effective.duration>0?'+':''}${fmt(x.effective.duration)}`);
        if(Math.abs(x.effective.shards)>1e-6)eff.push(`осколки +${fmt(x.effective.shards)}`);
        if(x.fireEntityChanged)eff.push(`тип огня → ${fireEntityLabel(x.baseFireEntity,x.chem.firePenetrating)}`);
        if(x.colorChanged&&x.finalColor)eff.push(`цвет → ${x.finalColor}`);
        const status=x.usefulness==='useful'?'useful':x.usefulness==='partial'?'partial':x.usefulness==='cosmetic'?'cosmetic':'wasted';
        const statusText={useful:'работает полностью',partial:'часть уходит в cap',cosmetic:'в основном косметика',wasted:'боевого вклада нет'}[status];
        return `<article class="ingredient-card ${status}">
          <div class="ingredient-head"><div><b>${x.chem.name}</b><small>${fmt(x.u)}u · ${d.role||'реагент'}</small></div><span class="ingredient-status">${statusText}</span></div>
          <p>${d.summary||''}</p>
          <div class="effect-chips">${effectParts(x.id).map(e=>`<span class="effect-chip ${e.tone}">${e.label}</span>`).join('')}</div>
          <div class="actual-effect"><span>В этой смеси:</span><b>${eff.length?eff.join(' · '):'итоговые боевые параметры не меняет'}</b></div>
          ${x.notes.length?`<div class="ingredient-notes">${x.notes.map(n=>`<div>• ${n}</div>`).join('')}</div>`:''}
          <div class="why"><b>Смысл:</b> ${d.how||''}</div>
        </article>`;
      }).join('')}
    </div>
  </section>`;
}
