<script setup lang="ts">
import { RouterView } from "vue-router"
import { appWindow } from "@tauri-apps/api/window"
import { platformName } from "./util"
import { computed } from "vue"

const isMac = computed(() => platformName.value === "darwin")
const topFrameHeight = computed(() => (isMac.value ? "28px" : "32px"))
</script>

<template>
  <div id="frame">
    <div id="top-bar" data-tauri-drag-region :class="{ isMac }">
      <div id="top-bar-left" class="no-touchy">
        <div id="top-bar-title">mediabox</div>
      </div>

      <div id="spacer" class="no-touchy"></div>

      <div id="top-bar-right">
        <div class="window-control" id="min" @click="appWindow.minimize">min</div>
        <div class="window-control" id="max" @click="appWindow.toggleMaximize">max</div>
        <div class="window-control" id="close" @click="appWindow.close">close</div>
      </div>
    </div>
    <div id="route">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss">
#frame {
  position: relative;
  height: 100vh;
  width: 100vw;
  box-shadow: inset 0 0 0 1px hsla(0 0% 100% / 0.125);
  background: var(--c-frame-bg);
  --top-frame-height: 32px;
  --top-frame-height: v-bind(topFrameHeight);
}

#top-bar {
  position: absolute;
  height: var(--top-frame-height);
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: space-around;

  #spacer {
    flex-grow: 1;
  }

  &.isMac > * {
    display: none;
  }

  &-left,
  &-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 calc(var(--frame-width));
  }

  #top-bar-title {
    padding: 0 0.5em;
  }

  .no-touchy {
    pointer-events: none;
  }

  .window-control {
    padding: 0 0.5em;
    cursor: pointer;

    &:hover {
      background: var(--c-active-bg);
    }
  }
}

#route {
  position: absolute;
  height: calc(100% - var(--top-frame-height) - var(--frame-width));
  width: calc(100% - var(--frame-width) * 2);
  top: var(--top-frame-height);
  left: var(--frame-width);

  background: var(--c-active-bg);
  border-radius: 6.66px;
}
</style>
