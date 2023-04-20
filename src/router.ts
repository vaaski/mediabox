import type { RouteRecordRaw } from "vue-router"

import { createWebHashHistory, createRouter } from "vue-router"

import HomeView from "./routes/HomeView.vue"
import YtdlpView from "./routes/YTDLPView.vue"
import LogView from "./routes/LogView.vue"
import TransformView from "./routes/TransformView.vue"

const routes: RouteRecordRaw[] = [
  { path: "/", component: HomeView },
  { path: "/ytdlp", component: YtdlpView },
  { path: "/log", component: LogView },
  { path: "/transform", component: TransformView },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
