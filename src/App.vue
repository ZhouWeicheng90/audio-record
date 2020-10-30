<template>
  <div>
    <audio style="display: none" ref="audio" controls autoplay></audio>

    <div v-if="recorded">
      <button @click="playRec">播放</button>
      <button @click="startRec">重录</button>      
    </div>
    <div v-else>
      <button v-if="isRecording" @click="stopRec">停止</button>
      <button v-else @click="startRec">开始</button>
    </div>
  </div>
</template>

<script>
import AudioRecorder from "./assets/record/newRecord";
export default {
  name: "App",
  components: {},
  data() {
    return {
      isRecording: false,
      recorded: false,
      audioRecord: null,
    };
  },
  methods: {
    startRec() {      
      this.audioRecord.start();
      this.recorded = false;
      this.isRecording = true;
    },
    stopRec() {
      this.audioRecord.stop();
      this.isRecording = false;
      this.recorded = true;
    },
    playRec() {
      this.$refs["audio"].src = this.audioRecord.getUrl();
    },
  },
  created() {
    AudioRecorder.get()
      .then((rec) => {
        this.audioRecord = rec;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
</script>

<style>
</style>
