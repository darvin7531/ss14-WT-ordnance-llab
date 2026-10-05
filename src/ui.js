import { CASINGS, CHEMS, PRESETS } from './data.js';
import { calculateStats, engineParams, fmt, packFinalBeakers } from './engine/ordnance.js';
import { simulateOpenGrid, maxCardinalReach } from './engine/explosion.js';

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
