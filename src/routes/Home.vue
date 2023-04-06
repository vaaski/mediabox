<script setup lang="ts">
import { platformName } from "../util"
</script>

<template>
  <main class="home">
    <h1>mediabox PoC ({{ platformName }})</h1>
    <div class="links">
      <RouterLink to="/ytdlp">download</RouterLink>
      <RouterLink disabled title="coming soon™" to="/ytdlp">transform</RouterLink>
      <RouterLink disabled title="coming soon™" to="/ytdlp">transfer</RouterLink>
    </div>
  </main>
</template>

<style scoped>
main.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.links {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}
</style>
