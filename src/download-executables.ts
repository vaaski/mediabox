import { MEDIABOX_FOLDER_PATH } from "./constants"

import { platform } from "@tauri-apps/api/os"
import { join } from "@tauri-apps/api/path"
import { invoke } from "@tauri-apps/api"
import { Command } from "@tauri-apps/api/shell"
import { exists, removeFile } from "@tauri-apps/api/fs"

type Platforms = Awaited<ReturnType<typeof platform>>
type ExecutableDownloadInfo = {
  url: string
  filename: string
  zippedFilename?: string
}
type ExecutableDownloadInfoList = {
  [key in Platforms]?: ExecutableDownloadInfo
} //& { linux: ExecutableDownloadInfo }

export const YTDLPInfo = {
  win32: {
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
    filename: "yt-dlp.exe",
  },
  darwin: {
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
    filename: "yt-dlp",
  },
  linux: {
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
    filename: "yt-dlp",
  },
} satisfies ExecutableDownloadInfoList

export const FFmpegInfo = {
  darwin: {
    url: "https://evermeet.cx/ffmpeg/ffmpeg-6.0.zip",
    zippedFilename: "ffmpeg-6.0.zip",
    filename: "ffmpeg",
  },
} satisfies ExecutableDownloadInfoList

const download = async (url: string, path: string) => {
  return await invoke<string>("download_command", { url, path })
}

const unzip = async (zipPath: string, containedFileName: string) => {
  const currentPlatform = await platform()
  const outFolder = await join(zipPath, "..")
  const outPath = await join(outFolder, containedFileName)

  return new Promise<string>((resolve, reject) => {
    if (currentPlatform === "darwin") {
      const unzip = new Command("unzip", [
        "-o", // overwrite
        "-qq", // extra quiet
        "-d", // destination folder
        outFolder,
        zipPath,
        containedFileName,
      ])
      unzip.on("close", async () => {
        await removeFile(zipPath)
        return resolve(outPath)
      })
      unzip.on("error", reject)

      unzip.spawn()
    } else throw new Error("Unzipping not implemented for this platform")
  })
}

const chmodPlusX = async (path: string) => {
  return new Promise<void>((resolve, reject) => {
    const chmod = new Command("chmod", ["+x", path])
    chmod.on("close", resolve)
    chmod.on("error", reject)

    chmod.spawn()
  })
}

export const getPlatformInfo = async (info: ExecutableDownloadInfoList) => {
  const currentPlatform = await platform()
  const currentInfo = info[currentPlatform] ?? info.linux
  if (!currentInfo) throw new Error("No executable download info for this platform")

  return currentInfo
}

export const downloadExecutable = async (info: ExecutableDownloadInfo) => {
  console.log("downloading executable", info)

  const currentPlatform = await platform()
  const downloadPath = await join(
    await MEDIABOX_FOLDER_PATH(),
    info.zippedFilename ?? info.filename
  )

  await download(info.url, downloadPath)

  let binaryPath = downloadPath
  if (info.zippedFilename) {
    binaryPath = await unzip(downloadPath, info.filename)
    console.log("unzipped binary to", binaryPath)
  }

  if (currentPlatform !== "win32") {
    await chmodPlusX(binaryPath)
  }

  return binaryPath
}

export const ensureExecutable = async (info: ExecutableDownloadInfoList) => {
  const currentInfo = await getPlatformInfo(info)
  const downloadPath = await join(await MEDIABOX_FOLDER_PATH(), currentInfo.filename)

  if (await exists(downloadPath)) return downloadPath
  else return await downloadExecutable(currentInfo)
}
