import { MEDIABOX_FOLDER_PATH } from "./constants"

import { platform } from "@tauri-apps/api/os"
import { join } from "@tauri-apps/api/path"
import { invoke } from "@tauri-apps/api"
import { Command } from "@tauri-apps/api/shell"
import { exists } from "@tauri-apps/api/fs"

type Platforms = Awaited<ReturnType<typeof platform>>
type ExecutableDownloadInfo = {
  url: string
  filename: string
}
type ExecutableDownloadInfoList = {
  [key in Platforms]?: ExecutableDownloadInfo
}

export const YTDLPInfo = {
  win32: {
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
    filename: "yt-dlp.exe",
  },
  darwin: {
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
    filename: "yt-dlp_macos",
  },
  linux: {
    url: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
    filename: "yt-dlp",
  },
} satisfies ExecutableDownloadInfoList

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
  const downloadPath = await join(await MEDIABOX_FOLDER_PATH(), info.filename)
  await invoke<string>("download_command", {
    url: info.url,
    path: downloadPath,
  })

  if (currentPlatform !== "win32") {
    await chmodPlusX(downloadPath)
  }

  return downloadPath
}

export const ensureExecutable = async (info: ExecutableDownloadInfoList) => {
  const currentInfo = await getPlatformInfo(info)
  const downloadPath = await join(await MEDIABOX_FOLDER_PATH(), currentInfo.filename)

  if (await exists(downloadPath)) return downloadPath
  else return await downloadExecutable(currentInfo)
}
