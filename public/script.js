const socket = io("/");
const videoSlides = document.getElementById("video-slides");
const peer = new Peer({
  secure: true,
  host: "peerjs-server.herokuapp.com",
  port: "443",
});
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

//add message in chat box
const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });

  const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
    <span class="message__author">${user}</span>
      <p>${message}</p>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
    <span class="message__author"> You </span>
      <p>${message}</p>
    </div>
  </div>`;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

//Fetch username from url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const userName = urlParams.get("username");

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
    addVideoFrontend(myVideo, stream);

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
      });

      inputField.value = "";
    });

    socket.on("chat-message", function (data) {
      //Append message
      addNewMessage({
        user: data.message.username,
        message: data.message.message,
      });
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", DASH_ID, id, userName);
});

//Display online users
socket.on("online-users", (data) => {
  users.innerHTML = "";
  data.forEach((user) => {
    users.innerHTML += `<p>${user}</p>`;
  });
});

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
  console.log(userList, chat)
  if(!chat){
    //document.querySelector(".chat").style.display = "flex";
    document.querySelector(".attendee-container").style.display = "none";
    document.querySelector(".chat-container").style.display = "flex";
    document.querySelector(".dashboard-left").style.flex = "0.8";
    chat = 1;
    userList = 0;
  }
    //chatOff();
  else{
    //document.querySelector(".chat").style.display = "none";
    document.querySelector(".chat-container").style.display = "none";
    document.querySelector(".dashboard-left").style.flex = "1";
    chat = 0;
  } 
};
const toggleUserList = () => {
  console.log(userList, chat)
  if(!userList){
    document.querySelector(".chat-container").style.display = "none";
    document.querySelector(".attendee-container").style.display = "flex";
    document.querySelector(".dashboard-left").style.flex = "0.8";
    userList = 1;
    chat = 0;
  }
    
  else{
    document.querySelector(".attendee-container").style.display = "none";
    document.querySelector(".dashboard-left").style.flex = "1";
    userList = 0;
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
  isHandRaised = !isHandRaised;
  if (isHandRaised) {
    socket.emit("raiseHand", {
      userName,
    });
  }
};

//Share screen
const shareScreen = () => {
  navigator.mediaDevices
    .getDisplayMedia({ cursor: true })
    .then((screenStream) => {
      Object.values(peers).map((peer) => {
        console.log(peer);
        peer.peerConnection.getSenders().map((sender) => {
          if (sender.track.kind == "video") {
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
