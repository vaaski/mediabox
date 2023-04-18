import type { DownloadInfoZip, ExecutableDownloadInfoList, Platforms } from "./util"

import { platform } from "@tauri-apps/api/os"
import { download, unzip, chmodPlusX, preexistingBinary } from "./util"
import { makeLogger } from "../logging"
import { join } from "@tauri-apps/api/path"
import { MEDIABOX_FOLDER_PATH } from "../constants"
import { exists, removeFile } from "@tauri-apps/api/fs"
import { commandOutput } from "./util"

const log = makeLogger("binary-dl:ffmpeg")

export const FFMPEG = 0
export const FFPROBE = 1
export type FFmpegBinaryType = ["ffmpeg", "ffprobe"] | ["ffmpeg-local", "ffprobe-local"]
const downloadInfo: ExecutableDownloadInfoList<DownloadInfoZip> = {
  darwin: {
    zipDownloads: [
      "https://evermeet.cx/ffmpeg/ffmpeg-6.0.zip",
      "https://evermeet.cx/ffmpeg/ffprobe-6.0.zip",
    ],
    zipFileNames: ["ffmpeg-6.0.zip", "ffprobe-6.0.zip"],
    containedFileNames: ["ffmpeg", "ffprobe"],
    outFileNames: ["ffmpeg", "ffprobe"],
  },
  win32: {
    zipDownloads: ["https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"],
    zipFileNames: ["ffmpeg-release-essentials.zip"],
    containedFileNames: ["ffmpeg.exe", "ffprobe.exe"],
    outFileNames: ["ffmpeg.exe", "ffprobe.exe"],
  },
}

type PlatformDownload = (
  MEDIABOX_PATH: string,
  info: DownloadInfoZip
) => Promise<string[]>

const platformDownload: Partial<Record<Platforms, PlatformDownload>> = {
  darwin: async (MEDIABOX_PATH, info) => {
    const ffmpegZipOut = await join(MEDIABOX_PATH, info.zipFileNames[FFMPEG])
    const ffprobeZipOut = await join(MEDIABOX_PATH, info.zipFileNames[FFPROBE])
    log(`downloading ${info.zipDownloads} to ${ffmpegZipOut} and ${ffprobeZipOut}`)

    const zipDownloads = await Promise.all([
      download(info.zipDownloads[FFMPEG], ffmpegZipOut),
      download(info.zipDownloads[FFPROBE], ffprobeZipOut),
    ])
    log(`downloaded ${zipDownloads}`)

    const unzipped = await Promise.all([
      unzip(zipDownloads[FFMPEG], [info.containedFileNames[FFMPEG]]),
      unzip(zipDownloads[FFPROBE], [info.containedFileNames[FFPROBE]]),
    ]).then(unzips => unzips.flat())
    log(`unzipped ${unzipped}`)

    await Promise.all([
      removeFile(zipDownloads[FFMPEG]),
      removeFile(zipDownloads[FFPROBE]),
    ])

    log(`deleted zips ${zipDownloads}`)
    return unzipped
  },
  win32: async (MEDIABOX_PATH, info) => {
    const ffmpegZipOut = await join(MEDIABOX_PATH, info.zipFileNames[0])
    log(`downloading ${info.zipDownloads} to ${ffmpegZipOut}`)

    const zipDownload = await download(info.zipDownloads[0], ffmpegZipOut)
    log(`downloaded ${zipDownload}`)

    const unzipped = await unzip(zipDownload, [
      info.containedFileNames[FFMPEG],
      info.containedFileNames[FFPROBE],
    ]).then(u => u.flat())
    log(`unzipped ${unzipped}`)

    await removeFile(zipDownload)

    log(`deleted zip ${zipDownload}`)
    return unzipped
  },
}

export const FFmpeg = {
  download: async (): Promise<FFmpegBinaryType> => {
    const currentPlatform = await platform()
    const info = downloadInfo[currentPlatform]
    const downloader = platformDownload[currentPlatform]

    if (!info || !downloader) {
      throw new Error(`Unsupported platform for ffmpeg: ${currentPlatform}`)
    }

    const MEDIABOX_PATH = await MEDIABOX_FOLDER_PATH()
    const unzips = await downloader(MEDIABOX_PATH, info)

    if (currentPlatform !== "win32") {
      await chmodPlusX(unzips)
    }

    return ["ffmpeg-local", "ffprobe-local"]
  },
  ensure: async (): Promise<FFmpegBinaryType> => {
    const MEDIABOX_PATH = await MEDIABOX_FOLDER_PATH()
    const currentPlatform = await platform()

    const info = downloadInfo[currentPlatform]
    if (!info) throw new Error(`Unsupported platform for ffmpeg: ${currentPlatform}`)

    // try {
    //   const preexistingFFmpeg = await preexistingBinary(info.outFileNames[FFMPEG])
    //   const preexistingFFprobe = await preexistingBinary(info.outFileNames[FFPROBE])

    //   if (preexistingFFmpeg && preexistingFFprobe) {
    //     log(
    //       `using preexisting ffmpeg and ffprobe at ${preexistingFFmpeg} and ${preexistingFFprobe}`
    //     )
    //     return ["ffmpeg", "ffprobe"]
    //   }
    // } catch {
    //   // ignore
    // }

    const ffmpegOut = await join(MEDIABOX_PATH, info.outFileNames[FFMPEG])
    const ffprobeOut = await join(MEDIABOX_PATH, info.outFileNames[FFPROBE])

    const ffmpegExists = await exists(ffmpegOut)
    const ffprobeExists = await exists(ffprobeOut)

    return ffmpegExists && ffprobeExists
      ? ["ffmpeg-local", "ffprobe-local"]
      : FFmpeg.download()
  },
  getDirectBinaryPath: async (binaryType: FFmpegBinaryType): Promise<string[]> => {
    const MEDIABOX_PATH = await MEDIABOX_FOLDER_PATH()
    const currentPlatform = await platform()

    const info = downloadInfo[currentPlatform]
    if (!info) throw new Error(`Unsupported platform for ffmpeg: ${currentPlatform}`)

    if (binaryType[FFMPEG] === "ffmpeg") {
      const pathPromises = info.outFileNames.map(name => commandOutput("which", [name]))
      return await Promise.all(pathPromises)
    } else {
      const pathPromises = info.outFileNames.map(name => join(MEDIABOX_PATH, name))
      return await Promise.all(pathPromises)
    }
  },
  getBinaryFolder: async (binaryType: FFmpegBinaryType): Promise<string> => {
    const [ffmpegBinaryPath] = await FFmpeg.getDirectBinaryPath(binaryType)
    const ffFolder = await join(ffmpegBinaryPath, "..")

    return ffFolder
  },
}
