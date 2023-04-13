import { createApp } from "vue"
import { router } from "./router"
import App from "./App.vue"

import "@acab/reset.css"
import "./styles.scss"
import "@fontsource/outfit"

import { useEventListener } from "@vueuse/core"
if (import.meta.env.PROD) {
  useEventListener("contextmenu", event => {
    event.preventDefault()
    event.stopPropagation()
  })
}

// import { invoke } from "@tauri-apps/api"
// window.invoke = invoke

createApp(App).use(router).mount("#app")
