import { platform } from "@tauri-apps/api/os"

import { invoke } from "@tauri-apps/api"
import { join } from "@tauri-apps/api/path"
import { Command } from "@tauri-apps/api/shell"
import { makeLogger } from "../logging"

const log = makeLogger("binary-dl:util")

export type Platforms = Awaited<ReturnType<typeof platform>>
export type DownloadInfoZip = {
  zipDownloads: string[]
  zipFileNames: string[]
  containedFileNames: string[]
  outFileNames: string[]
}
export type DownloadInfoRaw = {
  downloads: string[]
  outFileNames: string[]
}
export type ExecutableDownloadInfoList<T extends DownloadInfoZip | DownloadInfoRaw> = {
  [key in Platforms]?: T
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

export const commandOutput = async (command: string, parameters: string[]) => {
  let accumulatedStdout = ""
  let accumulatedStderr = ""

  return new Promise<string>((resolve, reject) => {
    const cmd = new Command(command, parameters)
    cmd.on("close", () => resolve(accumulatedStdout.trim()))
    cmd.on("error", () => reject(accumulatedStderr.trim()))

    cmd.stdout.on("data", data => {
      accumulatedStdout += data + "\n"
    })
    cmd.stderr.on("data", data => {
      accumulatedStderr += data + "\n"
    })

    cmd.spawn()
  })
}

export const chmodPlusX = async (paths: string[]) => {
  log(`chmod +x ${paths}`)
  return await commandOutput("chmod", ["+x", ...paths])
}

export const preexistingBinary = async (binary: string) => {
  const platformName = await platform()
  const wh = platformName === "win32" ? "where" : "which"

  log(`${wh} ${binary}`)
  return await commandOutput(`${wh}`, [binary])
}
