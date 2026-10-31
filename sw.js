const CACHE_NAME = "einkaufsliste-pwa-v2";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("einkaufsliste-pwa-") && k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const req=event.request,url=new URL(req.url);
  if(url.origin!==self.location.origin||req.method!=="GET") return;
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(resp=>{
    if(resp.ok){const copy=resp.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));}
    return resp;
  }).catch(()=>caches.match("./index.html"))));
});