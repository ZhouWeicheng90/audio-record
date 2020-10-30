function Recorder(stream, mimeType) {
    var chunks = [];
    var mediaRecorder = new MediaRecorder(stream);
    var audioURL = ''
    mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
    }
    mediaRecorder.onstop = function (e) {
        URL.revokeObjectURL(audioURL)
        var blob = new Blob(chunks, { 'type': mimeType });
        audioURL = URL.createObjectURL(blob);
        chunks = [];
    }
    this.stop = function () {
        mediaRecorder.stop();
    }
    this.start = function () {
        mediaRecorder.start();
    }
    this.getUrl = function () {
        return audioURL
    }
}

export default function getRecorder(mimeType = "audio/ogg; codecs=opus") {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return Promise.reject(new Error('当前浏览器不支持录音功能。'));
    }
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        return new Recorder(stream, mimeType)
    })
}

