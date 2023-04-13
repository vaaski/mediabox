import { readTextFile } from "@tauri-apps/api/fs"
import { downloadDir, join } from "@tauri-apps/api/path"
import { Command } from "@tauri-apps/api/shell"
import { ensureExecutable, FFmpegInfo } from "./download-executables"

import { makeLogger } from "./logging"
const ytdlpLog = makeLogger("ytdlp")

export const downloadVideoInfo = async (url: string) => {
  const downloadFolder = await downloadDir()
  const downloadPath = await join(downloadFolder, "video.info.json")
  const ffmpegPath = await ensureExecutable(FFmpegInfo)

  return new Promise<string>((resolve, reject) => {
    ytdlpLog(`downloading ${url}...`)

    const ytdlp = new Command("yt-dlp", [
      "--ffmpeg-location",
      ffmpegPath,
      "-P",
      downloadFolder,

      "--skip-download",
      "--write-info-json",
      "-o",
      "video",
      url,
    ])

    ytdlp.stdout.on("data", ytdlpLog)
    ytdlp.stderr.on("data", ytdlpLog)

    ytdlp.on("error", reject)
    ytdlp.on("close", data => {
      ytdlpLog(`yt-dlp process exited with code ${data.code}`)
      ytdlpLog(`downloaded ${url} to ${downloadPath}`)

      resolve(downloadPath)
    })

    ytdlp.spawn()
  })
}

export const loadVideoInfo = async (path: string) => {
  const contents = await readTextFile(path)
  const json = JSON.parse(contents)

  return json
}
