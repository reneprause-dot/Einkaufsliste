const CACHE_NAME = "einkaufsliste-pwa-v3";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg"];
const CDN_HOSTS = ["cdn.tailwindcss.com", "cdnjs.cloudflare.com"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("einkaufsliste-pwa-") && k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== "GET" || !(url.origin === self.location.origin || CDN_HOSTS.includes(url.hostname))) return;
  event.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(resp => {
      if (resp.ok || resp.type === "opaque") { const copy = resp.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
      return resp;
    });
    if (hit) { event.waitUntil(net.catch(() => {})); return hit; }
    return net.catch(() => caches.match("./index.html"));
  }));
});
