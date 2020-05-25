import encodeWAV from './utiles/encodeWAV'
import audioTransform from './utiles/audioTransform'

window.URL = window.URL || window.webkitURL;
//获取计算机的设备：摄像头或者录音设备
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
let audioContext = window.AudioContext || window.webkitAudioContext;
var HZRecorder = function (stream, outConf = {}, inConf = {}) {
    // 初始化：  
    inConf.channelCount = inConf.channelCount || 1;
    inConf.sampleBits = inConf.sampleBits || 16//这个怎么确定？
    outConf.sampleBits = outConf.sampleBits || inConf.sampleBits;
    outConf.channelCount = outConf.channelCount || inConf.channelCount;
    var context = new audioContext();
    var audioInput = context.createMediaStreamSource(stream);
    var jsProcessor = context.createScriptProcessor(0, inConf.channelCount, outConf.channelCount);//输入声道和输出声道
    inConf.sampleRate = context.sampleRate    //48000,就这样获取吗？ 48k
    outConf.sampleRate = outConf.sampleRate || inConf.sampleRate;
    //定义数据    
    var audioData = {
        size: 0,          //录音文件长度
        buffer: [],     //录音缓存                
        input: function (data) {
            // console.log(data)
            this.buffer.push(new Float32Array(data));
            this.size += data.length;
        },
        encodeWAV: function () {
            let inputSampleArr = new Float32Array(this.size), offset = 0;
            for (let i = 0; i < this.buffer.length; i++) {
                inputSampleArr.set(this.buffer[i], offset);
                offset += this.buffer[i].length;
            }
            let res = audioTransform(inputSampleArr, inConf, outConf)
            return encodeWAV(res.sampleArr, res.sampleRate, res.sampleBits, res.channelCount)
        }
    };

    //开始录音
    this.start = function () {
        audioInput.connect(jsProcessor);
        jsProcessor.connect(context.destination);
    }

    //停止
    this.pause = function () {
        jsProcessor.disconnect();
    }

    //获取音频文件
    this.getBlob = function () {
        this.pause();
        return audioData.encodeWAV();
    }

    //停止录音，并清除数据
    this.clear = function () {
        this.pause()
        audioData.buffer = [];
        audioData.size = 0;
    }

    //音频采集
    jsProcessor.onaudioprocess = function (e) {
        audioData.input(e.inputBuffer.getChannelData(0));
    }

};

//获取录音机
HZRecorder.get = function (callback, outputConfig) {
    if (!callback) {
        return;
    }
    if (!navigator.getUserMedia) {
        HZRecorder.throwErr('当前浏览器不支持录音功能。');
        return;
    }
    navigator.getUserMedia(
        { audio: true }, //只启用音频
        function (stream) {
            // outputConfig = {
            //     channelCount:1,   //1
            //     sampleRate:16000,  // 48k
            //     sampleBits:8    //16
            // }
            var rec = new HZRecorder(stream, outputConfig);
            callback(rec);
        },
        function (error) {
            switch (error.code || error.name) {
                case 'PERMISSION_DENIED':
                case 'PermissionDeniedError':
                    throw '用户拒绝提供信息。';
                case 'NOT_SUPPORTED_ERROR':
                case 'NotSupportedError':
                    throw '浏览器不支持硬件设备。';
                case 'MANDATORY_UNSATISFIED_ERROR':
                case 'MandatoryUnsatisfiedError':
                    throw '无法发现指定的硬件设备。';
                default:
                    throw '无法打开麦克风。异常信息:' + (error.code || error.name);
            }
        });


};

export default HZRecorder;