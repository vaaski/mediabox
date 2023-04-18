import type { DownloadInfoRaw, ExecutableDownloadInfoList } from "./util"

import { platform } from "@tauri-apps/api/os"
import { download, chmodPlusX, preexistingBinary } from "./util"
import { makeLogger } from "../logging"
import { join } from "@tauri-apps/api/path"
import { MEDIABOX_FOLDER_PATH } from "../constants"
import { exists } from "@tauri-apps/api/fs"

const log = makeLogger("binary-dl:yt-dlp")

export const YTDLP = 0
export type YtDlpBinaryType = "yt-dlp" | "yt-dlp-local"
const downloadInfo: ExecutableDownloadInfoList<DownloadInfoRaw> = {
  darwin: {
    downloads: ["https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"],
    outFileNames: ["yt-dlp"],
  },
  win32: {
    downloads: ["https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"],
    outFileNames: ["yt-dlp.exe"],
  },
}

export const YtDlp = {
  download: async (): Promise<YtDlpBinaryType> => {
    const currentPlatform = await platform()
    const info = downloadInfo[currentPlatform]
    if (!info) throw new Error(`Unsupported platform for yt-dlp: ${currentPlatform}`)

    const MEDIABOX_PATH = await MEDIABOX_FOLDER_PATH()

    const ytDlpOut = await join(MEDIABOX_PATH, info.outFileNames[YTDLP])

    log(`downloading ${info.downloads} to ${ytDlpOut}`)
    const downloadedPath = await download(info.downloads[YTDLP], ytDlpOut)

    if (currentPlatform !== "win32") {
      await chmodPlusX([downloadedPath])
    }

    return "yt-dlp-local"
  },
  ensure: async (): Promise<YtDlpBinaryType> => {
    const MEDIABOX_PATH = await MEDIABOX_FOLDER_PATH()
    const currentPlatform = await platform()

    const info = downloadInfo[currentPlatform]
    if (!info) throw new Error(`Unsupported platform for yt-dlp: ${currentPlatform}`)

    try {
      const preexistingYtDlp = await preexistingBinary(info.outFileNames[YTDLP])

      if (preexistingYtDlp) {
        log(`using preexisting yt-dlp at ${preexistingYtDlp}`)
        return "yt-dlp"
      }
    } catch {
      // ignore
    }

    const ytDlpOut = await join(MEDIABOX_PATH, info.outFileNames[YTDLP])
    const ytDlpExists = await exists(ytDlpOut)

    return ytDlpExists ? "yt-dlp-local" : YtDlp.download()
  },
}
