const MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="opus,vp8"';
const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp8"';
const MIMETYPE_AUDIO_ONLY = 'video/webm; codecs="opus"';

//Configure GUN to pass to streamer
const opt = { peers: ['https://spiel-server-eu.herokuapp.com/gun', 'https://spiel-server-us.herokuapp.com/gun'], localStorage: false, radisk: false };
const gunDB = Gun(opt);

//Configure GUN to pass to streamer
const gun = Gun({peers: 'https://gun-manhattan.herokuapp.com/gun'});
const user = gun.user().recall({sessionStorage: true});

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js')
    .then((reg) => console.log("Service Worker Registered!", reg))
    .catch((err) => console.log("Service Worker Not Registered.", err))
}
