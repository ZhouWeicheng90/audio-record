/**
 * 转换输出默认采用 较小的参数。【TODO】更多转换需要完善
 * @param {*} inputSampleArr 
 * @param {*} inConfig 
 * @param {*} outConfig 
 */
export default function (inputSampleArr, inConfig, outConfig) {
    let sampleRate, sampleBits, sampleArr, channelCount;
    if (outConfig.channelCount !== 1 || inConfig.channelCount !== 1) {
        throw '目前只支持单声道！双声道音频正在处理中'
    } else {
        channelCount = 1
    }
    // 根据采样率压缩：
    if (outConfig.sampleRate >= inConfig.sampleRate) {
        sampleRate = inConfig.sampleRate;
        sampleArr = inputSampleArr;
    } else {
        sampleRate = outConfig.sampleRate
        // 要做舍弃压缩
        let skipRate = inConfig.sampleRate / outConfig.sampleRate
        sampleArr = new Float32Array(Math.ceil(inputSampleArr.length * outConfig.sampleRate / inConfig.sampleRate))
        for (let i = 0, j = 0; i < sampleArr.length; i++) {  // todo 多声道这里需要修改
            sampleArr[i] = inputSampleArr[Math.floor(j)] || 0
            j += skipRate
        }
    }            
    // 根据比特位压缩：
    if (outConfig.sampleBits >= inConfig.sampleBits) {
        sampleBits = inConfig.sampleBits;
    } else {
        throw '暂时不支持比特位的缩小压缩输出！'
        // sampleBits = outConfig.sampleBits;
        // // 要做缩小压缩
        // let bitGap = inConfig.sampleBits - outConfig.sampleBits
        // let mid = 1<< (outConfig.sampleBits-2)
        // for (let i = 0; i < sampleArr.length; i++) {
        //     sampleArr[i] >>= bitGap
        //     sampleArr[i] += mid
        // }
    }
    return { sampleRate, sampleBits, sampleArr,channelCount };
}