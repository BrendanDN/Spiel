const err404 = `
<main>
  <div class="center">
    <h1><b>404 error</b></h1>
    <p>Sorry, we could not find the content you were looking for!</p>
  </div>
</main>
`;

const live = `
<main>
  <aside>
    <div class="center">
      <button onclick="gunRecorder.startCamera()">Start Camera</button>
      <button onclick="gunRecorder.startScreenCapture()">Start Screen Capture</button>
      <button id="record_button" onclick="gunRecorder.record()">Start Stream</button>
      <hr>
      <button id="shareButton" onclick="document.getElementById('shareDialog').showModal()">Share Stream</button>
      <hr>
      <pre style="font-size: clamp(1rem, 2vw, 2.5rem)">Emotes:</pre>
      <p id="chat"></p>
    </div>
   </aside>
  <div class="center">
    <div class="container">
      <ul>
        <li><label for="streamTitle">Stream Title:</label></li>
        <li><input type="text" id="streamTitle" name="streamTitle"></li>
        <li><pre style="font-size: clamp(1rem, 2vw, 2.5rem)">Streamer Preview:</pre></li>
        <li><video aria-label='streamer preview' width="65%" id="record_video" autoplay controls muted/></li>
        <li><pre style="font-size: clamp(1rem, 2vw, 2.5rem)">Viewer Preview</pre></li>
        <li><video aria-label='viewer preview' width="65%" id="video" autoplay muted/></li>
      </ul>
    </div>
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
      </div>
      <div class="center">
        <button onclick="document.getElementById('shareDialog').close()">Close</button>
      </div>
    </div>
  </dialog>
  <script>
    const streamer = user.is.pub;
    const winLoc = window.location.origin + "/?content=watch&search=" + streamer;
    let chat = []; 
    
    const MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="opus,vp8"';
    const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp8"';
    const MIMETYPE_AUDIO_ONLY = 'video/webm; codecs="opus"';

    const MIME_TYPE_USE = MIMETYPE_VIDEO_AUDIO;//Change to the correct one once you change
    const STREAM_ID = streamer//Probably need a dynamic one make sure your video id is the same for the viewer

    document.getElementById("facebook").href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(winLoc);
    document.getElementById("whatsapp").href = "https://api.whatsapp.com/send?text=Im Live: " + encodeURIComponent(winLoc);
    document.getElementById("weibo").href = "http://service.weibo.com/share/share.php?url=&appkey=&title=Im Live: " + encodeURIComponent(winLoc) + "&pic=&ralateUid=&language=zh_cn";
    document.getElementById("twitter").href = "https://twitter.com/intent/tweet?url=" + encodeURIComponent(winLoc);
    document.getElementById("reddit").href = "https://www.reddit.com/submit?url=" + encodeURIComponent(winLoc);

    //Config for camera recorder
    const CAMERA_OPTIONS = {
      video: {
        width: 1280,
        height: 720,
        facingMode: "user",
        frameRate: 60
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

    // Get data from gun and pass along to viewer
    gunDB.get(STREAM_ID).on(function (data) {
      gunViewer.onStreamerData(data);
    });
    
    // Get chat data from gun and pass along to viewer
    gunDB.get(STREAM_ID + '-chat').get('chat').map().on(function (data) {
      if (chat.length >= 7) {
        chat.shift();
      }
      chat.push(data);
      document.getElementById('chat').innerHTML = chat.join("");
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
          document.getElementById("streamTitle").disabled = true;
          document.getElementById("shareButton").disabled = true;
          gunDB.get('stream-meta').get('meta').get(STREAM_ID).put(document.getElementById("streamTitle").value);
          recordButton.innerText = "Stop Stream";
          gunDB.get(STREAM_ID + '-chat').get('chat').get(user.is.pub).put(' Welcome Were Live! ');
          break;
        default:
          document.getElementById("streamTitle").disabled = false;
          document.getElementById("shareButton").disabled = false;
          recordButton.innerText = "Start Stream";
          break;
      }
    }

    var recorder_config = {
      mimeType: MIME_TYPE_USE,
      video_id: "record_video",//Video html element id
      onDataAvailable: gunStreamer.onDataAvailable,//MediaRecorder data available callback
      onRecordStateChange: onRecordStateChange,//Callback for recording state
      //audioBitsPerSecond: 128000,//Audio bits per second this is the lowest quality
      //videoBitsPerSecond: 300000,//Video bits per second this is the lowest quality
      recordInterval: 2000,//Interval of the recorder higher will increase delay but more buffering. Lower will not do much. Due limitiation of webm
      cameraOptions: CAMERA_OPTIONS,//The camera and screencast options see constant
      // experimental: true,//This is custom time interval and very unstable with audio. Only video is more stable is interval quick enough? Audio
      debug: false//For debug logs
    }

    //Init the recorder
    const gunRecorder = new GunRecorder(recorder_config);
  </script>
</main>
`;

const watch = `
<main>
  <div class="center">
    <div class="container">
      <pre style="font-size: clamp(1rem, 2vw, 2.5rem)">Emotes: </pre>
      <p id="chat"></p>
      <div aria-label='emote buttons'>
        <ul class="container">
          <li><button onclick="emotes('👋')">👋 Hi</button></li>
          <li><button onclick="emotes('🤣')">🤣 LUL</button></li>
          <li><button onclick="emotes('😞')">😞 L</button></li>
          <li><button onclick="emotes('😨')">😨 what</button></li>
          <li><button onclick="emotes('👍')">👍 good</button></li>
          <li><button onclick="emotes('😴')">😴 Zzz</button></li>
          <li><button onclick="emotes('🤟')">🤟 Luv U</button></li>
          <li><button onclick="emotes('🔥')">🔥 FIRE</button></li>
        </ul>
      </div>
      <video id="video" autoplay controls/>
    </div>
    <hr>
    <div class="center">
      <button onclick="document.getElementById('shareDialog').showModal()">Share Creator</button>
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
        </div>
        <div class="center">
          <button onclick="document.getElementById('shareDialog').close()">Close</button>
        </div>
      </div>
    </dialog>
    <script>
      const streamer = urlParams.get('search');
      let chat = []
          
      //Basic configurations for mime types
      const MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="vp8,opus"';
      const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp8"';

      document.getElementById("facebook").href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location);
      document.getElementById("whatsapp").href = "https://api.whatsapp.com/send?text=" + encodeURIComponent(window.location);
      document.getElementById("weibo").href = "http://service.weibo.com/share/share.php?url=" + encodeURIComponent(window.location) + "&appkey=&title=&pic=&ralateUid=&language=zh_cn";
      document.getElementById("twitter").href = "https://twitter.com/intent/tweet?url=" + encodeURIComponent(window.location);
      document.getElementById("reddit").href = "https://www.reddit.com/submit?url=" + encodeURIComponent(window.location);

      //Configure GunViewer 
      var viewer_config = {
        mimeType: MIMETYPE_VIDEO_AUDIO,
        streamerId: "video",//ID of the streamer
        debug: false,//For debug logs  
      }

      var gunViewer = new GunViewer(viewer_config);

      //Get data from gun and pass along to viewer
      gunDB.get(streamer).on(function (data) {
        //Make sure the video is in the html or create on here dynamically.
        gunViewer.onStreamerData(data);
      });

      function emotes(emoji){
        if (user.is){
          gunDB.get(streamer + '-chat').get('chat').get(user.is.pub).put(emoji);
        } else {
          window.location.search = 'content=signin';
        }
      }

      gunDB.get(streamer + '-chat').get('chat').map().on(function (data) {
        if (chat.length >= 7) {
          chat.shift();
        }
        chat.push(data);
        document.getElementById('chat').innerHTML = chat.join("");
      });
    </script>
  </div>
</main>
`;

const auth = `
<main>
  <form class="center">
    <fieldset>
      <legend id="title">Sign In</legend>
      <label for="alias">Username:</label><br>
      <input type="text" id="alias"></input><br><br>
      <label for="pass">Password:</label><br>
      <input type="password" id="pass"></input><br><br>
      <input type="button" id="action" value="Sign In" onclick="signIn()">
    <fieldset>
  </form>
  <script>
    window.signIn = function() {
      user.auth(document.getElementById("alias").value, document.getElementById("pass").value, function(ack) {
        if (ack.err) {
          alert(ack.err);
        } else {
          location.reload();
        }
      });
    }

    window.signUp = function() {
      user.create(document.getElementById("alias").value, document.getElementById("pass").value, function(ack) {
        if (ack.err) {
          alert(ack.err);
        } else {
          confirm("User created, to continue sign in!");
          window.location = "/?content=signin";
        }
      });
    }
    
    if (content == 'signup') {
      document.getElementById("title").innerHTML = 'Sign Up'; 
      document.getElementById("action").value = 'Sign Up';
      document.getElementById("action").onclick = signUp;
    } 
  </script>
</main>
`;

const home = `
<main>
  <div class="center">
    <h1>The Just Chatting Twitch alternative live streaming service</h1>
    <ul class="container" id="streams"></ul>
    <p class="container">Appears you have reached the end of the streamer list, wel done :)</p>
  </div>
  <script>
    const winLoc = window.location.origin + "/?content=watch&search=";

    gunDB.get('stream-meta').get('meta').map().once(async function (data, id) {
      document.getElementById('streams').innerHTML += '<li><pre>' + data + '</pre style="font-size: clamp(1rem, 2vw, 2.5rem)"><a href="' + winLoc + id + '"><button aria-label="Watch ' + data + '">Watch Now</button></a></li>';
    });
  </script>
</main>
`;
