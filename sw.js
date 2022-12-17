const today = new Date();
const date = String(today.getFullYear())+String((today.getMonth()+1))+String(today.getDate());
const staticCache = parseInt(date);
const assets = [
  '/',
  '/index.html',
  '/auth.html',
  '/auth.html?/auth=signin',
  '/auth.html?/auth=signup',
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

  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key < staticCache)
        .map(key => caches.delete(key))
      )
    })
  )
})

//fetch listner
self.addEventListener('fetch', evt => {
  console.log("Fetch Event", evt)

  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
})
