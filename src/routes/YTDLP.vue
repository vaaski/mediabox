<script setup lang="ts">
import { nextTick, ref } from "vue"
import { Command } from "@tauri-apps/api/shell"
import { getClient, ResponseType } from "@tauri-apps/api/http"
import { writeBinaryFile, BaseDirectory, createDir } from "@tauri-apps/api/fs"
import { downloadDir, homeDir, join } from "@tauri-apps/api/path"

const logElement = ref<HTMLPreElement>()
const log = async (msg: string) => {
  console.log(msg)
  output.value += "\n" + msg

  if (!logElement.value) return
  await nextTick()

  logElement.value.scrollTop = logElement.value.scrollHeight
}

const output = ref("")
const spawnChild = async () => {
  const child = new Command("yt-dlp", ["--version"])
  child.stdout.on("data", data => {
    log(data)
  })
  child.stderr.on("data", data => {
    log(data)
  })
  child.on("close", data => {
    log(`child process exited with code ${data.code}`)
  })
  await child.spawn()
}

const downloadBinary = async () => {
  const client = await getClient()

  log("downloading binary")
  const request = await client.get(
    "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
    {
      responseType: ResponseType.Binary,
    }
  )

  if (!Array.isArray(request.data)) {
    throw "request.data is not an array"
  }

  log("writing binary")
  await createDir(".mediabox", { dir: BaseDirectory.Home, recursive: true })
  await writeBinaryFile(".mediabox/yt-dlp", request.data, { dir: BaseDirectory.Home })

  const ytdlDir = await join(await homeDir(), ".mediabox/yt-dlp")
  log(`setting permissions for ${ytdlDir}`)

  const chmod = new Command("chmod", ["+x", ytdlDir])
  chmod.on("close", data => {
    output.value += `\nchmod process exited with code ${data.code}`
  })
  await chmod.spawn()

  log("done")
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
    <pre ref="logElement">{{ output }}</pre>
    <div class="controls">
      <button @click="downloadBinary">download yt-dlp</button>
      <button @click="spawnChild">yt-dlp --version</button>
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
