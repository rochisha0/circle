//const {getUsers, users} = require('./utils/chat');


const socket = io('/')
const videoSlides = document.getElementById('video-slides')
const peer = new Peer()
const myVideo = document.createElement('video')

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");

const addToUsersBox = (userName) => {
  if (!!document.querySelector(`.${userName}-userlist`)) {
    return;
  }

  const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
  inboxPeople.innerHTML += userBox;
};

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const receivedMsg = `
  <li class="incoming__message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </li>`;

  const myMsg = `
  <li class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </li>`;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};


const userName = prompt('What is your name?')
addToUsersBox(userName);
// Mute your own video
myVideo.muted = true  
const peers = {}

let videoStream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {

  //Append your video
  videoStream = stream;
  addVideoFrontend(myVideo, stream)

  //Answer call
  peer.on('call', function(call) {
    console.log("answer")
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', function(remoteStream) {
        addVideoFrontend(video, remoteStream)
    })
  }, function(err) {
    console.log('Failed to get local stream', err);
  })

  socket.on('user-connected', (userID, username) => {
    connectTheNewUser(userID, videoStream)
  })

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!inputField.value) {
      return;
    }
  
    socket.emit("chat-message", {
      message: inputField.value,
      username: userName,
    });
  
    inputField.value = "";
  });

  socket.on("chat-message", function (data) {
    //console.log(data.name);
    addNewMessage({ user: data.name, message: data.message.message });
  });  
})

peer.on('open', id => {
  socket.emit('join-room', DASH_ID, id, userName)
})

socket.on('user-disconnected', userID => {
  if (peers[userID]) peers[userID].close()
})

//Call new user
function connectTheNewUser(userID, stream) {
  const call = peer.call(userID, stream)
  const video = document.createElement('video')
  call.on('stream', function(remoteStream) {
    addVideoFrontend(video, remoteStream)
  })
}

//Append the stream in grid
function addVideoFrontend(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoSlides.append(video)
}


//module.exports = {addToUsersBox, addToUsersBox};



