<template>
    <!-- 🌫 背景 -->
    <div class="bg" :style="{
        backgroundImage: `url(${imageSrc})`,
        transform: `scale(${scale}) rotate(${rotate}deg)`
    }" />
    <v-sheet class="fullscreen">

        <!-- 顶部按钮 -->
        <div class="top-btn">
            <v-btn icon="mdi-fullscreen-exit" variant="plain" @click="Close()" />
        </div>

        <!-- 主体 -->
        <v-row no-gutters class="main-row">

            <!-- 🍎 左侧 Apple Music -->
            <v-col class="left" cols="4">
                <div class="apple-wrapper">

                    <!-- 封面 -->
                    <div class="apple-cover">
                        <v-card class="cover-card">
                            <v-img :src="imageSrc" cover class="cover-img" />
                        </v-card>
                    </div>

                    <!-- 歌曲信息 -->
                    <div class="apple-info">
                        <p class="song-name">
                            {{ player.currentTrack.value?.name ?? '暂无歌曲' }}
                        </p>
                        <p class="artist-name">
                            {{ player.currentTrack.value?.artist ?? '暂无作者' }}
                        </p>
                    </div>

                    <!-- 进度条 -->
                    <div class="apple-progress">
                        <SliderView />
                    </div>

                    <!-- 控制按钮 -->
                    <div class="apple-controls">
                        <!-- 喜欢按钮 -->
                        <v-btn icon="mdi-heart" variant="text" @click="player.like(player.currentTrack.value?.id)" />
                        <v-btn icon="mdi-skip-previous" variant="text" @click="player.prev()" />
                        <v-btn :icon="player.isPlaying.value ? 'mdi-pause' : 'mdi-play'" variant="text" size="large"
                            @click="player.toggle()" />
                        <v-btn icon="mdi-skip-next" variant="text" @click="player.next()" />
                        <v-btn icon="mdi-repeat" variant="text" @click="player.SetPlayMode()" />
                    </div>

                    <!-- 音量 -->
                    <div class="apple-volume">
                        <SliderSoundView />
                    </div>

                </div>
            </v-col>
            <!-- 🎧 音频可视化分割 -->
            <div class="wave-divider">
                <div v-for="i in wave.length - 1" :key="i" class="wave-dot" :style="{
                    width: 5 + wave[i] * 46 + 'px',
                    opacity: 0.3 + wave[i]
                }" />
            </div>
            <!-- 🎤 右侧歌词 -->
            <v-col class="right">
                <div class="content-sheet">
                    <LrcView />
                </div>
            </v-col>

        </v-row>

    </v-sheet>
</template>

<script setup lang="ts">
import { AudioViewShow, player } from '@/staic'
import { ref, onMounted, watch } from 'vue'
import router from '@/router'
import LrcView from '@/View/LrcView.vue'
import SliderView from '@/View/SliderView.vue'
import SliderSoundView from '@/View/SliderSoundView.vue'
import axios from 'axios'

const imageSrc = ref<string>('')
const currentBlur = ref(90)

/* =========================
   图片加载（修复版）
========================= */
const loadImage = async (url?: string) => {
    if (!url) return

    if (!url.startsWith('http')) {
        imageSrc.value = url
        return
    }

    const res = await axios.get(url, { responseType: 'blob' })

    const reader = new FileReader()

    return new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
            const base64 = reader.result as string
            imageSrc.value = base64
            resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(res.data)
    })
}

/* =========================
   初始化播放器
========================= */
onMounted(() => {

    // if (player.playlist.value.length < 1) {
    //     player.addTrack('2722253787', true)
    // }

    animate()
    loadImage(player.currentTrack.value?.picUrl)
    watch(
        () => player.currentTrack.value?.id,
        () => {
            loadImage(player.currentTrack.value?.picUrl)
        }
    )

})
const scale = ref(1)
const rotate = ref(0)
const wave = ref<number[]>(Array(30).fill(0))

const half = Math.floor(wave.value.length / 2)

function animate() {
    requestAnimationFrame(animate)

    const volume = player.getVolume()

    scale.value += (1.15 + volume / 800 - scale.value) * 0.08

    const t = Date.now() * 0.00005

    rotate.value = Math.sin(t) * 5 + t * 10


    // 🎧 真正 FFT 数据

    const data = player.getFrequencyData()
    const WAVE_SIZE = 30

    wave.value = getMirrorWave(data, WAVE_SIZE)
}
function getMirrorWave(data: Uint8Array, size: number) {
    const result = new Array(size).fill(0)
    const step = data.length / size
    const center = (size - 1) / 2

    for (let i = 0; i < size; i++) {
        const mirrorIndex = i < center ? i : size - 1 - i
        const v = data[Math.floor(mirrorIndex * step)] || 0

        const value = v / 255

        const dist = Math.abs(i - center) / center
        const weight = Math.exp(-dist * dist * 1.5)

        // 🔥 关键：双重压缩
        result[i] =
            Math.pow(value, 1.5) * 0.35 +
            value * weight * 0.65
    }

    return result
}
/* =========================
   关闭
========================= */
function Close() {
    AudioViewShow.value = false
    router.back()
}
</script>

<style scoped>
/* =======================
   全屏背景
======================= */
.fullscreen {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    background: transparent;
}

/* 顶部按钮 */
.top-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 20;
}

/* 主体 */
.main-row {
    height: 100%;
}

/* =======================
   🍎 Apple Music 左侧
======================= */
.left {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.apple-wrapper {
    width: 85%;
    max-width: 360px;
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
}

/* 封面 */
.apple-cover {
    width: 260px;
    height: 260px;
}

.cover-card {
    width: 100%;
    height: 100%;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.cover-img {
    width: 100%;
    height: 100%;
}

/* 信息 */
.apple-info {
    text-align: center;
}

.song-name {
    font-size: 20px;
    font-weight: 600;
    color: white;
    margin: 0;
}

.artist-name {
    font-size: 14px;
    opacity: 0.6;
    margin-top: 4px;
}

/* 进度条 */
.apple-progress {
    width: 100%;
}

/* 控制按钮 */
.apple-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px;
    opacity: 0.8;
}

/* 音量 */
.apple-volume {
    width: 100%;
    opacity: 0.8;
}

/* =======================
   🎤 右侧歌词
======================= */
.right {
    height: 100%;
    overflow: hidden;
    display: flex;
}

.content-sheet {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 60px 40px;
}

/* =======================
   🌫 背景
======================= */
.fullscreen-img {
    position: fixed;
    width: 100vw;
    height: 100vh;
    transition: filter 0.1s linear;
}

.bg {
    position: fixed;
    width: 120vw;
    height: 160vh;

    top: -10vh;
    left: -10vw;

    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    filter: blur(90px) brightness(0.6) saturate(1.4);

    transform-origin: center;
}

.wave-divider {
    width: 20px;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    gap: 5px;
}

/* ⭐关键：竖点 */
.wave-dot {
    height: 6px;
    /* 固定高度 */
    width: 5px;
    /* 默认细 */

    background: rgba(255, 255, 255, 0.8);
    border-radius: 999px;

    transition: width 0.05s linear;
}
</style>