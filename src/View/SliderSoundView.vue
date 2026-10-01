<template>
  <v-slider
    v-model="player.volume.value"
    :min="0"
    :max="1"
    hide-details
    track-size="6"
    thumb-size="12"
    step="0.01"
    @start="sliderStart"
    @end="sliderEnd"
    :color="props.themeColor"
    class="audio-slider"
  />

  <div class="volume-icons">
    <v-icon>mdi-volume-low</v-icon>
    <v-spacer></v-spacer>
    <v-icon>{{ Icon() }}</v-icon>
  </div>
</template>
<script setup lang="ts">
import { player } from '@/staic'

const props = defineProps<{
  themeColor?: string
}>()

function sliderStart(value: number) {
  player.setVolume(value)
}
function sliderEnd(value: number) {
  player.setVolume(value)
}
function Icon() {
  if (player.volume.value == 0) {
    return 'mdi-volume-off'
  } else if (player.volume.value < 0.5) {
    return 'mdi-volume-medium'
  } else {
    return 'mdi-volume-high'
  }
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

.volume-icons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-size: 12px;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.75);
}
</style>
