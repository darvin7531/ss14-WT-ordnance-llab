const routes=new Set(['quick','builder','combat','chemistry','reference']);
export function currentRoute(){const r=location.hash.replace(/^#\/?/,'').split('?')[0]||'quick';return routes.has(r)?r:'quick';}
export function go(route){location.hash=`#/${route}`;}
export function onRoute(fn){window.addEventListener('hashchange',()=>fn(currentRoute()));fn(currentRoute());}
