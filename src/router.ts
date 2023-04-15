import type { RouteRecordRaw } from "vue-router"

import { createWebHashHistory, createRouter } from "vue-router"

import HomeVue from "./routes/HomeView.vue"
import YtdlpVue from "./routes/YTDLPView.vue"
import LogVue from "./routes/LogView.vue"

const routes: RouteRecordRaw[] = [
  { path: "/", component: HomeVue },
  { path: "/ytdlp", component: YtdlpVue },
  { path: "/log", component: LogVue },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
