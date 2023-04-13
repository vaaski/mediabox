<script setup lang="ts">
import { nextTick, ref } from "vue"
import { Command } from "@tauri-apps/api/shell"
import { downloadDir } from "@tauri-apps/api/path"
import { FFmpegInfo, YTDLPInfo, ensureExecutable } from "../download-executables"

const outputLog = ref("")
const logElement = ref<HTMLPreElement>()
const log = async (message: string) => {
  console.log(message)
  outputLog.value += message + "\n"

  if (!logElement.value) return
  await nextTick()

  logElement.value.scrollTop = logElement.value.scrollHeight
}

const downloadFFmpeg = async () => {
  const path = await ensureExecutable(FFmpegInfo)
  log(path)
}

const testFFmpeg = async () => {
  const start = performance.now()

  log("testing ffmpeg...")
  const child = new Command("ffmpeg", ["-version"])
  child.stdout.on("data", data => {
    log(data)
  })
  child.stderr.on("data", data => {
    log(data)
  })
  child.on("close", data => {
    log(`child process exited with code ${data.code}`)

    const end = performance.now()
    log(`done after ${(end - start) / 1000} seconds`)
  })
  await child.spawn()
}

const downloadYTDLP = async () => {
  const path = await ensureExecutable(YTDLPInfo)
  log(path)
}

const testYTDLP = async () => {
  const start = performance.now()

  log("testing yt-dlp...")
  const child = new Command("yt-dlp", ["--version"])
  child.stdout.on("data", data => {
    log(data)
  })
  child.stderr.on("data", data => {
    log(data)
  })
  child.on("close", data => {
    log(`child process exited with code ${data.code}`)

    const end = performance.now()
    log(`done after ${(end - start) / 1000} seconds`)
  })
  await child.spawn()
}

const downloadVideo = async () => {
  const url = "https://www.youtube.com/watch?v=9bZkp7q19f0"
  log(`downloading ${url}...`)
  const downloadPath = await downloadDir()
  const ytdlp = new Command("yt-dlp", ["--remux-video", "mp4", "-P", downloadPath, url])
  ytdlp.stdout.on("data", log)
  ytdlp.stderr.on("data", log)
  ytdlp.on("close", data => {
    log(`yt-dlp process exited with code ${data.code}`)
  })
  await ytdlp.spawn()
}
</script>

<template>
  <div class="wrap">
    <pre ref="logElement">{{ outputLog }}</pre>
    <div class="controls">
      <button @click="downloadYTDLP">download yt-dlp</button>
      <button @click="testYTDLP">test yt-dlp</button>
      <button @click="downloadVideo">download sample video</button>
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
