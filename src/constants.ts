import { homeDir, join } from "@tauri-apps/api/path"

export const MEDIABOX_FOLDER_NAME = ".mediabox"
export const MEDIABOX_FOLDER_PATH = async () => await join(await homeDir(), ".mediabox")
