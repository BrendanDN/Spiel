const STREAM_ID = location.hash.replace("#", "");
const DB_RECORD_META = 'gunmeeting_metadata'
const CUE_SHOW_TIME = 4;
let USER_METADATA = 'metadata_' + STREAM_ID;
const chat = []

function sentMessage(input) {
  sentControlData({ msg: input });
}

function sentControlData(data) {
    data.streamId = STREAM_ID;
    let metaData = gunDB.get(USER_METADATA).put(data);
    gunDB.get(DB_RECORD_META).set(metaData);
}

function receiveData() {

    gunDB.get(DB_RECORD_META).map().on(function (data, id) {
        if (!data) {
          return
        }

        if (data.msg && data.streamId == STREAM_ID) {
          SETCLUE(data.msg);
        }

        if (data.title && data.streamId == STREAM_ID) {
          document.getElementById("user_stream").innerHTML = data.title;
        }
    });
}

function SETCLUE(data) {
  if (chat.length >= 7) {
    chat.shift();
  }
            
  chat.push(data);
  document.getElementById('chat').innerHTML = chat.join("");
}

//Listen on startup
receiveData();
