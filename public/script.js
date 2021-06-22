const socket = io('/')
const videoSlides = document.getElementById('video-slides')
const peer = new Peer()
const myVideo = document.createElement('video')

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

  socket.on('user-connected', userID => {
    connectTheNewUser(userID, videoStream)
  })
})

peer.on('open', id => {
  socket.emit('join-room', DASH_ID, id)
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