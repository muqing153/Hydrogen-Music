<template>
  <v-slider
    v-model="localTime"
    :max="player.duration.value"
    @start="onStart"
    @end="onEnd"
    hide-details
    track-size="6"
    thumb-size="12"
    :thumb-transition="false"
    :color="props.themeColor"
    class="audio-slider"
  />

  <div class="text-time">
    <p>{{ formatTime(localTime) }}</p>
    <p>{{ formatTime(player.duration.value) }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { player } from '@/staic'

// 🎨 接收主题颜色
const props = defineProps<{
  themeColor?: string
}>()

const localTime = ref(player.currentTime.value)

let dragging = false

// 🎧 播放器 → slider（降频同步）
watch(
  () => player.currentTime.value,
  (v) => {
    if (!dragging) {
      localTime.value = v
    }
  },
)

// 🎯 开始拖动
function onStart() {
  dragging = true
}

// 🎯 结束拖动
function onEnd() {
  dragging = false
  player.seek(localTime.value)
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
</script>
<style scoped>
.v-slider {
  margin: 0;
}

/* hover 时显示圆形滑块 */
.audio-slider :deep(.v-slider-thumb__surface) {
  opacity: 0;
  transform: scale(0.5);
  transition:
    opacity 0.18s ease,
    transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.audio-slider:hover :deep(.v-slider-thumb__surface),
.audio-slider :deep(.v-slider-thumb--focused .v-slider-thumb__surface) {
  opacity: 1;
  transform: scale(1);
}

.text-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 12px;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.65);
  font-variant-numeric: tabular-nums;
}

.text-time p {
  user-select: none;
  margin: 0;
}
</style>
