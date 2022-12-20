const today = new Date();
const date = String(today.getFullYear())+String((today.getMonth()+1))+String(today.getDate())+String(today.getHours())+String(today.getMinutes());
const dynamicCache = parseInt(date);
const assets = [
  '/',
  '/index.html',
  '/js/stores.js',
  '/js/components.js',
  '/css/style.css',
  '/fallback.html'
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

//install listner
self.addEventListener('install', evt => {
  console.log("Service Worker Has Been Installed")
  
  evt.waitUntil(
    caches.open(dynamicCache).then(cache => {
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
        .filter(key => key != dynamicCache)
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
      return cacheRes || fetch(evt.request).then(fetchRes => {
        return caches.open(dynamicCache).then(cache => {
          cache.put(evt.request.url, fetchRes.clone());
          limitCacheSize(dynamicCache, 21);
          return fetchRes;
        })
      })
    }).catch(() => {
      if (evt.request.url.IndexOf('.html') > -1){
        return caches.match('/fallback.html')
      }
    })
  );
})
