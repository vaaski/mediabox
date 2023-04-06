import { platform } from "@tauri-apps/api/os"
import { ref } from "vue"

export const platformName = ref("")
// eslint-disable-next-line unicorn/prefer-top-level-await
platform().then(p => (platformName.value = p))
