import { CHEMS } from '../data.js';
import { CHEM_DETAILS, effectParts, directSource } from '../chem-info.js';

function card(id,c){
  const d=CHEM_DETAILS[id]||{role:'Реагент',summary:'Описание ещё не добавлено.',how:'',use:'',avoid:''};
  const hidden=c.available===false;
  return `<article class="chem-card ${hidden?'chem-hidden':''}" data-chem-card data-name="${(c.name+' '+id+' '+d.role).toLowerCase()}">
    <div class="chem-card-top">
      <div><span class="chem-role">${d.role}</span><h3>${c.name}</h3><code>${c.proto}</code></div>
      ${hidden?'<span class="badge danger">скрыт</span>':''}
    </div>
    <p class="chem-summary">${d.summary}</p>
    <div class="effect-chips">${effectParts(id).map(e=>`<span class="effect-chip ${e.tone}">${e.label}</span>`).join('')}</div>
    <div class="chem-explain"><b>Что реально делает</b><p>${d.how}</p></div>
    <div class="chem-use-grid"><div><b>Когда полезен</b><p>${d.use}</p></div><div><b>Когда не нужен / опасен</b><p>${d.avoid}</p></div></div>
    <div class="chem-source"><span>Источник</span><b>${directSource(id)}</b>${c.burnColor&&c.burnWeight>0?`<span class="color-dot" style="background:${c.burnColor}"></span><small>BurnColor ${c.burnColor}, вес ${c.burnWeight}</small>`:''}</div>
  </article>`;
}

export function renderReagents(root){
  const groups={};
  for(const [id,c] of Object.entries(CHEMS))(groups[c.group]??=[]).push([id,c]);
  root.innerHTML=`
    <div class="page-head"><div><span class="eyebrow">энциклопедия химии</span><h1>Что делает каждый реагент</h1><p>Здесь показан именно вклад в custom ordnance: blast, огонь, шрапнель, цвет и special FireEntity.</p></div></div>
    <section class="panel docs"><h2>Как читать карточки</h2><p><b>Power</b> повышает силу взрыва до cap корпуса. <b>Falloff</b> выгодно уменьшать: чем он ниже, тем дальше и плотнее распределяется blast budget. <b>Fire I/R/D</b> — Intensity / Radius / Duration; после clamp корпуса они при создании огня приводятся к целым значениям.</p><p><b>BurnColor — отдельная механика.</b> В итоговый цвет входят только реагенты с ненулевым <code>burncolormod</code>. Carbon/Copper поэтому действительно могут быть почти «краской». Но weighted цвет может заменить специальный FireEntity на <code>STTileFireDynamic</code> (или penetrating-вариант), поэтому иногда цветовая добавка меняет и механику.</p><p>Поля топлива вроде <code>intensity:40 / duration:40 / radius:6</code> относятся к самому типу огня и <b>не складываются напрямую</b> с параметрами custom ordnance. В основной расчёт идут modifiers и эффекты Oxidizing/Fueling/Flowing/Viscous.</p></section>
    <section class="panel chem-toolbar"><div class="field grow"><label>Поиск</label><input id="chemSearch" placeholder="ANFO, углерод, радиус, прекурсор..."></div><label class="checkline"><input id="showHidden" type="checkbox"><span>Показывать скрытые/спорные реагенты</span></label></section>
    <div id="chemGroups">${Object.entries(groups).map(([group,rows])=>`<section class="section chem-group" data-group="${group}"><div class="section-title"><div><span class="eyebrow">категория</span><h2>${group}</h2></div></div><div class="chem-grid">${rows.map(([id,c])=>card(id,c)).join('')}</div></section>`).join('')}</div>`;

  const search=root.querySelector('#chemSearch');
  const hiddenToggle=root.querySelector('#showHidden');
  const apply=()=>{
    const q=search.value.trim().toLowerCase();
    const showHidden=hiddenToggle.checked;
    root.querySelectorAll('[data-chem-card]').forEach(card=>{
      const hidden=card.classList.contains('chem-hidden');
      const matches=!q||card.dataset.name.includes(q)||card.textContent.toLowerCase().includes(q);
      card.style.display=matches&&(!hidden||showHidden)?'':'none';
    });
    root.querySelectorAll('.chem-group').forEach(g=>{
      g.style.display=[...g.querySelectorAll('[data-chem-card]')].some(c=>c.style.display!=='none')?'':'none';
    });
  };
  search.oninput=apply;hiddenToggle.onchange=apply;apply();
}
