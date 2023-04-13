<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { Command } from "@tauri-apps/api/shell"

import { FFmpegInfo, YTDLPInfo, ensureExecutable } from "../download-executables"
import { accumulatedLog, makeLogger } from "../logging"
import { downloadVideoInfo, loadVideoInfo } from "../ytdlp"

const ffmpegLog = makeLogger("ffmpeg")
const ytdlpLog = makeLogger("ytdlp")

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
  const path = await ensureExecutable(FFmpegInfo)
  ffmpegLog(`downloaded ffmpeg to ${path}`)
}

const testFFmpeg = async () => {
  const start = performance.now()

  ffmpegLog("testing ffmpeg...")
  const child = new Command("ffmpeg", ["-version"])
  child.stdout.on("data", data => {
    ffmpegLog(data)
  })
  child.stderr.on("data", data => {
    ffmpegLog(data)
  })
  child.on("close", data => {
    ffmpegLog(`child process exited with code ${data.code}`)

    const end = performance.now()
    ffmpegLog(`done after ${(end - start) / 1000} seconds`)
  })
  await child.spawn()
}

const downloadYTDLP = async () => {
  const path = await ensureExecutable(YTDLPInfo)
  ytdlpLog(`downloaded yt-dlp to ${path}`)
}

const testYTDLP = async () => {
  const start = performance.now()

  ytdlpLog("testing yt-dlp...")
  const child = new Command("yt-dlp", ["--version"])
  child.stdout.on("data", data => {
    ytdlpLog(data)
  })
  child.stderr.on("data", data => {
    ytdlpLog(data)
  })
  child.on("close", data => {
    ytdlpLog(`child process exited with code ${data.code}`)

    const end = performance.now()
    ytdlpLog(`done after ${(end - start) / 1000} seconds`)
  })
  await child.spawn()
}

const sampleVideoInfo = async () => {
  const url = "https://www.youtube.com/watch?v=9bZkp7q19f0"
  const infoPath = await downloadVideoInfo(url)
  const { title, id } = await loadVideoInfo(infoPath)
  ytdlpLog({ title, id })

  // ytdlpLog(`downloading ${url}...`)

  // const downloadPath = await downloadDir()
  // const ffmpegPath = await ensureExecutable(FFmpegInfo)
  // const ytdlp = new Command("yt-dlp", [
  //   "--skip-download",
  //   "--ffmpeg-location",
  //   ffmpegPath,
  //   "--remux-video",
  //   "mp4",
  //   "-P",
  //   downloadPath,
  //   url,
  // ])

  // ytdlp.stdout.on("data", ytdlpLog)
  // ytdlp.stderr.on("data", ytdlpLog)
  // ytdlp.on("close", data => {
  //   ytdlpLog(`yt-dlp process exited with code ${data.code}`)
  // })
  // await ytdlp.spawn()
}
</script>

<template>
  <div class="wrap">
    <pre ref="logElement">{{ accumulatedLog }}</pre>
    <div class="controls">
      <button @click="downloadYTDLP">download yt-dlp</button>
      <button @click="testYTDLP">test yt-dlp</button>
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
