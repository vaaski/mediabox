<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { accumulatedLog } from "../logging"

const logElement = ref<HTMLPreElement>()
watch(accumulatedLog, async () => {
  if (!logElement.value) return

  const isAtBottom =
    logElement.value.scrollTop ===
    logElement.value.scrollHeight - logElement.value.clientHeight

  if (!isAtBottom) return

  await nextTick()
  logElement.value.scrollTop =
    logElement.value.scrollHeight - logElement.value.clientHeight
})
</script>

<template>
  <div class="wrap">
    <pre ref="logElement">{{ accumulatedLog }}</pre>
  </div>
</template>

<style scoped>
.wrap {
  font-family: sans-serif;
  height: 100%;
  width: 100%;
  display: flex;
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
