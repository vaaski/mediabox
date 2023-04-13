<script setup lang="ts">
import { nextTick, ref } from "vue"
import { Command } from "@tauri-apps/api/shell"
import { downloadDir, homeDir, join } from "@tauri-apps/api/path"
import { platform } from "@tauri-apps/api/os"
import { invoke } from "@tauri-apps/api"

const outputLog = ref("")
const logElement = ref<HTMLPreElement>()
const log = async (message: string) => {
  console.log(message)
  outputLog.value += message + "\n"

  if (!logElement.value) return
  await nextTick()

  logElement.value.scrollTop = logElement.value.scrollHeight
}

const downloadBinary = async () => {
  const start = performance.now()
  const platformName = await platform()

  const fileName = platformName === "win32" ? "yt-dlp.exe" : "yt-dlp"
  const downloadURL =
    platformName === "win32"
      ? "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
      : "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"

  const ytdlPath = await join(await homeDir(), `.mediabox/${fileName}`)

  log(`downloading binary for ${platformName}`)
  log(`from ${downloadURL}`)

  const resultPath = await invoke<string>("download_command", {
    url: downloadURL,
    path: ytdlPath,
  })
  log(`wrote binary to ${resultPath}`)

  if (platformName !== "win32") {
    log(`setting permissions for ${ytdlPath}`)

    const chmod = new Command("chmod", ["+x", ytdlPath])
    chmod.on("close", data => {
      log(`chmod process exited with code ${data.code}`)
    })
    await chmod.spawn()
  }

  const end = performance.now()
  log(`done after ${(end - start) / 1000} seconds`)
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
      <button @click="downloadBinary">download yt-dlp</button>
      <button @click="testYTDLP">yt-dlp --version</button>
      <button @click="downloadVideo">download sample video</button>
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
