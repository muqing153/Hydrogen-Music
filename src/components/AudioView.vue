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

        <!-- 🎵 右上角播放列表按钮 -->
        <div class="playlist-btn">
            <v-btn icon @click='navigationrightShow = !navigationrightShow' variant="plain">
                <v-icon>mdi-playlist-music</v-icon>
            </v-btn>
        </div>

        <!-- 主体 - 桌面端布局 -->
        <v-row no-gutters class="main-row desktop-layout">

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
                        <v-btn
                            :icon="player.isSongLiked(player.currentTrack.value?.id || '') ? 'mdi-heart' : 'mdi-heart-outline'"
                            :color="player.isSongLiked(player.currentTrack.value?.id || '') ? 'red' : undefined"
                            variant="text" @click="player.like(player.currentTrack.value?.id)" />
                        <v-btn icon="mdi-skip-previous" variant="text" @click="player.prev()" />
                        <v-btn :icon="player.isPlaying.value ? 'mdi-pause' : 'mdi-play'" variant="text" size="large"
                            @click="player.toggle()" />
                        <v-btn icon="mdi-skip-next" variant="text" @click="player.next()" />
                        <v-btn :icon="getPlayModeIcon()" variant="text" @click="player.SetPlayMode()" />
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
                    width: 5 + wave[i]! * 46 + 'px',
                    opacity: 0.3 + wave[i]!
                }" />
            </div>
            <!-- 🎤 右侧歌词 -->
            <v-col class="right">
                <div class="content-sheet">
                    <LrcView />
                </div>
            </v-col>

        </v-row>

        <!-- 主体 - 移动端布局 -->
        <div class="mobile-layout">
            <!-- 页面指示器 -->
            <div class="page-indicator">
                <div class="indicator-dot" :class="{ active: currentSlide === 0 }"></div>
                <div class="indicator-dot" :class="{ active: currentSlide === 1 }"></div>
            </div>
            <!-- 滑动容器 -->
            <div class="mobile-swipe-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
                @touchend="handleTouchEnd">
                <div class="mobile-slider" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                    <!-- 🍎 第一页：播放器封面 - 模仿桌面端布局 -->
                    <div class="mobile-slide mobile-player-section">
                        <!-- 封面区域 - 居中 -->
                        <div class="mobile-cover-area">
                            <div class="mobile-cover">
                                <v-card class="mobile-cover-card">
                                    <v-img :src="imageSrc" cover class="mobile-cover-img" />
                                </v-card>
                            </div>
                        </div>

                        <!-- 底部信息区域 -->
                        <div class="mobile-bottom-section">
                            <!-- 歌曲信息 -->
                            <div class="mobile-info">
                                <p class="song-name">
                                    {{ player.currentTrack.value?.name ?? '暂无歌曲' }}
                                </p>
                                <p class="artist-name">
                                    {{ player.currentTrack.value?.artist ?? '暂无作者' }}
                                </p>
                            </div>

                            <!-- 进度条 -->
                            <div class="mobile-progress">
                                <SliderView />
                            </div>

                            <!-- 控制按钮 -->
                            <div class="mobile-controls">
                                <!-- 喜欢按钮 -->
                                <v-btn
                                    :icon="player.isSongLiked(player.currentTrack.value?.id || '') ? 'mdi-heart' : 'mdi-heart-outline'"
                                    :color="player.isSongLiked(player.currentTrack.value?.id || '') ? 'red' : undefined"
                                    variant="text" @click="player.like(player.currentTrack.value?.id)" />
                                <v-btn icon="mdi-skip-previous" variant="text" @click="player.prev()" />
                                <v-btn :icon="player.isPlaying.value ? 'mdi-pause' : 'mdi-play'" variant="text"
                                    size="large" @click="player.toggle()" />
                                <v-btn icon="mdi-skip-next" variant="text" @click="player.next()" />
                                <v-btn :icon="getPlayModeIcon()" variant="text" @click="player.SetPlayMode()" />
                            </div>

                            <!-- 音量 -->
                            <div class="mobile-volume">
                                <SliderSoundView />
                            </div>
                        </div>
                    </div>

                    <!--  第二页：歌词 -->
                    <div class="mobile-slide mobile-lyrics-section">
                        <div class="mobile-content-sheet">
                            <LrcView />
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </v-sheet>
</template>

<script setup lang="ts">
import { AudioViewShow, player } from '@/staic'
import { navigationrightShow } from '@/state'
import { ref, onMounted, watch, nextTick } from 'vue'
import router from '@/router'
import LrcView from '@/View/LrcView.vue'
import SliderView from '@/View/SliderView.vue'
import SliderSoundView from '@/View/SliderSoundView.vue'
import axios from 'axios'
import { PlayMode } from '@/player'
import { getLyric } from '@/api'

const imageSrc = ref<string>('')

// 移动端滑动相关
const currentSlide = ref(0) // 0: 封面页, 1: 歌词页
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartSlide = ref(0)

function handleTouchStart(event: TouchEvent) {
    touchStartX.value = event.touches[0]?.clientX || 0
    touchStartY.value = event.touches[0]?.clientY || 0
    touchStartSlide.value = currentSlide.value
}

function handleTouchMove(event: TouchEvent) {
    // 可以在这里添加滑动过程中的视觉反馈
}

function handleTouchEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0]?.clientX || 0
    const touchEndY = event.changedTouches[0]?.clientY || 0

    const deltaX = touchEndX - touchStartX.value
    const deltaY = touchEndY - touchStartY.value

    // 判断是否为水平滑动（水平距离大于垂直距离）
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentSlide.value > 0) {
            // 向右滑动，切换到上一页
            currentSlide.value = currentSlide.value - 1
        } else if (deltaX < 0 && currentSlide.value < 1) {
            // 向左滑动，切换到下一页
            currentSlide.value = currentSlide.value + 1
        }
    }
}

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
    animate()
    loadImage(player.currentTrack.value?.picUrl)
    // 动态获取当前歌曲的歌词
    loadLyricForCurrentTrack()

    watch(
        () => player.currentTrack.value?.id,
        () => {
            loadImage(player.currentTrack.value?.picUrl)
            // 歌曲切换时，动态获取新歌曲的歌词
            loadLyricForCurrentTrack()
        }
    )
})

/* =========================
   动态加载歌词
========================= */
async function loadLyricForCurrentTrack() {
    const track = player.currentTrack.value
    if (!track || !track.id) {
        return
    }

    // 如果已经有歌词数据，不需要重新获取
    if (track.lyric) {
        console.log(`歌曲 ${track.id} 已有歌词数据，跳过获取`)
        return
    }

    try {
        console.log(`正在获取歌曲 ${track.id} 的歌词...`)
        const lyricData = await getLyric(track.id)

        // 更新播放列表中对应歌曲的歌词
        const idx = player.playlist.value.findIndex(t => t.id === track!.id)
        if (idx !== -1 && lyricData) {
            player.playlist.value[idx]!.lyric = lyricData
            console.log(`歌曲 ${track.id} 歌词获取成功`)
        }
    } catch (error) {
        console.warn(`获取歌曲 ${track.id} 歌词失败:`, error)
    }
}
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

/* =========================
   获取播放模式图标
========================= */
function getPlayModeIcon(): string {
    switch (player.playMode.value) {
        case PlayMode.Sequential:
            return 'mdi-repeat-off' // 顺序播放（不循环）
        case PlayMode.Loop:
            return 'mdi-repeat-once' // 单曲循环
        case PlayMode.Shuffle:
            return 'mdi-shuffle' // 随机播放
        case PlayMode.ListLoop:
            return 'mdi-repeat' // 列表循环
        default:
            return 'mdi-repeat-off'
    }
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

/* 🎵 右上角播放列表按钮 */
.playlist-btn {
    position: absolute;
    top: 10px;
    right: 10px;
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
    align-items: center;
}

.apple-wrapper {
    width: 85%;
    max-width: 360px;
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
   📱 移动端布局
======================= */
.mobile-layout {
    display: none;
    height: 100%;
    flex-direction: column;
    position: relative;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%);
}

/* 滑动容器 */
.mobile-swipe-container {
    flex: 1;
    overflow: hidden;
    position: relative;
    touch-action: pan-y;
    /* 允许垂直滚动，拦截水平滑动 */
}

.mobile-slider {
    display: flex;
    height: 100%;
    transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.mobile-slide {
    flex: 0 0 100%;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.mobile-player-section {
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* 封面区域 - 居中 */
.mobile-cover-area {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.mobile-cover {
    width: 280px;
    height: 280px;
    max-width: 80vw;
}

.mobile-cover-card {
    width: 100%;
    height: 100%;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.mobile-cover-img {
    width: 100%;
    height: 100%;
}

/* 底部信息区域 */
.mobile-bottom-section {
    padding: 0 24px 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.mobile-info {
    width: 100%;
}

.mobile-info .song-name {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
}

.mobile-info .artist-name {
    font-size: 14px;
    opacity: 0.6;
    margin-top: 4px;
}

.mobile-progress {
    width: 100%;
}

.mobile-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px;
    opacity: 0.8;
}

.mobile-volume {
    width: 100%;
    opacity: 0.8;
}

.mobile-lyrics-section {
    display: flex;
    flex-direction: column;
}

.mobile-content-sheet {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 60px 20px 100px;
    -webkit-overflow-scrolling: touch;
}

/* 页面指示器 */
.page-indicator {
    position: absolute;
    top: 25px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 10;
}

.indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.indicator-dot.active {
    background: rgba(255, 255, 255, 0.9);
    width: 24px;
    border-radius: 3px;
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
    height: 100vw;

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

/* =======================
   📱 响应式设计
======================= */
@media (max-width: 768px) {

    /* 隐藏桌面端布局 */
    .desktop-layout {
        display: none !important;
    }

    /* 显示移动端布局 */
    .mobile-layout {
        display: flex;
    }

    /* 调整顶部按钮位置 */
    .top-btn {
        top: 8px;
        left: 8px;
    }

    .playlist-btn {
        top: 8px;
        right: 8px;
    }

    /* 优化移动端触摸体验 */
    .mobile-controls .v-btn {
        min-width: 48px;
        min-height: 48px;
    }
}

@media (max-width: 480px) {
    .mobile-cover {
        width: 240px;
        height: 240px;
    }

    .mobile-player-section {
        padding: 0 15px 15px;
    }

    .mobile-controls {
        gap: 12px;
    }
}
</style>