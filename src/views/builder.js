import { state, setState, setMix } from '../state.js';
import { CASINGS, CHEMS } from '../data.js';
import { casingTabs, statStrip, heatmapHtml, currentBundle } from '../ui.js';
import { calculateStats, engineParams, fmt, packFinalBeakers } from '../engine/ordnance.js';
import { analyzeSolutionHazards } from '../engine/chemistry.js';

function chemOptions(selected){
  const groups={};
  for(const [id,c] of Object.entries(CHEMS)){
    if(c.available===false)continue;
    (groups[c.group]??=[]).push([id,c]);
  }
  return Object.entries(groups).map(([g,rows])=>`<optgroup label="${g}">${rows.sort((a,b)=>a[1].name.localeCompare(b[1].name,'ru')).map(([id,c])=>`<option value="${id}" ${id===selected?'selected':''}>${c.name}</option>`).join('')}</optgroup>`).join('');
}

function mixEditor(){
  return `<div class="mix-editor">${state.mix.map((r,i)=>`<div class="mix-line" data-index="${i}"><select class="chem-select">${chemOptions(r.chem)}</select><div class="num-control"><button data-delta="-5">−5</button><input class="chem-u" type="number" min="0" step="1" value="${r.u}"><button data-delta="5">+5</button></div><button class="icon-btn danger" data-remove title="Удалить">×</button></div>`).join('')}<button id="addChem" class="button ghost wide">+ Добавить реагент</button></div>`;
}

export function renderBuilder(root){
  const bundle=currentBundle(state);
  const beakers=packFinalBeakers(state.casing,state.mix);
  const statsWithVessels=calculateStats(state.casing,state.mix,{blastDampener:state.blastDampener,vesselParts:beakers});
  const engine=engineParams(statsWithVessels);
  const sim=bundle.sim;
  const payloadHazards=beakers.flatMap(v=>analyzeSolutionHazards(v.parts,v.name));
  root.innerHTML=`
  <div class="page-head"><div><span class="eyebrow">расширенный режим</span><h1>Конструктор заряда</h1><p>Редактируй жидкость вручную. Справа — именно параметры, которые уходят в ExplosionSystem.</p></div><a class="button ghost" href="#/quick">← Простой режим</a></div>
  <div class="two-col builder-layout">
    <div>
      <section class="panel"><div class="panel-head"><div><span class="eyebrow">Корпус</span><h2>${CASINGS[state.casing].name}</h2></div><label class="switch"><input id="dampToggle" type="checkbox" ${state.blastDampener?'checked':''}><span></span><b>Blast dampener</b></label></div>${casingTabs(state.casing)}</section>
      <section class="panel"><div class="panel-head"><div><span class="eyebrow">Состав</span><h2>${fmt(statsWithVessels.volume)} / ${statsWithVessels.casing.volume} ед.</h2></div><span class="pill ${statsWithVessels.volume>statsWithVessels.casing.volume?'bad':''}">${statsWithVessels.volume>statsWithVessels.casing.volume?'ПЕРЕПОЛНЕНИЕ':'объём OK'}</span></div>${mixEditor()}</section>
      <section class="panel"><div class="panel-head"><div><span class="eyebrow">Упаковка</span><h2>Финальные мензурки</h2></div></div><div class="beakers">${beakers.map(v=>`<div class="beaker"><div class="beaker-title"><b>${v.name}</b><span>${fmt(v.used)} / ${v.capacity}</span></div>${v.parts.map(p=>`<div class="beaker-part"><span>${CHEMS[p.chem]?.name||p.chem}</span><b>${fmt(p.u)}</b></div>`).join('')}</div>`).join('')}</div><div class="callout info">Железо группируется первым. Сервер считает осколки как <code>(int)(qty × 0.25)</code> для каждой записи раствора, поэтому дробить железо между мензурками невыгодно.</div>${payloadHazards.length?`<div class="alerts">${payloadHazards.map(h=>`<div class="alert ${h.tone}">${h.text}</div>`).join('')}</div>`:''}</section>
    </div>
    <div>
      <section class="panel sticky-panel"><div class="panel-head"><div><span class="eyebrow">Результат</span><h2>Параметры сервера</h2></div></div>${statStrip({...state})}
        <div class="engine-grid">
          <div><span>Total intensity</span><b>${fmt(engine.totalIntensity)}</b></div><div><span>Slope</span><b>${fmt(engine.slope)}</b></div><div><span>Max tile intensity</span><b>${fmt(engine.maxIntensity)}</b></div><div><span>Power/Falloff</span><b>${fmt(engine.radiusParameter)}</b><small>не реальный радиус</small></div>
        </div>
        ${heatmapHtml(sim,{selected:{x:999,y:999},size:7,clickable:false})}
        <div class="callout warn"><b>Open-grid:</b> это точная логика распределения intensity для пустой сетки. Стены/airtight blockers способны задержать волну и перераспределить её интенсивность.</div>
        ${statsWithVessels.fireActual.intensity?`<div class="callout info"><b>Огонь:</b> сервер реально передаст <b>${statsWithVessels.fireActual.intensity} / ${statsWithVessels.fireActual.radius} / ${statsWithVessels.fireActual.duration}</b>. ${statsWithVessels.fireShape==='star'?`При Intensity > 30 этот корпус создаст star/line shape (ray range ${statsWithVessels.fireRayRange}).`:'Форма — ромб.'}</div>`:''}
      </section>
    </div>
  </div>`;

  root.querySelectorAll('[data-casing]').forEach(b=>b.onclick=()=>setState({casing:b.dataset.casing}));
  root.querySelector('#dampToggle').onchange=e=>setState({blastDampener:e.target.checked});
  root.querySelectorAll('.mix-line').forEach(line=>{
    const idx=Number(line.dataset.index);
    line.querySelector('.chem-select').onchange=e=>{const m=state.mix.map(x=>({...x}));m[idx].chem=e.target.value;setMix(m);};
    line.querySelector('.chem-u').onchange=e=>{const m=state.mix.map(x=>({...x}));m[idx].u=Math.max(0,Number(e.target.value)||0);setMix(m);};
    line.querySelectorAll('[data-delta]').forEach(btn=>btn.onclick=()=>{const m=state.mix.map(x=>({...x}));m[idx].u=Math.max(0,(Number(m[idx].u)||0)+Number(btn.dataset.delta));setMix(m);});
    line.querySelector('[data-remove]').onclick=()=>setMix(state.mix.filter((_,i)=>i!==idx));
  });
  root.querySelector('#addChem').onclick=()=>setMix([...state.mix,{chem:'anfo',u:5}]);
}
