const err404 = `
<article>
  <pre><b>404 error</b></pre>
  <pre>Sorry, we could not find the content you were looking for!</pre>
</article>
`;

const live = `
<article>
  <aside class="lAside">
    <button class="liveButton" type="button" onclick="gunRecorder.startCamera()">Start Camera</button>
    <button class="liveButton" id="record_button" type="button" onclick="gunRecorder.record()">Start Recording</button>
    <hr>
    <button onclick="window.document.getElementById('shareDialog').showModal()">Share Stream</button>
  </aside>
  <div>
    <div class="center">
      <div>
        <h5>Emotes: </h5>
        <div id="chat"></div>
      </div>
      <video id="record_video" width="45%" autoplay controls muted/>
      <video id="video" width="45%" autoplay muted/>
    </div>
  </div>
  <script>
    const streamer = user.is.pub;
    const winLoc = window.location.origin + "/?content=watch%26search=" + streamer;
    let arr = []; 
    
    const MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="opus,vp8"';
    const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp8"';
    const MIMETYPE_AUDIO_ONLY = 'video/webm; codecs="opus"';

    const MIME_TYPE_USE = MIMETYPE_VIDEO_AUDIO;//Change to the correct one once you change
    const STREAM_ID = streamer//Probably need a dynamic one make sure your video id is the same for the viewer

    //Config for camera recorder
    const CAMERA_OPTIONS = {
      video: {
        width: 320,
        height: 280,
        facingMode: "user",
        frameRate: 24
      }, audio: true
    }

    //Configure GunViewer 
    var viewer_config = {
      mimeType: MIME_TYPE_USE,
      streamerId: "video",//ID of the streamer
      catchup: false,//Skip to last frame when there is to much loading. Set to false to increase smooth playback but with latency
      debug: false,//For debug logs  
    }

    var gunViewer = new GunViewer(viewer_config);

    //Configure GUN to pass to streamer
    var peers = ['https://spiel-server-eu.herokuapp.com/gun', 'https://spiel-server-us.herokuapp.com/gun'];
    var opt = { peers: peers, localStorage: false, radisk: false };
    var gunDB = Gun(opt);

    // Get data from gun and pass along to viewer
    gunDB.get(STREAM_ID).on(function (data) {
      gunViewer.onStreamerData(data);
    });

    gunDB.get(streamer + '-chat').get('chat').map().on(function (data) {
      if (arr.length >= 7) {
        arr.shift();
      }
      
      arr.push(data);

      document.getElementById('chat').innerHTML = '<p style="font-size: 150%">' + arr.join("") + '<p/>';
    });

    //Config for the GUN GunStreamer
    var streamer_config = {
      dbRecord: "streamers",//The root of the streams
      streamId: STREAM_ID,//The user id you wanna stream  
      gun: gunDB,//Gun instance
      debug: false,//For debug logs
      onStreamerData: gunViewer.onStreamerData,//If you want manually handle the data manually
      url: "https://cdn.jsdelivr.net/gh/QVDev/GunStreamer@0.0.9/js/parser_worker.js"//webworker load remote
    }

    //GUN Streamer is the data side. It will convert data and write to GUN db
    const gunStreamer = new GunStreamer(streamer_config)

    //This is a callback function about the recording state, following states possible
    // STOPPED: 1¸
    // RECORDING:2
    // NOT_AVAILABLE:3
    // UNKNOWN:4
    var onRecordStateChange = function (state) {
      var recordButton = document.getElementById("record_button");
      switch (state) {
        case recordState.RECORDING:
          recordButton.innerText = "Stop recording";
          gunDB.get(streamer + '-chat').get('chat').get(user.is.pub).put(' Welcome! Were Live: ')
          break;
        default:
          recordButton.innerText = "Start recording";
          break;
      }
    }

    var recorder_config = {
      mimeType: MIME_TYPE_USE,
      video_id: "record_video",//Video html element id
      onDataAvailable: gunStreamer.onDataAvailable,//MediaRecorder data available callback
      onRecordStateChange: onRecordStateChange,//Callback for recording state
      //audioBitsPerSecond: 6000,//Audio bits per second this is the lowest quality
      //videoBitsPerSecond: 100000,//Video bits per second this is the lowest quality
      recordInterval: 700,//Interval of the recorder higher will increase delay but more buffering. Lower will not do much. Due limitiation of webm
      cameraOptions: CAMERA_OPTIONS,//The camera and screencast options see constant
      // experimental: true,//This is custom time interval and very unstable with audio. Only video is more stable is interval quick enough? Audio
      debug: false//For debug logs
    }

    //Init the recorder
    const gunRecorder = new GunRecorder(recorder_config);
  </script>
  <dialog id="shareDialog">
    <div id="modal" class="center">
      <div class="center">
        <ul>
          <li><a id="facebook" href="" target="_blank">Facebook</a></li>
          <li><a id="whatsapp" href="" target="_blank">WhatsApp</a></li>
          <li><a id="weibo" href="">Weibo</a></li>
          <li><a id="twitter" href="">Twitter</a></li>
          <li><a id="reddit" href="">Reddit</a></li>
        </ul>
      <script>
        window.document.getElementById("facebook").href = "https://www.facebook.com/sharer/sharer.php?u=" + winLoc;
        window.document.getElementById("whatsapp").href = "https://api.whatsapp.com/send?text=Im Live: " + winLoc;
        window.document.getElementById("weibo").href = "http://service.weibo.com/share/share.php?url=&appkey=&title=Im Live: " + winLoc + "&pic=&ralateUid=&language=zh_cn";
        window.document.getElementById("twitter").href = "https://twitter.com/intent/tweet?url=Im Live: " + winLoc;
        window.document.getElementById("reddit").href = "https://www.reddit.com/submit?url=Im Live: " + winLoc;
      </script>
    </div>
      <div class="center">
        <button onclick="window.document.getElementById('shareDialog').close()">Close</button>
      </div>
    </div>
  </dialog>
</article>
`;

const watch = `
<article>
  <aside class="rAside">
    <ul>
      <li><button onclick="emotes('👋')">👋 Hi!</button></li>
      <li><button onclick="emotes('🤣')">🤣 LUL</button></li>
      <li><button onclick="emotes('😞')">😞 NOOOOO</button></li>
      <li><button onclick="emotes('😨')">😨 what...</button></li>
      <li><button onclick="emotes('😴')">😴 Zzz</button></li>
      <li><button onclick="emotes('🤟')">🤟 Luv Ya</button></li>
      <li><button onclick="emotes('😎')">😎 Cool</button></li>
      <li><button onclick="emotes('🔥')">🔥 FIRE!</button></li>
    </ul>
  </aside>
  <div class="center">
    <div>
      <h5>Emotes: </h5>
      <div id="chat"></div>
    </div>
    <video id="video" width="45%" autoplay/>
    <script>
      const streamer = urlParams.get('search').toString();
      let arr = []

      function emotes(emoji) {
        if (user.is) {
          gunDB.get(streamer + '-chat').get('chat').get(user.is.pub).put(emoji)
        } else {
          insertParam('content', 'auth');
        }
      }
          
      //Basic configurations for mime types
      const MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="vp8,opus"';
      const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp8"';

      //Configure GunViewer 
      var viewer_config = {
        mimeType: MIMETYPE_VIDEO_AUDIO,
        streamerId: "video",//ID of the streamer
        debug: false,//For debug logs  
      }

      var gunViewer = new GunViewer(viewer_config);

      //Configure GUN to pass to streamer
      var peers = ['https://spiel-server-eu.herokuapp.com/gun', 'https://spiel-server-us.herokuapp.com/gun'];
      var opt = { peers: peers, localStorage: false, radisk: false };
      var gunDB = Gun(opt);

      //Get data from gun and pass along to viewer
      gunDB.get(streamer).on(function (data) {
        //Make sure the video is in the html or create on here dynamically.
        gunViewer.onStreamerData(data);
      });

      gunDB.get(streamer + '-chat').get('chat').map().on(function (data) {
        if (arr.length >= 7) {
          arr.shift();
        }
        arr.push(data);
        document.getElementById('chat').innerHTML = '<p style="font-size: 150%">' + arr.join("") + '</p>';
      });
    </script>
  </div>
  <hr>
  <div class="center">
    <button onclick="window.document.getElementById('shareDialog').showModal()">Share Creator</button>
  </div>
  <dialog id="shareDialog">
    <div id="modal" class="center">
      <div class="center">
        <ul>
          <li><a id="facebook" href="" target="_blank">Facebook</a></li>
          <li><a id="whatsapp" href="" target="_blank">WhatsApp</a></li>
          <li><a id="weibo" href="">Weibo</a></li>
          <li><a id="twitter" href="">Twitter</a></li>
          <li><a id="reddit" href="">Reddit</a></li>
        </ul>
      <script>
        document.getElementById("facebook").href = "https://www.facebook.com/sharer/sharer.php?u=" + window.location;
        document.getElementById("whatsapp").href = "https://api.whatsapp.com/send?text=" + window.location;
        document.getElementById("weibo").href = "http://service.weibo.com/share/share.php?url=" + window.location + "&appkey=&title=&pic=&ralateUid=&language=zh_cn";
        document.getElementById("twitter").href = "https://twitter.com/intent/tweet?url=" + window.location;
        document.getElementById("reddit").href = "https://www.reddit.com/submit?url=" + window.location;
      </script>
    </div>
      <div class="center">
        <button onclick="window.document.getElementById('shareDialog').close()">Close</button>
      </div>
    </div>
  </dialog>
</article>
`;

const auth = `
<article>
  <h1>Your Spiel Account</h1>
     <form>
      <span id="error" style="color:red;"></span>
      <label for="alias">Username:</label><br>
      <input type="text" id="alias" name="username"></input><br><br>
      <label for="pass">Password:</label><br>
      <input type="password" id="pass" name="password"></input><br><br>
      <input type="submit" value="Sign In" onclick="signin()"><br><br>
      <input type="submit" value="Sign Up" onclick="signup()"><br><br>
    </form>
  <script>
    function signin() {
      user.auth(document.getElementById("alias").value, document.getElementById("pass").value, function(ack) {
        if (ack.err) {
          alert(ack.err);
        }
          
        location.reload();
      });
    }

    function signup() {
      user.create(document.getElementById("alias").value, document.getElementById("pass").value, function(ack) {
        if (ack.err) {
          alert(ack.err);
        } else {
          confirm("User created, to continue sign in!");
        }
      });
    }
  </script>
</article>
`;

const home = `
<article>
  <h1>Welcome! :)</h1>
  <p>The Just Chatting Twitch alternative live streaming service</p>
</article>
`;
