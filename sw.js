const CACHE_NAME = 'offline'
const OFFLINE_URL = 'index.html'

addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.add(new Request(OFFLINE_URL, { cache: "reload" }))
    )
  )
  skipWaiting()
})

addEventListener('activate', e => {
  e.waitUntil(registration?.navigationPreload.enable())
  clients.claim()
})

addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(e.preloadResponse || fetch(e.request).catch(() =>
      caches.open(CACHE_NAME).then(cache =>
        cache.match(OFFLINE_URL)
      ))
    )
  }
})
