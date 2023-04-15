<script setup lang="ts">
import { nextTick, ref, watch } from "vue"

import { accumulatedLog, makeLogger } from "../logging"
// import { downloadVideoFromInfoFile, downloadVideoInfo, loadVideoInfo } from "../ytdlp"
import { FFmpeg } from "../binary-dl/ffmpeg"
import { commandOutput } from "../binary-dl/util"
import { YtDlp } from "../binary-dl/yt-dlp"
import {
  downloadPresets,
  downloadVideoFromInfoFile,
  downloadVideoInfo,
loadVideoInfo,
} from "../binary-exec/yt-dlp"

const ffmpegLog = makeLogger("ffmpeg")
const ytdlpLog = makeLogger("yt-dlp")

const logElement = ref<HTMLPreElement>()
watch(accumulatedLog, async () => {
  if (!logElement.value) return

  const isAtBottom =
    logElement.value.scrollTop ===
    logElement.value.scrollHeight - logElement.value.clientHeight

  if (!isAtBottom) return

  await nextTick()
  logElement.value.scrollTop =
    logElement.value.scrollHeight - logElement.value.clientHeight
})

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
</script>

<template>
  <div class="wrap">
    <pre ref="logElement">{{ accumulatedLog }}</pre>
    <div class="controls">
      <button @click="downloadYtDlp">download yt-dlp</button>
      <button @click="testYtDlp">test yt-dlp</button>
      <button @click="sampleVideoInfo">download video info</button>
    </div>
    <div class="controls">
      <button @click="downloadFFmpeg">download ffmpeg</button>
      <button @click="testFFmpeg">test ffmpeg</button>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  font-family: sans-serif;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

pre {
  white-space: pre-wrap;
  background: rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  width: calc(100% - 1rem);
  padding: 1em;
  margin: 0.5rem;
  margin-bottom: 0;
  border-radius: 5px;
  overflow-y: auto;
}
</style>
