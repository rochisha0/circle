const socket = io('/')
const videoGrid = document.getElementById('video-slides')
const peer = new Peer()
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

let myVideoStream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
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
    connectToNewUser(userID, myVideoStream)
  })
})

peer.on('open', id => {
  socket.emit('join-room', DASH_ID, id)
})

//Call new user
function connectToNewUser(userID, stream) {
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
  videoGrid.append(video)
}