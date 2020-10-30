import encodeWAV from './utiles/encodeWAV'
import audioTransform from './utiles/audioTransform'
const channelCount = 1;
const sampleBits = 16
var HZRecorder = function (stream) {
    const outConf = { channelCount, sampleBits }
    const inConf = { channelCount, sampleBits };

    var context = new AudioContext();
    var audioInput = context.createMediaStreamSource(stream);
    outConf.sampleRate = inConf.sampleRate = context.sampleRate

    // 产生两个node！
    /** @type {AudioWorkletNode} */
    let whiteNoiseNode
    context.audioWorklet.addModule('/static/customWorklet.js').then(() => {
        whiteNoiseNode = new AudioWorkletNode(context, 'white-noise-processor')
    }).catch(err => {
        console.error(err)
    })
    var jsProcessor = context.createScriptProcessor(0, inConf.channelCount, outConf.channelCount); //输入声道和输出声道

    //定义数据    
    var audioData = {
        size: 0,          //录音文件长度
        buffer: [],     //录音缓存                
        input: function (data) {
            this.buffer.push(new Float32Array(data));
            this.size += data.length;
        },
        encode: function () {
            let inputSampleArr = new Float32Array(this.size), offset = 0;
            for (let i = 0; i < this.buffer.length; i++) {
                inputSampleArr.set(this.buffer[i], offset);
                offset += this.buffer[i].length;
            }
            let res = audioTransform(inputSampleArr, inConf, outConf)
            return encodeWAV(res.sampleArr, res.sampleRate, res.sampleBits, res.channelCount)
        },
        clear: function () {
            this.size = 0;
            this.buffer = []
        }
    };
    let bufUrl = ""
    //开始录音
    this.start = function () {
        audioData.clear()
        audioInput.connect(whiteNoiseNode);
        whiteNoiseNode.connect(jsProcessor)
        jsProcessor.connect(context.destination);
    }

    //停止
    this.stop = function () {
        audioInput.disconnect()
        whiteNoiseNode.disconnect()
        jsProcessor.disconnect();
    }

    //获取音频文件
    this.getUrl = function () {
        this.stop()
        let blob = audioData.encode();
        URL.revokeObjectURL(bufUrl)
        bufUrl = window.URL.createObjectURL(blob)
        return bufUrl
    }



    //音频采集
    jsProcessor.onaudioprocess = function (e) {
        /**
         * @type {Float32Array}
         */
        let data = e.inputBuffer.getChannelData(0)
        let output = e.outputBuffer.getChannelData(0)
        // for (let i = 0; i < e.inputBuffer.length; i++) {
        //     output[i] = data[i]
        // }
        audioData.input(data);
        console.log('====', comput(data))

    }

};
/**
 * 
 * @param {Float32Array} data 声道样本
 */
function comput(data) {
    let val = 0;
    for (let d of data) {
        val += d
    }
    val = val / data.length // 约40ms
    val = Math.min(1, Math.max(-1, val))
    val = val < 0 ? val * 0x8000 : val * 0x7FFF;


    let buf = new DataView(new ArrayBuffer(2));
    buf.setInt16(0, val, true);
    return buf.getUint16(0) / 65535
}
//获取录音机
export default function getRecorder() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return Promise.reject(new Error('当前浏览器不支持录音功能。'));
    }
    //获取计算机的设备：录音设备
    return navigator.mediaDevices.getUserMedia({
        audio: { sampleSize: sampleBits, channelCount: 1 }
    }).then(stream => {
        // const track = stream.getAudioTracks()[0]
        // console.log(track.getConstraints(), track.getCapabilities(), track.getSettings())
        return new HZRecorder(stream);
    });
};

