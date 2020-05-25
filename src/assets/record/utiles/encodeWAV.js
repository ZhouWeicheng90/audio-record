
/**
 * 将声音采样数组 封装成 WAV格式的 音频文件数据（仅仅封装，不做转换）
 * @param {*} sampleArr 声音采样的数组,采样必须和传入的sampleRate，sampleBits，channelCount 一致，如果需要，请务必提前转换。
 * @param {*} sampleRate 采样率
 * @param {*} sampleBits 采样位数
 * @param {*} channelCount 声道
 * @returns {Blob} WAV格式的 音频文件数据
 */
export default function (sampleArr, sampleRate, sampleBits, channelCount = 1) {
    let len = sampleArr.length * (sampleBits / 8);
    const data = new DataView(new ArrayBuffer(44 + len));
    let offset = 0;
    let writeString = function (str) {
        for (let i = 0; i < str.length; i++) {
            data.setUint8(offset + i, str.charCodeAt(i));
        }
    }
    // 以下封装参考博客：https://blog.csdn.net/imxiangzi/article/details/80265978 
    // RIFF chunk: 共12字节
    writeString('RIFF'); offset += 4;
    data.setUint32(offset, 36 + len, true); offset += 4;
    writeString('WAVE'); offset += 4;
    // fmt chunk:共24字节
    writeString('fmt '); offset += 4;
    data.setUint32(offset, 16, true); offset += 4;
    data.setUint16(offset, 1, true); offset += 2;  //编码格式类别为PCM
    data.setUint16(offset, channelCount, true); offset += 2;
    data.setUint32(offset, sampleRate, true); offset += 4;
    data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true); offset += 4;  // 每秒音频字节数
    data.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2; // 每个采样字节数
    data.setUint16(offset, sampleBits, true); offset += 2;  //

    //data chunk: len+8 字节
    writeString('data'); offset += 4;
    data.setUint32(offset, len, true); offset += 4;
    // 写入采样数据, 以下代码存在疑问？
    let byteNum = sampleBits / 8
    for (var i = 0; i < sampleArr.length; i++) {
        var s = Math.max(-1, Math.min(1, sampleArr[i]));
        var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
        switch (sampleBits) {
            case 8:
                data.setInt8(offset, val, true);
                break;
            case 16:
                data.setInt16(offset, val, true);
                break;
            case 32:
                data.setInt32(offset, val, true);
                break;
            case 64:
                data.setBigInt64(offset, val, true);
                break;
            default:
                throw `Invalid sampleBits ${sampleBits}`

        }
        offset += byteNum
    }
    return new Blob([data], { type: 'audio/mp3' });

}