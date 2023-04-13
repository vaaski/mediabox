import { ref } from "vue"

export const accumulatedLog = ref("")
const log = (...messages: unknown[]) => {
  const message = messages
    .map(m => {
      return typeof m === "string" ? m : JSON.stringify(m, undefined, 2)
    })
    .join(" ")

  console.log(message)
  accumulatedLog.value += message + "\n"
}
export const makeLogger = (prefix: string) => {
  return (...messages: unknown[]) => {
    log(`[${prefix}]`, ...messages)
  }
}
