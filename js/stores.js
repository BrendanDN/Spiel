//Configure GUN to pass to streamer
const peers = ['https://spiel-server-eu.herokuapp.com/gun', 'https://spiel-server-us.herokuapp.com/gun', 'https://relay.peer.ooo/gun', 'https://gun-manhattan.herokuapp.com/gun', 'https://peer.wallie.io/gun'];
const opt = { peers: peers, localStorage: false, radisk: false };
const gunDB = Gun(opt);

//Configure GUN to pass to streamer
const gun = Gun({peers: peers, localStorage: false});
const user = gun.user().recall({sessionStorage: true});

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js')
    .then((reg) => console.log("Service Worker Registered!", reg))
    .catch((err) => console.log("Service Worker Not Registered.", err))
}
