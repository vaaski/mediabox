import type { platform } from "@tauri-apps/api/os"

import { invoke } from "@tauri-apps/api"
import { join } from "@tauri-apps/api/path"
import { Command } from "@tauri-apps/api/shell"
import { makeLogger } from "../logging"

const log = makeLogger("binaries:util")

export type Platforms = Awaited<ReturnType<typeof platform>>
export type DownloadInfo = {
  zipDownloads: string[]
  zipFileNames: string[]
  containedFileNames: string[]
  outFileNames: string[]
}
export type ExecutableDownloadInfoList = {
  [key in Platforms]?: DownloadInfo
}

export const download = async (url: string, path: string) => {
  return await invoke<string>("download_command", { url, path })
}

export const unzip = async (zipPath: string, filesToExtract: string[]) => {
  const outFolder = await join(zipPath, "..")
  const outPaths = await Promise.all(filesToExtract.map(name => join(outFolder, name)))

  log(`unzipping ${filesToExtract} from ${zipPath} to ${outPaths}`)
  await invoke("tauri_extract_files", { zipPath, filesToExtract, outputPaths: outPaths })

  return outPaths
}

export const chmodPlusX = async (paths: string[]) => {
  log(`chmod +x ${paths}`)

  return new Promise<void>((resolve, reject) => {
    const chmod = new Command("chmod", ["+x", ...paths])
    chmod.on("close", resolve)
    chmod.on("error", reject)

    chmod.spawn()
  })
}
