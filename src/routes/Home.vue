<script setup lang="ts"></script>

<template>
  <main class="home">
    <h1>mediabox POC</h1>
    <div class="links">
      <RouterLink to="/ytdlp">download</RouterLink>
      <RouterLink disabled title="coming soon™" to="/ytdlp">convert</RouterLink>
      <RouterLink disabled title="coming soon™" to="/ytdlp">send</RouterLink>
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
