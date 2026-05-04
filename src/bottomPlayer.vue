<template>
    <v-sheet class="align-center mobile-player" elevation="16">
        <v-col class="pa-0 ma-0">
            <!-- ⭐ 整行的拖动条 -->
            <v-slider :model-value="player.currentTime.value" :max="player.duration.value" @start="sliderStart"
                @end="sliderEnd" hide-details track-size="3" thumb-size="0" class="pa-0 ma-0 mobile-slider" />

            <v-row class="align-center ma-1 mobile-player-row">
                <!-- 左侧 -->
                <v-col cols="3" class="d-flex align-center">
                    <v-sheet width="48" height="48" class="mobile-album-cover">
                        <v-img :width="48" :height="48" rounded="lg" :src="player.currentTrack?.value?.picUrl"
                            @mouseenter="hover = true" @mouseleave="hover = false" cover>
                            <template #default>
                                <div class="overlay cursor-pointer" :class="{ show: hover }" @click="startAudioView">
                                    <v-icon size="small">mdi-fullscreen</v-icon>
                                </div>
                            </template>
                        </v-img>
                    </v-sheet>
                    <div class="ml-2 overflow-hidden mobile-track-info">
                        <div class="text-truncate text-caption mobile-track-name">{{ player.currentTrack?.value?.name }}
                        </div>
                        <div class="text-truncate text-caption mobile-track-artist">{{
                            player.currentTrack?.value?.artist }}</div>
                    </div>
                </v-col>

                <!-- 中间 -->
                <v-col cols="6" class="text-center mobile-controls">
                    <v-btn icon @click='player.prev()' variant="text" size="x-small"><v-icon
                            size="small">mdi-skip-previous</v-icon></v-btn>
                    <v-btn icon @click='player.toggle()' variant="text" size="small"><v-icon>{{ player.isPlaying.value ?
                        'mdi-pause'
                        : 'mdi-play'
                            }}</v-icon></v-btn>
                    <v-btn icon @click='player.next()' variant="text" size="x-small"><v-icon
                            size="small">mdi-skip-next</v-icon></v-btn>
                </v-col>

                <!-- 右侧 -->
                <v-col cols="3" class="text-end mobile-playlist-btn">
                    <v-btn icon @click='navigationrightShow = !navigationrightShow' size="small"><v-icon
                            size="small">mdi-playlist-music</v-icon></v-btn>
                </v-col>
            </v-row>

        </v-col>
    </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { navigationrightShow } from './state';

import router from './router';
import { AudioViewShow, player, sliderEnd, sliderStart } from './staic';
// player
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

/* 移动端优化样式 */
.mobile-player {
    position: relative;
    background-color: rgba(var(--v-theme-surface), 0.98);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(var(--v-border-color), 0.12);
    width: 100%;
}

.mobile-player-row {
    min-height: 56px;
}

.mobile-album-cover {
    flex-shrink: 0;
}

.mobile-track-info {
    min-width: 0;
    max-width: calc(100% - 56px);
}

.mobile-track-name,
.mobile-track-artist {
    font-size: 0.75rem !important;
    line-height: 1.2;
}

.mobile-controls {
    padding: 0 4px;
}

.mobile-playlist-btn {
    padding: 0;
}

/* 小屏幕适配 */
@media (max-width: 600px) {
    .mobile-player-row {
        min-height: 52px;
    }

    .mobile-track-name,
    .mobile-track-artist {
        font-size: 0.7rem !important;
    }
}
</style>