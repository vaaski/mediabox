import { platform } from "@tauri-apps/api/os"
export const platformName = await platform()
