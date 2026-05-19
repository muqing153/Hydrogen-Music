<template>
    <v-slider v-model="localTime" :max="player.duration.value" @start="onStart" @end="onEnd" hide-details track-size="6"
        thumb-size="0" :thumb-transition="false" :color="props.themeColor" />

    <div class="text-time" :style="{ color: props.themeColor || 'rgba(255, 255, 255, 0.6)' }">
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
    }
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

.text-time {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 12px;
    margin-top: 4px;
}

.text-time p {
    user-select: none;
    margin: 0;
}
</style>
