let recordedBlobs = [];
let chat = []; 
    
        const MIMETYPE_VIDEO_AUDIO = 'video/webm; codecs="opus,vp8"';
        const MIMETYPE_VIDEO_ONLY = 'video/webm; codecs="vp8"';
        const MIMETYPE_AUDIO_ONLY = 'video/webm; codecs="opus"';

        const MIME_TYPE_USE = MIMETYPE_VIDEO_AUDIO;//Change to the correct one once you change
        const STREAM_ID = user.is.pub;//Probably need a dynamic one make sure your video id is the same for the viewer

        //Config for camera recorder
        const CAMERA_OPTIONS = {
          video: {
            width: 1280,
            height: 720,
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

        function handleDataAvailable(event) {
          if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
            gunStreamer.onDataAvailable;
          }
        }

        function clickDownload() {
          const blob = new Blob(recordedBlobs, { type: MIME_TYPE_USE });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'test.mp4';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);
        }

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
              document.getElementById("download").disabled = true;
              gunDB.get('stream-meta').get('meta').get(STREAM_ID).put(document.getElementById("streamTitle").value);
              recordButton.innerText = "Stop Stream";
              gunDB.get(STREAM_ID + '-chat').get('chat').get(user.is.pub).put(' Welcome Were Live! ');
              break;
            default:
              document.getElementById("streamTitle").disabled = false;
              document.getElementById("shareButton").disabled = false;
              document.getElementById("download").disabled = false;
              recordButton.innerText = "Start Stream";
              break;
          }
        }

        var recorder_config = {
          mimeType: MIME_TYPE_USE,
          video_id: "record_video",//Video html element id
          onDataAvailable: handleDataAvailable,//MediaRecorder data available callback
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
