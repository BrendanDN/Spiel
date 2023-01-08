const YOUR_ID = getID();
      let recordedBlobs = [];
      document.getElementById("streamid").id = YOUR_ID;

      function getID() {
        if (location.hash == "") {
          return crypto.getRandomValues(new Uint32Array(1)).toString(36).substring(2, 8);
        } else {
          return location.hash.replace("#", "");
        }
      }

      function handleDataAvailable(event) {
        gunStreamer.onDataAvailable(event);
        
        if (event.data && event.data.size > 0) {
          recordedBlobs.push(event.data);
        }
      }

      function Download() {
        var self = this
        const blob = new Blob(recordedBlobs, { type: MIME_TYPE_USE });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'stream.mp4';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
      }
      
      //Configure GunViewer 
      var viewer_config = {
        mimeType: MIME_TYPE_USE,
        streamerId: YOUR_ID,//ID of the streamer
        catchup: false,//Skip to last frame when there is to much loading. Set to false to increase smooth playback but with latency
        debug: false,//For debug logs  
      }

      var gunViewer = new GunViewer(viewer_config);

      // Get data from gun and pass along to viewer
      gunDB.get(YOUR_ID).on(function (data) {
        gunViewer.onStreamerData(data);
      });

      //Config for the GUN GunStreamer
      var streamer_config = {
        dbRecord: "spielstreams",//The root of the streams
        streamId: YOUR_ID,//The user id you wanna stream  
        gun: gunDB,//Gun instance
        debug: false,//For debug logs
        onStreamerData: gunViewer.onStreamerData,//If you want manually handle the data manually
        url: "https://cdn.jsdelivr.net/gh/QVDev/GunStreamer/js/parser_worker.js"//webworker load remote
      }
      
      //GUN Streamer is the data side. It will convert data and write to GUN db
      const gunStreamer = new GunStreamer(streamer_config)

      var onRecordStateChange = function (state) {
        var recordButton = document.getElementById("record_button");
        switch (state) {
          case recordState.RECORDING:
            recordButton.innerText = "Stop recording";
            break;
          default:
            recordButton.innerText = "Start recording";
            break;
        }
      }

      var recorder_config = {
        mimeType: MIME_TYPE_USE,
        video_id: "record_video",//Video html element id
        onDataAvailable: handleDataAvailable,//MediaRecorder data available callback
        onRecordStateChange: onRecordStateChange,//Callback for recording state
        // audioBitsPerSecond: 6000,//Audio bits per second this is the lowest quality
        // videoBitsPerSecond: 100000,//Video bits per second this is the lowest quality
        recordInterval: 800,//Interval of the recorder higher will increase delay but more buffering. Lower will not do much. Due limitiation of webm
        cameraOptions: CAMERA_OPTIONS,//The camera and screencast options see constant
        // experimental: true,//This is custom time interval and very unstable with audio. Only video is more stable is interval quick enough? Audio
        debug: false//For debug logs
      }

      //Init the recorder
      const gunRecorder = new GunRecorder(recorder_config);