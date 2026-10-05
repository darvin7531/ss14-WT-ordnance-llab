import { PRESETS, CASINGS, CHEMS } from './data.js';

const KEY='ss14-ordnance-lab-v12';
const defaults={
  casing:'m15',
  mix:[{chem:'anfo',u:120},{chem:'cyclonite',u:60}],
  blastDampener:false,
  useStocked:true,
  selectedXeno:'praet',
  target:{x:2,y:0},
  grenadeCount:1,
  multiMode:'sequential',
  classShield:false,
  genericShield:0,
  shardHits:0,
};

function load(){
  try{
    const x=JSON.parse(localStorage.getItem(KEY));
    if(x && CASINGS[x.casing] && Array.isArray(x.mix)) return {...defaults,...x};
  }catch{}
  return {...defaults};
}

export const state=load();
const listeners=new Set();

export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function emit(){localStorage.setItem(KEY,JSON.stringify(state));for(const fn of listeners)fn(state);}
export function setState(patch){Object.assign(state,patch);emit();}
export function setMix(mix){state.mix=mix.filter(x=>CHEMS[x.chem]&&CHEMS[x.chem].available!==false&&Number(x.u)>0).map(x=>({chem:x.chem,u:Number(x.u)}));emit();}
export function loadPreset(id){const p=PRESETS.find(x=>x.id===id);if(!p)return;state.casing=p.casing;state.mix=Object.entries(p.mix).map(([chem,u])=>({chem,u}));emit();}
export function reset(){Object.assign(state,defaults);emit();}
