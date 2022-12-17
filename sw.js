//install listner
self.addEventListener('install', evt => {
  console.log("Service Worker Has Been Installed")
})

//activate listner
self.addEventListener('activate', evt => {
  console.log("Service Worker Has Been Activated")
})

//fetch listner
self.addEventListener('fetch', evt => {
  console.log("Fetch Event", evt)
})
