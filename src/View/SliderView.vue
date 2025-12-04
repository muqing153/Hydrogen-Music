<template>
    <v-slider :model-value="player.currentTime.value" :max="player.duration.value" @start="sliderStart" @end="sliderEnd"
        hide-details track-size="3" thumb-size="0" />
</template>
<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue';
import { AudioPlayer } from '@/player';
import { sliderEnd, sliderStart } from '@/main';
const global = getCurrentInstance()!.appContext.config.globalProperties
const player = global.$player as AudioPlayer;
</script>
<style scoped>
:deep(.v-slider.v-input--horizontal>.v-input__control) {
    min-height: 0;
}

:deep(.v-slider-track) {
    border-radius: 0;
}

:deep(.v-slider__track-container) {
    height: 0px;
}
</style>