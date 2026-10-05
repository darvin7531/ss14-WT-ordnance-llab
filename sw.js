const CACHE='ordnance-lab-v12-3';
const ASSETS=[
  './','./index.html','./404.html','./manifest.webmanifest','./assets/app.css','./assets/icon.svg',
  './src/app.js','./src/data.js','./src/state.js','./src/router.js','./src/ui.js','./src/chem-info.js',
  './src/engine/ordnance.js','./src/engine/explosion.js','./src/engine/combat.js','./src/engine/chemistry.js','./src/engine/ingredients.js',
  './src/views/quick.js','./src/views/builder.js','./src/views/combat.js','./src/views/chemistry.js','./src/views/reagents.js','./src/views/reference.js'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match('./index.html'))));
});
