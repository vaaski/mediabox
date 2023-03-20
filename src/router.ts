import type { RouteRecordRaw } from "vue-router"

import { createWebHashHistory, createRouter } from "vue-router"

import HomeVue from "./routes/Home.vue"
import YtdlpVue from "./routes/YTDLP.vue"

const routes: RouteRecordRaw[] = [
  { path: "/", component: HomeVue },
  { path: "/ytdlp", component: YtdlpVue },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
