//Configure GUN to pass to streamer
const peers = ['https://spiel-server-eu.herokuapp.com/gun', 'https://spiel-server-us.herokuapp.com/gun',];
const opt = { peers: peers, localStorage: false, radisk: false };
const gunDB = Gun(opt);

//Configure GUN to pass to streamer
const gun = Gun();
const user = gun.user().recall({sessionStorage: true});
