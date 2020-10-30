// white-noise-processor.js

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
class WhiteNoiseProcessor extends AudioWorkletProcessor {
    /**
     * 
     * @param {Float32Array[][]} inputs 
     * @param {Float32Array[][]} outputs 
     * @param {*} parameters 
     */
    process(inputs, outputs, parameters) {
        if (inputs[0].length) {
            let input = inputs[0][0] // 第0个输入，第0个声道的样本（本例只有一个输入，有两个声道，但每个声道数据一样）              
            let output = outputs[0][0]
            for (let i = input.length - 1; i >= 0; i--) {
                output[i] = input[i]
            }
            // let data = comput(input) 
            // console.log(data)
            // console.log(data)
           
        }
        return true
    }
}

registerProcessor('white-noise-processor', WhiteNoiseProcessor)