<template>
    <v-sheet class="align-center" elevation="16">
        <v-col class="pa-0 ma-0">
            <!-- ⭐ 整行的拖动条 -->
            <v-slider :model-value="player.currentTime.value" :max="player.duration.value" @start="sliderStart"
                @end="sliderEnd" hide-details track-size="3" thumb-size="0" class="pa-0 ma-0" />

            <v-row class="align-center ma-1">
                <!-- 左侧 -->
                <v-col cols="3" class="d-flex align-center">
                    <v-sheet width="56" height="56">
                        <v-img :width="56" :height="56" rounded="lg" :src="player.currentTrack?.value?.picUrl"
                            @mouseenter="hover = true" @mouseleave="hover = false" cover>
                            <template #default>
                                <div class="overlay cursor-pointer" :class="{ show: hover }" @click="startAudioView">
                                    <v-icon>mdi-fullscreen</v-icon>
                                </div>
                            </template>
                        </v-img>
                    </v-sheet>
                    <div class="ml-2 overflow-hidden">
                        <div class="text-truncate">{{ player.currentTrack?.value?.name }}</div>
                        <div class="text-truncate">{{ player.currentTrack?.value?.artist }}</div>
                    </div>
                </v-col>

                <!-- 中间 -->
                <v-col cols="6" class="text-center">
                    <v-btn icon @click='player.prev()'><v-icon>mdi-skip-previous</v-icon></v-btn>
                    <v-btn icon @click='player.toggle()'><v-icon>{{ player.isPlaying.value ? 'mdi-pause' : 'mdi-play'
                            }}</v-icon></v-btn>
                    <v-btn icon @click='player.next()'><v-icon>mdi-skip-next</v-icon></v-btn>
                </v-col>

                <!-- 右侧 -->
                <v-col cols="3" class="text-end">
                    <v-btn icon
                        @click='navigationrightShow = !navigationrightShow'><v-icon>mdi-playlist-music</v-icon></v-btn>
                </v-col>
            </v-row>

        </v-col>
    </v-sheet>
</template>

<script setup lang="ts">
import { AudioPlayer } from '@/player';
import { getCurrentInstance, ref } from 'vue';
import { navigationrightShow } from './main';

import router from './router';
import { AudioViewShow, sliderEnd, sliderStart } from './staic';
const global = getCurrentInstance()!.appContext.config.globalProperties
const player = global.$player as AudioPlayer;
const hover = ref(false)
function startAudioView() {
    hover.value = false
    AudioViewShow.value = true
    router.push('/AudioView')
}
</script>
<style scoped>
/* 遮罩层 */
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.overlay.show {
    opacity: 1;
}

/* .slider {
    position: absolute;
    top: -13px;
    width: 100%;
    padding-right: 50px;
} */
/* .v-slider.v-input--horizontal>.v-input__control */
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