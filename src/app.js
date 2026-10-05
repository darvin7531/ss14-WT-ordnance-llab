import { SOURCE } from './data.js';
import { state, subscribe, reset } from './state.js';
import { onRoute, currentRoute } from './router.js';
import { renderQuick } from './views/quick.js';
import { renderBuilder } from './views/builder.js';
import { renderCombat } from './views/combat.js';
import { renderChemistry } from './views/chemistry.js';
import { renderReagents } from './views/reagents.js';
import { renderReference } from './views/reference.js';

const views={quick:renderQuick,builder:renderBuilder,combat:renderCombat,chemistry:renderChemistry,reagents:renderReagents,reference:renderReference};
const root=document.querySelector('#view');

function updateNav(route){
  document.querySelectorAll('[data-route]').forEach(a=>a.classList.toggle('active',a.dataset.route===route));
  document.querySelector('#buildBadge').textContent=`build ${SOURCE.shortCommit}`;
}
function render(){const route=currentRoute();updateNav(route);views[route](root);window.scrollTo({top:0,behavior:'instant'});}
subscribe(render);
onRoute(render);

document.querySelector('#resetApp').onclick=()=>{if(confirm('Сбросить смесь и настройки приложения?'))reset();};
document.querySelector('#navToggle').onclick=()=>document.body.classList.toggle('nav-open');
document.querySelectorAll('.nav-link').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('nav-open')));

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
