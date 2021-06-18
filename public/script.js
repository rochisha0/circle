
const videoSlides = document.getElementById('video-slides');
const myVideoStream = document.createElement('video');
myVideoStream.muted = true;

let videoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    videoStream = stream;
    addVideo(myVideoStream, stream);
})

const addVideo = (video, stream) =>{
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoSlides.append(video);
}