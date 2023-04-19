import type { YtDLPInfo } from "../types/yt-dlp"

import { downloadDir, join } from "@tauri-apps/api/path"
import { YtDlp } from "../binary-dl/yt-dlp"
import { FFmpeg } from "../binary-dl/ffmpeg"
import { Command } from "@tauri-apps/api/shell"
import { MEDIABOX_FOLDER_PATH } from "../constants"

import { makeLogger } from "../logging"
import { exists, readTextFile } from "@tauri-apps/api/fs"
import { invoke } from "@tauri-apps/api"
const ytdlpLog = makeLogger("binary-exec:yt-dlp")

const PROGRESS_LOG_PREFIX = "[[PROGRESS]]"

export const downloadVideoInfo = async (url: string, parameters: string[] = []) => {
  const downloadFolder = await MEDIABOX_FOLDER_PATH()
  const filename = "video"
  const downloadPath = await join(downloadFolder, `${filename}.info.json`)

  const ytDlp = await YtDlp.ensure()

  const ffmpegCommands = await FFmpeg.ensure()
  const ffFolder = await FFmpeg.getBinaryFolder(ffmpegCommands)

  return new Promise<string>((resolve, reject) => {
    ytdlpLog(`downloading ${url}...`)

    const ytdlp = new Command(ytDlp, [
      "--ffmpeg-location",
      ffFolder,
      "-P",
      downloadFolder,
      ...parameters,

      "--skip-download",
      "--write-info-json",
      "-o",
      filename,
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

  return json as YtDLPInfo
}

type DownloadPreset = {
  name: string
  args: string[]
}
export const downloadPresets: Record<string, DownloadPreset> = {
  default: {
    name: "default (max)",
    args: [],
  },
  fast720: {
    name: "fast (up to 720p)",
    args: ["-f", "b"],
  },
  mp3: {
    name: "mp3",
    args: ["-x", "--audio-format", "mp3"],
  },
}

export const downloadVideoFromInfoFile = async (
  infoJsonPath: string,
  parameters: string[] = []
) => {
  const ytDlp = await YtDlp.ensure()

  const ffmpegCommands = await FFmpeg.ensure()
  const ffFolder = await FFmpeg.getBinaryFolder(ffmpegCommands)

  const downloadFolder = await downloadDir()
  const info = await loadVideoInfo(infoJsonPath)
  const escapedTitle = info.title.replaceAll(/["*/:<>?\\|]/g, "_")
  const outputFile = `${escapedTitle}.${info.ext}`
  const outputPath = await join(downloadFolder, outputFile)

  const coreCount = await invoke<number>("get_core_count")
  ytdlpLog(`core count: ${coreCount}`)

  return new Promise((resolve, reject) => {
    const ytdlp = new Command(ytDlp, [
      "--ffmpeg-location",
      ffFolder,
      "-P",
      downloadFolder,
      "-N",
      coreCount.toString(),
      "-o",
      outputFile,
      "--progress-template",
      `${PROGRESS_LOG_PREFIX}%(progress)j`,
      ...parameters,

      "--load-info-json",
      infoJsonPath,
    ])

    ytdlp.stdout.on("data", ytdlpLog)
    ytdlp.stderr.on("data", ytdlpLog)

    ytdlp.on("error", reject)
    ytdlp.on("close", async data => {
      ytdlpLog(`yt-dlp process exited with code ${data.code}`)

      await exists(outputPath)
      resolve(outputPath)
    })

    ytdlp.spawn()
  })
}
