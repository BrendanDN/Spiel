const MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="opus,vp9"';
const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp9"';
const MIMETYPE_AUDIO_ONLY = 'video/webm; codecs="opus"';
const MIME_TYPE_USE = MIMETYPE_VIDEO_AUDIO;

//Configure GUN to pass to streamer
const peers = ['https://spiel-server-eu.herokuapp.com/gun', 'https://spiel-server-us.herokuapp.com/gun', 'https://relay.peer.ooo/gun', 'https://gun-manhattan.herokuapp.com/gun', 'https://peer.wallie.io/gun'];
const opt = { peers: peers, localStorage: false, radisk: false };
const gunDB = Gun(opt);

//Configure GUN to pass to streamer
const gun = Gun({peers: peers});
const user = gun.user().recall({sessionStorage: true});

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js')
    .then((reg) => console.log("Service Worker Registered!", reg))
    .catch((err) => console.log("Service Worker Not Registered.", err))
}
