<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { makeLogger, accumulatedLog } from "../logging"
const log = makeLogger("log-view")

const logElement = ref<HTMLPreElement>()
watch(accumulatedLog, async () => {
  if (!logElement.value) return

  const isAtBottom =
    logElement.value.scrollTop + 25 >=
    logElement.value.scrollHeight - logElement.value.clientHeight

  if (!isAtBottom) return

  await nextTick()
  logElement.value.scrollTop =
    logElement.value.scrollHeight - logElement.value.clientHeight
})

const logSomething = () => log(Math.random().toString(36))
const reload = () => window.location.reload()
</script>

<template>
  <div class="wrap">
    <pre ref="logElement">{{ accumulatedLog || "logs will appear here" }}</pre>
    <div class="controls">
      <button @click="logSomething">log something</button>
      <button @click="reload">reload</button>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  font-family: sans-serif;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

pre {
  white-space: pre-wrap;
  background: rgba(0, 0, 0, 0.1);
  flex-grow: 1;
  width: calc(100% - 1rem);
  padding: 1em;
  margin: 0.5rem;
  border-radius: 6.66px;
  overflow-y: auto;
}
</style>
