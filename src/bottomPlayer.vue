<template>
    <v-card class="footer pa-4 align-center" elevation="16" v-if="ButtonPlayerShow">
        <!-- ⭐ 整行的拖动条 -->
        <v-slider class="slider" :model-value="player.currentTime.value" :max="player.duration.value"
            @start="sliderStart" @end="sliderEnd" hide-details track-size="4" thumb-size="0" />


        <!-- ⭐ 下面是原来的 1 : 2 : 1 布局 -->
        <v-row class="align-center">

            <!-- 左 1 -->
            <v-col cols="3">
                <v-row class="align-center">
                    <v-card width="56" height="56">
                        <v-img :src="`${player.currentTrack?.value?.picUrl}`" width="56" height="56"
                            @mouseenter="hover = true" @mouseleave="hover = false">
                            <template #default>
                                <div class="overlay cursor-pointer" :class="{ show: hover }" @click="startAudioView">
                                    <v-icon>mdi-fullscreen</v-icon>
                                </div>
                            </template>
                        </v-img>
                    </v-card>
                    <v-col>
                        <v-card-title class="pa-0">{{ player.currentTrack?.value?.name }}</v-card-title>
                        <v-card-subtitle class="pa-0">{{ player.currentTrack?.value?.artist }}</v-card-subtitle>
                    </v-col>
                </v-row>
            </v-col>

            <!-- 中 2 -->
            <v-col cols="6" class="text-center">
                <v-btn icon @click='player.prev()' class="ma-1">
                    <v-icon>mdi-skip-previous</v-icon>
                </v-btn>
                <v-btn icon @click='player.toggle()' class="ma-1">
                    <v-icon>{{ player.isPlaying.value ? 'mdi-pause' : 'mdi-play' }}</v-icon>
                </v-btn>
                <v-btn icon @click='player.next()' class="ma-1">
                    <v-icon>mdi-skip-next</v-icon>
                </v-btn>
            </v-col>

            <!-- 右 1 -->
            <v-col cols="3" class="text-end">
                <v-btn icon @click='toggleRightDrawer()'>
                    <v-icon>mdi-playlist-music</v-icon>
                </v-btn>
            </v-col>

        </v-row>
    </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ButtonPlayerShow, player, toggleRightDrawer } from './player'
import { fa } from 'vuetify/locale'
import { changeComponent } from './main'
const hover = ref(false)
function sliderStart(value: number) {
    player.seek(value)
    player.pause()
}
function sliderEnd(value: number) {
    player.seek(value)
    player.play()
}

function startAudioView() {
    // ButtonPlayerShow.value = false
    changeComponent('AudioView')
    // 跳转到AudioView

    // window.open('/audio', '_blank')
}
</script>
<style scoped>
.footer {
    position: fixed;
    left: 160px;
    right: 0;
    bottom: 0;
    background: #1e1e1e;
    padding: 10px 20px;
    height: 90px;
    /* 播放器高度 */
    display: flex;
    align-items: center;
    box-sizing: border-box;
}

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

.slider {
    position: absolute;
    top: -13px;
    width: 100%;
    padding-right: 50px;
}
</style>