const socket = io("/");
const peer = new Peer();
const myVideo = document.createElement("video");
// Mute your own stream
myVideo.muted = true;

//get html elements
const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");
const users = document.querySelector(".users");
const popUp = document.querySelector(".popuptext");
const videoSlides = document.getElementById("video-slides");
const myVideoSlides = document.getElementById("my-video");

//add message in chat box
const addNewMessage = ({ user, message, image }) => {
  const receivedMsg = `
  <div class="incoming__message">
    <div class="chat__image"> <img src="${image}"> </div>
    <div class="received__message">
    <span class="message__author">${user}</span>
      <p>${message}</p>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
    <span class="message__author"> You </span>
      <p>${message} </p>
    </div>
    <div class="chat__image"> <img src="${image}"> </div>
  </div>`;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

const peers = {};

let videoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    //Append your video
    videoStream = stream;
    addMyVideoFrontend(myVideo, stream);

    //Answer call
    peer.on(
      "call",
      function (call) {
        console.log("answer");
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", function (remoteStream) {
          addVideoFrontend(video, remoteStream);
        });

        call.on("close", () => {
          video.remove();
        });
        peers[call.peer] = call;
      },
      function (err) {
        console.log("Failed to get local stream", err);
      }
    );

    socket.on("user-connected", (userID, username) => {
      connectTheNewUser(userID, videoStream);
    });

    //Input message
    messageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!inputField.value) {
        return;
      }
      //Emit message for all users
      socket.emit("chat-message", {
        message: inputField.value,
        username: userName,
        image: userImage,
      });

      inputField.value = "";
    });

    socket.on("chat-message", function (data) {
      //Append message
      addNewMessage({
        user: data.message.username,
        message: data.message.message,
        image: data.message.image,
      });
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", DASH_ID, id, userName, userImage);
});

//Display online users
socket.on("online-users", (data) => {
  users.innerHTML = "";
  data.forEach((user) => {
    users.innerHTML += `<p><img src="${user[1]}"> ${user[0]}</p>`;
  });
});

//Disconnect user
socket.on("user-disconnected", (userID) => {
  if (peers[userID]) peers[userID].close();
});

//Call new user
function connectTheNewUser(userID, stream) {
  const call = peer.call(userID, stream);
  const video = document.createElement("video");
  call.on("stream", function (remoteStream) {
    addVideoFrontend(video, remoteStream);
  });
}

//Append my video
function addMyVideoFrontend(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  myVideoSlides.append(video);
}

//Append the stream in grid
function addVideoFrontend(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoSlides.append(video);
}

let chat = 0;
let userList = 0;
//Toggle chat container
const toggleChat = () => {
  console.log(userList, chat);
  if (!chat) {
    //document.querySelector(".chat").style.display = "flex";
    document.querySelector(".attendee-container").style.display = "none";
    document.querySelector(".chat-container").style.display = "flex";
    document.querySelector(".dashboard-left").style.flex = "0.8";
    chat = 1;
    userList = 0;
    chatOn();
    userOff();
  } else {
    //document.querySelector(".chat").style.display = "none";
    document.querySelector(".chat-container").style.display = "none";
    document.querySelector(".dashboard-left").style.flex = "1";
    chat = 0;
    chatOff();
  }
};
const toggleUserList = () => {
  console.log(userList, chat);
  if (!userList) {
    document.querySelector(".chat-container").style.display = "none";
    document.querySelector(".attendee-container").style.display = "flex";
    document.querySelector(".dashboard-left").style.flex = "0.8";
    userList = 1;
    chat = 0;
    userOn();
    chatOff();
  } else {
    document.querySelector(".attendee-container").style.display = "none";
    document.querySelector(".dashboard-left").style.flex = "1";
    userList = 0;
    userOff();
  }
};

//Toggle Audio
const muteUnmute = () => {
  const audioOn = videoStream.getAudioTracks()[0].enabled;
  if (audioOn) {
    videoStream.getAudioTracks()[0].enabled = false;
    micOff();
  } else {
    micOn();
    videoStream.getAudioTracks()[0].enabled = true;
  }
};

//Toggle Video
const playStop = () => {
  let videoOn = videoStream.getVideoTracks()[0].enabled;
  if (videoOn) {
    videoStream.getVideoTracks()[0].enabled = false;
    camOff();
  } else {
    camOn();
    videoStream.getVideoTracks()[0].enabled = true;
  }
};

//Hand raise
let isHandRaised = false;
const raiseHand = () => {
  isHandRaised = true;
  if (isHandRaised) {
    socket.emit("raiseHand", {
      userName,
    });
  }
};

//Show pop up when hand is raised
socket.on("handRaised", function (user) {
  console.log(user.userName);
  popUp.innerHTML = "";
  popUp.innerHTML += `<p>Hand raised by ${user.userName}</p>`;
  popUp.classList.add("show");

  setTimeout(function () {
    popUp.classList.remove("show");
  }, 5000);
});

//Share screen
const shareScreen = () => {
  navigator.mediaDevices
    .getDisplayMedia({
      video: { cursor: true },
      audio: true,
    })
    .then((screenStream) => {
      Object.values(peers).map((peer) => {
        console.log(peer);
        peer.peerConnection.getSenders().map((sender) => {
          if (sender.track.kind == "video") {
            console.log(sender.track.kind);
            sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        });
      });
      myVideo.srcObject = screenStream;
      screenStream.getTracks()[0].onended = () => {
        Object.values(peers).map((peer) => {
          peer.peerConnection.getSenders().map((sender) => {
            if (sender.track.kind == "video") {
              sender.replaceTrack(videoStream.getVideoTracks()[0]);
            }
          });
        });
        myVideo.srcObject = videoStream;
      };
    });
};

// record screen
let recorder;
let chunks = [];
var options = {
  mimeType: "video/webm; codecs=vp9",
};
const recordScreen = () => {
  navigator.mediaDevices
    .getDisplayMedia({
      video: { mediaSource: "screen" },
      audio: true,
    })
    .then((recordStream) => {
      recorder = new MediaRecorder(recordStream, options);
      recorder.start();
      recorder.ondataavailable = (e) => chunks.push(e.data);

      recordStream.getTracks()[0].onended = () => {
        recorder.stop();
        const completeBlob = new Blob(chunks, { type: "video/webm" });
        console.log(URL.createObjectURL(completeBlob));
        //Download
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = URL.createObjectURL(completeBlob);
        a.download = "recordedvideo.mp4";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
        chunks = [];
      };
    });
};

const toggleFullScreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
    setFullScreen();
  } else {
    element.requestFullscreen();
    setExitScreen();
  }
}

//end call
const endCall = () => {
  myVideo.remove();
  peer.destroy();
  history.go(-1);
};

//Toggle micbutton
const micOn = () => {
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-mic" viewBox="0 0 16 16">
  <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
  <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
  </svg>
  `;
  document.querySelector(".mic-button").innerHTML = html;
};

const micOff = () => {
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" class="bi bi-mic-mute" viewBox="0 0 16 16">
  <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879l-1-1V3a2 2 0 0 0-3.997-.118l-.845-.845A3.001 3.001 0 0 1 11 3z"/>
  <path d="m9.486 10.607-.748-.748A2 2 0 0 1 6 8v-.878l-1-1V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
  </svg>
  `;
  document.querySelector(".mic-button").innerHTML = html;
};

//Toggle cam button
const camOn = () => {
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-camera-video" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
  </svg>
  `;
  document.querySelector(".cam-button").innerHTML = html;
};

const camOff = () => {
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" class="bi bi-camera-video-off" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518l.605.847zM1.428 4.18A.999.999 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634l.58.814zM15 11.73l-3.5-1.555v-4.35L15 4.269v7.462zm-4.407 3.56-10-14 .814-.58 10 14-.814.58z"/>
  </svg>
  `;
  document.querySelector(".cam-button").innerHTML = html;
};

//Toggle Chat button

const chatOn = () => {
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-chat-fill" viewBox="0 0 16 16">
  <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9.06 9.06 0 0 0 8 15z"/>
  </svg>
  `;
  document.querySelector(".chat-button").innerHTML = html;
};

const chatOff = () => {
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-chat" viewBox="0 0 16 16">
  <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
  </svg>
  `;
  document.querySelector(".chat-button").innerHTML = html;
};

//Toggle People button

const userOn = () => {
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
  <path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
  <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
  </svg>
  `;
  document.querySelector(".people-button").innerHTML = html;
};

const userOff = () => {
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-people" viewBox="0 0 16 16">
  <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
  </svg>
  `;
  document.querySelector(".people-button").innerHTML = html;
};

const setFullScreen = () => {
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrows-fullscreen" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707zm0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707zm-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707z"/>
  </svg>
  `;
  document.querySelector(".full-screen-button").innerHTML = html;
};

const setExitScreen = () => {
  const html = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fullscreen-exit" viewBox="0 0 16 16">
  <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
  </svg>
  `;
  document.querySelector(".full-screen-button").innerHTML = html;
};