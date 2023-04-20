<script setup lang="ts">
import { open } from "@tauri-apps/api/dialog"

const openFileDialog = async () => {
  // Open a selection dialog for image files
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: "Image",
        extensions: ["png", "jpeg"],
      },
    ],
  })

  console.log(selected)
  if (Array.isArray(selected)) {
    // user selected multiple files
  } else if (selected === null) {
    // user cancelled the selection
  } else {
    // user selected a single file
  }
}
</script>

<template>
  <button @click="openFileDialog">test</button>
</template>
