<template>
  <div>
    <audio style="display:none" ref="audio" controls autoplay></audio>
    <button v-if="isRecording" @click="pauseRec">暂停</button>
    <button v-else @click="startRec">开始</button>
    <button @click="clearRec">清理</button>
    <button @click="playRec">播放</button>
  </div>
</template>

<script>
import AudioRecorder from "./assets/record/record";
export default {
  name: "App",
  components: {},
  data() {
    return {
      isRecording: false,
      audioRecord: null
    };
  },
  methods: {
    startRec() {
      this.audioRecord.start();
      this.isRecording = true;
    },
    pauseRec() {
      this.audioRecord.pause();
      this.isRecording = false;
    },
    clearRec() {
      this.audioRecord.clear();
      this.isRecording = false;
    },
    playRec() {
      this.isRecording = false;
      this.$refs["audio"].src = window.URL.createObjectURL(
        this.audioRecord.getBlob()
      );
    }
  },
  created() {
    AudioRecorder.get(rec => {
      this.audioRecord = rec;
    });
  }
};
</script>

<style>
</style>
