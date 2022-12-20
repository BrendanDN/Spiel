/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

'use strict';

/* globals MediaRecorder */
const MIME_TYPE_USE = MIMETYPE_VIDEO_AUDIO;
const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', function(){
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer(MIME_TYPE_USE);
  console.log('Source buffer: ', sourceBuffer);
});
let mediaRecorder;
let recordedBlobs;
let sourceBuffer;

// const downloadButton = document.getElementById('download');
// downloadButton.addEventListener('click', () => {
//     const blob = new Blob(recordedBlobs, { type: MIME_TYPE_USE });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.style.display = 'none';
//     a.href = url;
//     a.download = 'test.webm';
//     document.body.appendChild(a);
//     a.click();
//     setTimeout(() => {
//         document.body.removeChild(a);
//         window.URL.revokeObjectURL(url);
//     }, 100);
// });

function custmOnDataAvailable(event) {
  if (event.data &&  event.data.size > 0) {
    recordedBlobs.push(event.data);
    var blob = event.data;
    var response = new Response(blob).arrayBuffer().then(function (arrayBuffer) {
      blob = null;
      if (parseWorker != undefined) {
        parseWorker.postMessage(arrayBuffer);
      }
    });
    response = null;
  } else {
    gunStreamer.debugLog("data not available")
  }
}

function startRecording(stream) {
    recordedBlobs = [];
    let options = { mimeType: MIME_TYPE_USE };

    try {
        mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder:', e);
        errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
        return;
    }

    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    const downloadButton = document.getElementById('download');
    downloadButton.disabled = true;
    mediaRecorder.onstop = (event) => {
        console.log('Recorder stopped: ', event);
    };
    mediaRecorder.ondataavailable = custmOnDataAvailable;
    mediaRecorder.start(100);
    console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
    mediaRecorder.stop();
    const downloadButton = document.getElementById('download');
    downloadButton.disabled = false;
    console.log('Recorded Blobs: ', recordedBlobs);
}

