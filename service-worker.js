const CACHE='remembra-independent-v7';
const ASSETS=['./','./index.html','./manifest.webmanifest','./smart.js','./jszip.min.js','./pdf.min.mjs','./pdf.worker.min.mjs','./icon-192.png','./icon-512.png'].map(p=>new URL(p,self.registration.scope).toString());
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('remembra-independent-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||!url.href.startsWith(self.registration.scope))return;event.respondWith(caches.match(event.request).then(found=>found||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return response})))})
