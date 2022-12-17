const staticCache = 'site-static'
const assets = [
  '/',
  '/index.html',
  '/auth.html',
  '/auth.html?\auth=signin',
  '/auth.html?\auth=signup',
  '/studio.html',
  '/watch.html',
  '/js/stores.js',
  '/js/components.js',
  '/css/style.css',
  'https://cdn.jsdelivr.net/npm/gun/gun.min.js',
  'https://cdn.jsdelivr.net/npm/gun/sea.js'
];

//install listner
self.addEventListener('install', evt => {
  console.log("Service Worker Has Been Installed")
  evt.waitUntil(
    caches.open(staticCache).then(cache => {
      console.log('Caching Shell Assets');
      cache.addAll(assets);
    })
  )
})

//activate listner
self.addEventListener('activate', evt => {
  console.log("Service Worker Has Been Activated")
})

//fetch listner
self.addEventListener('fetch', evt => {
  console.log("Fetch Event", evt)
})
