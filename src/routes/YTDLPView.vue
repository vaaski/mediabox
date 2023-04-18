<script setup lang="ts">
// import { nextTick, ref, watch } from "vue"

import { makeLogger } from "../logging"
import { FFmpeg } from "../binary-dl/ffmpeg"
import { commandOutput } from "../binary-dl/util"
import { YtDlp } from "../binary-dl/yt-dlp"
import {
  downloadPresets,
  downloadVideoFromInfoFile,
  downloadVideoInfo,
  loadVideoInfo,
} from "../binary-exec/yt-dlp"
import { ref } from "vue"

const ffmpegLog = makeLogger("ffmpeg")
const ytdlpLog = makeLogger("yt-dlp")

const downloadFFmpeg = async () => {
  const commands = await FFmpeg.ensure()
  const [ffmpeg, ffprobe] = commands
  ffmpegLog(`ffmpeg at ${ffmpeg}, ffprobe at ${ffprobe}`)

  const binaryPaths = await FFmpeg.getDirectBinaryPath(commands)
  ffmpegLog(binaryPaths)
}

const testFFmpeg = async () => {
  const [ffmpeg, ffprobe] = await FFmpeg.ensure()

  ffmpegLog(`testing ${ffmpeg}...`)
  const ffmpegOutput = await commandOutput(ffmpeg, ["-version"])
  ffmpegLog(ffmpegOutput)

  ffmpegLog(`testing ${ffprobe}...`)
  const ffprobeOutput = await commandOutput(ffprobe, ["-version"])
  ffmpegLog(ffprobeOutput)
}

const downloadYtDlp = async () => {
  const path = await YtDlp.ensure()
  ytdlpLog(`yt-dlp at ${path}`)
}

const testYtDlp = async () => {
  const ytDlp = await YtDlp.ensure()

  ytdlpLog(`testing ${ytDlp}...`)
  const output = await commandOutput(ytDlp, ["--version"])
  ytdlpLog(output)
}

const sampleVideoInfo = async () => {
  const url = "https://www.youtube.com/watch?v=9bZkp7q19f0"
  const preset = downloadPresets.fast720

  const infoPath = await downloadVideoInfo(url, preset.args)
  ytdlpLog(`video info at ${infoPath}`)

  const info = await loadVideoInfo(infoPath)
  ytdlpLog(info.title, info.ext)

  const path = await downloadVideoFromInfoFile(infoPath, preset.args)
  ytdlpLog(path)
}

const urlInput = ref("https://www.youtube.com/watch?v=Qq5Q1qKW-1g")
const presetSelection = ref(downloadPresets.fast720)
const downloadFromURL = async () => {
  const parameters = presetSelection.value.args

  const infoPath = await downloadVideoInfo(urlInput.value, parameters)
  ytdlpLog(`video info at ${infoPath}`)

  const info = await loadVideoInfo(infoPath)
  ytdlpLog(info.title, info.ext)

  const path = await downloadVideoFromInfoFile(infoPath, parameters)
  ytdlpLog(path)
}
</script>

<template>
  <div class="wrap">
    <!-- <div class="controls">
      <button @click="downloadYtDlp">download yt-dlp</button>
      <button @click="testYtDlp">test yt-dlp</button>
      <button @click="sampleVideoInfo">download video info</button>
    </div>
    <div class="controls">
      <button @click="downloadFFmpeg">download ffmpeg</button>
      <button @click="testFFmpeg">test ffmpeg</button>
    </div> -->

    <form @submit.prevent="downloadFromURL">
      <input v-model="urlInput" type="text" placeholder="url" />

      <select v-model="presetSelection">
        <option v-for="preset in downloadPresets" :key="preset.name" :value="preset">
          {{ preset.name }}
        </option>
      </select>

      <button type="submit">download</button>
    </form>
  </div>
</template>

<style scoped>
.wrap {
  font-family: sans-serif;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

form {
}
</style>
