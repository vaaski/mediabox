import type { ExecutableDownloadInfoList } from "./util"

import { platform } from "@tauri-apps/api/os"
import { download, unzip, chmodPlusX } from "./util"
import { makeLogger } from "../logging"
import { join } from "@tauri-apps/api/path"
import { MEDIABOX_FOLDER_PATH } from "../constants"
import { exists, removeFile } from "@tauri-apps/api/fs"

const log = makeLogger("binaries:ffmpeg")

export const FFMPEG = 0
export const FFPROBE = 1
const downloadInfo: ExecutableDownloadInfoList = {
  darwin: {
    zipDownloads: [
      "https://evermeet.cx/ffmpeg/ffmpeg-6.0.zip",
      "https://evermeet.cx/ffmpeg/ffprobe-6.0.zip",
    ],
    zipFileNames: ["ffmpeg-6.0.zip", "ffprobe-6.0.zip"],
    containedFileNames: ["ffmpeg", "ffprobe"],
    outFileNames: ["ffmpeg", "ffprobe"],
  },
}

export const FFmpeg = {
  download: async () => {
    const currentPlatform = await platform()
    const info = downloadInfo[currentPlatform]
    if (!info) throw new Error(`Unsupported platform for ffmpeg: ${currentPlatform}`)

    const MEDIABOX_PATH = await MEDIABOX_FOLDER_PATH()

    const ffmpegZipOut = await join(MEDIABOX_PATH, info.zipFileNames[FFMPEG])
    const ffprobeZipOut = await join(MEDIABOX_PATH, info.zipFileNames[FFPROBE])
    log(`downloading ${info.zipDownloads} to ${ffmpegZipOut} and ${ffprobeZipOut}`)

    const zipDownloads = await Promise.all([
      download(info.zipDownloads[FFMPEG], ffmpegZipOut),
      download(info.zipDownloads[FFPROBE], ffprobeZipOut),
    ])
    log(`downloaded ${zipDownloads}`)

    const unzips = await Promise.all([
      unzip(zipDownloads[FFMPEG], [info.containedFileNames[FFMPEG]]),
      unzip(zipDownloads[FFPROBE], [info.containedFileNames[FFPROBE]]),
    ]).then(unzips => unzips.flat())
    log(`unzipped ${unzips}`)

    await Promise.all([
      removeFile(zipDownloads[FFMPEG]),
      removeFile(zipDownloads[FFPROBE]),
    ])
    log(`deleted zips ${zipDownloads}`)

    if (currentPlatform !== "win32") {
      await chmodPlusX(unzips)
    }

    return unzips
  },
  ensure: async () => {
    const MEDIABOX_PATH = await MEDIABOX_FOLDER_PATH()
    const currentPlatform = await platform()

    const info = downloadInfo[currentPlatform]
    if (!info) throw new Error(`Unsupported platform for ffmpeg: ${currentPlatform}`)

    const ffmpegOut = await join(MEDIABOX_PATH, info.outFileNames[FFMPEG])
    const ffprobeOut = await join(MEDIABOX_PATH, info.outFileNames[FFPROBE])

    const ffmpegExists = await exists(ffmpegOut)
    const ffprobeExists = await exists(ffprobeOut)

    return ffmpegExists && ffprobeExists ? [ffmpegOut, ffprobeOut] : FFmpeg.download()
  },
}
