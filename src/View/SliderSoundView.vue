<template>
    <v-slider v-model="player.volume.value" :min="0" :max="1" hide-details track-size="6" thumb-size="0" step="0.01"
        @start="sliderStart" @end="sliderEnd" :color="props.themeColor" />

    <div class="volume-icons">
        <v-icon :style="{ color: props.themeColor }">mdi-volume-low</v-icon>
        <v-spacer></v-spacer>
        <v-icon :style="{ color: props.themeColor }">{{ Icon() }}</v-icon>
    </div>
</template>
<script setup lang="ts">
import { player } from '@/staic';
import { onActivated, ref } from 'vue';
import type { VCol, VIcon } from 'vuetify/components';

// 🎨 接收主题颜色
const props = defineProps<{
    themeColor?: string
}>()
function sliderStart(value: number) {
    player.setVolume(value)
}
function sliderEnd(value: number) {
    player.setVolume(value)
}
function onValueUpdate(val: number) {
    player.setVolume(val)

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

.volume-icons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 12px;
    margin-top: 4px;
}
</style>