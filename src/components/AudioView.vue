<template>
    <!-- 🌫 背景 -->
    <div class="bg" :style="{
        backgroundImage: `url(${imageSrc})`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`
    }" />
    <v-sheet class="fullscreen" :style="{ '--theme-color': themeColor }">

        <!-- 顶部按钮 -->
        <div class="top-btn">
            <v-btn icon="mdi-fullscreen-exit" variant="plain" @click="Close()" :style="{ color: themeColor }" />
        </div>

        <!-- 🎵 右上角播放列表按钮 -->
        <div class="playlist-btn">
            <v-btn icon @click='navigationrightShow = !navigationrightShow' variant="plain"
                :style="{ color: themeColor }">
                <v-icon>mdi-playlist-music</v-icon>
            </v-btn>
        </div>

        <!-- 主体 - 桌面端布局 -->
        <v-row no-gutters class="main-row desktop-layout">

            <!-- 🍎 左侧播放器区域（自动） -->
            <v-col cols="12" sm="5" md="4" lg="3">
                <div class="apple-player-container">
                    <!-- 封面 -->
                    <div class="apple-cover">
                        <v-card class="cover-card" elevation="8">
                            <v-img :src="imageSrc" cover class="cover-img" aspect-ratio="1" />
                        </v-card>
                    </div>

                    <!-- 歌曲信息 -->
                    <div class="apple-info">
                        <h3 class="song-name" :style="{ color: themeColor }">
                            {{ player.currentTrack.value?.name ?? '暂无歌曲' }}
                        </h3>
                        <p class="artist-name" :style="{ color: themeColor + '99' }">
                            {{ player.currentTrack.value?.artist ?? '暂无作者' }}
                        </p>
                    </div>

                    <!-- 进度条 -->
                    <div class="apple-progress">
                        <SliderView :theme-color="themeColor" />
                    </div>

                    <!-- 控制按钮 -->
                    <div class="apple-controls">
                        <!-- 喜欢按钮 -->
                        <v-btn
                            :icon="player.isSongLiked(player.currentTrack.value?.id || '') ? 'mdi-heart' : 'mdi-heart-outline'"
                            :color="player.isSongLiked(player.currentTrack.value?.id || '') ? 'red' : themeColor"
                            variant="text" density="comfortable" @click="player.like(player.currentTrack.value?.id)"
                            aria-label="喜欢歌曲" />
                        <v-btn icon="mdi-skip-previous" variant="text" density="comfortable"
                            :style="{ color: themeColor }" @click="player.prev()" aria-label="上一首" />
                        <v-btn :icon="player.isPlaying.value ? 'mdi-pause' : 'mdi-play'" variant="text" size="large"
                            density="comfortable" :style="{ color: themeColor }" @click="player.toggle()"
                            aria-label="播放/暂停" />
                        <v-btn icon="mdi-skip-next" variant="text" density="comfortable" :style="{ color: themeColor }"
                            @click="player.next()" aria-label="下一首" />
                        <v-btn :icon="getPlayModeIcon()" variant="text" density="comfortable"
                            :style="{ color: themeColor }" @click="player.SetPlayMode()" aria-label="切换播放模式" />
                    </div>

                    <!-- 音量 -->
                    <div class="apple-volume">
                        <SliderSoundView :theme-color="themeColor" />
                    </div>
                </div>
            </v-col>

            <!-- 🎧 音频可视化分割线 -->
            <div class="wave-divider">
                <div v-for="i in wave.length - 1" :key="i" class="wave-dot" :style="{
                    width: 3 + wave[i]! * 28 + 'px',
                    opacity: 0.2 + wave[i]! * 0.8,
                    backgroundColor: themeColor,
                    boxShadow: `0 0 ${6 + wave[i]! * 10}px ${themeColor}35`
                }" />
            </div>

            <!-- 🎤 右侧歌词区域（70%） -->
            <v-col class="right" cols="12" sm="7" md="8" lg="9">
                <LrcView :theme-color="themeColor" />
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
                                <v-card class="mobile-cover-card" elevation="8">
                                    <v-img :src="imageSrc" cover class="mobile-cover-img" aspect-ratio="1" />
                                </v-card>
                            </div>
                        </div>

                        <!-- 底部信息区域 -->
                        <div class="mobile-bottom-section">
                            <!-- 歌曲信息 -->
                            <div class="mobile-info">
                                <h3 class="song-name" :style="{ color: themeColor }">
                                    {{ player.currentTrack.value?.name ?? '暂无歌曲' }}
                                </h3>
                                <p class="artist-name" :style="{ color: themeColor + '99' }">
                                    {{ player.currentTrack.value?.artist ?? '暂无作者' }}
                                </p>
                            </div>

                            <!-- 进度条 -->
                            <div class="mobile-progress">
                                <SliderView :theme-color="themeColor" />
                            </div>

                            <!-- 控制按钮 -->
                            <div class="mobile-controls">
                                <!-- 喜欢按钮 -->
                                <v-btn
                                    :icon="player.isSongLiked(player.currentTrack.value?.id || '') ? 'mdi-heart' : 'mdi-heart-outline'"
                                    :color="player.isSongLiked(player.currentTrack.value?.id || '') ? 'red' : themeColor"
                                    variant="text" density="comfortable"
                                    @click="player.like(player.currentTrack.value?.id)" aria-label="喜欢歌曲" />
                                <v-btn icon="mdi-skip-previous" variant="text" density="comfortable"
                                    :style="{ color: themeColor }" @click="player.prev()" aria-label="上一首" />
                                <v-btn :icon="player.isPlaying.value ? 'mdi-pause' : 'mdi-play'" variant="text"
                                    size="large" density="comfortable" :style="{ color: themeColor }"
                                    @click="player.toggle()" aria-label="播放/暂停" />
                                <v-btn icon="mdi-skip-next" variant="text" density="comfortable"
                                    :style="{ color: themeColor }" @click="player.next()" aria-label="下一首" />
                                <v-btn :icon="getPlayModeIcon()" variant="text" density="comfortable"
                                    :style="{ color: themeColor }" @click="player.SetPlayMode()" aria-label="切换播放模式" />
                            </div>

                            <!-- 音量 -->
                            <div class="mobile-volume">
                                <SliderSoundView :theme-color="themeColor" />
                            </div>
                        </div>
                    </div>

                    <!--  第二页：歌词 -->
                    <div class="mobile-slide mobile-lyrics-section">
                        <div class="mobile-content-sheet">
                            <LrcView :theme-color="themeColor" />
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
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useTheme } from 'vuetify'
import router from '@/router'
import LrcView from '@/View/LrcView.vue'
import SliderView from '@/View/SliderView.vue'
import SliderSoundView from '@/View/SliderSoundView.vue'
import axios from 'axios'
import { PlayMode } from '@/player'
import { getLyric } from '@/api'

// 🎨 获取 Vuetify 主题
const vuetifyTheme = useTheme()

const imageSrc = ref<string>('')

// 🎨 计算当前主题的反差色（深色主题用白色，浅色主题用深色）
const themeColor = ref<string>(vuetifyTheme.global.current.value.dark ? '#ffffff' : '#1a1a1a')


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
        extractDominantColor(url)
        return
    }

    const res = await axios.get(url, { responseType: 'blob' })

    const reader = new FileReader()

    return new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
            const base64 = reader.result as string
            imageSrc.value = base64
            // 🎨 提取主题颜色
            extractDominantColor(base64)
            resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(res.data)
    })
}

/* =========================
   🎨 提取图片主色调并计算反差色
========================= */
function extractDominantColor(imageUrl: string) {
    const img = new Image()
    img.crossOrigin = 'Anonymous'

    img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 缩小图片以提高性能
        const size = 50
        canvas.width = size
        canvas.height = size
        ctx.drawImage(img, 0, 0, size, size)

        // 获取像素数据
        const imageData = ctx.getImageData(0, 0, size, size).data
        let r = 0, g = 0, b = 0
        let count = 0

        // 采样像素（跳过透明像素）
        for (let i = 0; i < imageData.length; i += 16) { // 每4个像素采样一次
            const alpha = imageData[i + 3]
            if (alpha !== undefined && alpha > 128) { // 忽略半透明像素
                const red = imageData[i]
                const green = imageData[i + 1]
                const blue = imageData[i + 2]
                if (red !== undefined && green !== undefined && blue !== undefined) {
                    r += red
                    g += green
                    b += blue
                    count++
                }
            }
        }

        if (count === 0) {
            console.log('🎨 未找到有效像素，使用默认主题色')
            return
        }

        // 计算平均颜色
        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)

        // 🎯 计算互补色（色差最大的颜色）
        const complementaryColor = getContrastingColor(r, g, b)
        themeColor.value = complementaryColor
        console.log(`🎨 提取颜色 - 原色: rgb(${r}, ${g}, ${b}), 反差色: ${complementaryColor}`)
    }

    img.src = imageUrl
}

/* =========================
   🎯 计算与给定颜色反差最大的颜色
========================= */
function getContrastingColor(r: number, g: number, b: number): string {
    // 方法1: 计算亮度，返回黑白中对比度更高的
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    if (brightness > 128) {
        // 亮色背景，返回深色文字
        return '#1a1a1a'
    } else {
        // 暗色背景，返回浅色文字
        return '#ffffff'
    }
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
    top: 16px;
    left: 16px;
    z-index: 20;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
}

.top-btn .v-btn {
    transition: all 0.2s ease;
}

.top-btn .v-btn:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.1);
}

/* 🎵 右上角播放列表按钮 */
.playlist-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 20;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
}

.playlist-btn .v-btn {
    transition: all 0.2s ease;
}

.playlist-btn .v-btn:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.1);
}

/* 主体 */
.main-row {
    height: 100%;
}

/* =======================
   🍎 Apple Music 左侧
======================= */


.apple-player-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    height: 100%;
    width: 100%;
    padding: 36px;
}

/* 大屏幕优化 */
@media (min-width: 1400px) {

    .apple-cover {
        width: 280px !important;
        height: 280px !important;
    }
}

@media (min-width: 1600px) {
    .apple-cover {
        width: 260px !important;
        height: 260px !important;
    }
}

@media (min-width: 1920px) {

    .apple-cover {
        width: 240px !important;
        height: 240px !important;
    }
}

@media (min-width: 2560px) {

    .apple-cover {
        width: 260px !important;
        height: 260px !important;
    }
}

/* 封面 */
.apple-cover {
    width: 300px;
    height: 300px;
    max-width: 100%;
    transition: transform 0.3s ease;
}

.apple-cover:hover {
    transform: scale(1.02);
}

.cover-card {
    width: 100%;
    height: 100%;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.45),
        0 10px 30px rgba(0, 0, 0, 0.3);
    transition: box-shadow 0.3s ease;
}

.apple-cover:hover .cover-card {
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55),
        0 15px 40px rgba(0, 0, 0, 0.4);
}

.cover-img {
    width: 100%;
    height: 100%;
}

/* 信息 */
.apple-info {
    text-align: center;
    width: 100%;
    max-width: 400px;
}

.song-name {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.5px;
    color: var(--theme-color, #ffffff);
    transition: color 0.3s ease;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.artist-name {
    font-size: 16px;
    margin-top: 10px;
    opacity: 0.65;
    font-weight: 500;
    letter-spacing: 0.3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 进度条 */
.apple-progress {
    width: 100%;
    padding: 0 8px;
}

/* 控制按钮 */
.apple-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    opacity: 0.85;
    transition: opacity 0.3s ease;
    flex-wrap: wrap;
}

.apple-controls:hover {
    opacity: 1;
}

.apple-controls .v-btn {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-controls .v-btn:hover {
    transform: scale(1.1);
}

.apple-controls .v-btn:active {
    transform: scale(0.95);
}

/* 音量 */
.apple-volume {
    width: 100%;
    opacity: 0.75;
    transition: opacity 0.3s ease;
}

.apple-volume:hover {
    opacity: 0.95;
}

/* =======================
   🎤 右侧歌词
======================= */
.right {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex: 1;
    margin-left: 0;
    padding: 0 32px;
    mask-image: linear-gradient(to bottom,
            transparent 0%,
            black 12%,
            black 88%,
            transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom,
            transparent 0%,
            black 12%,
            black 88%,
            transparent 100%);
}

/* =======================
   📱 移动端布局
======================= */
.mobile-layout {
    display: none;
    height: 100%;
    flex-direction: column;
    position: relative;
    background: transparent;
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
    padding: 30px 20px;
}

.mobile-cover {
    width: 300px;
    height: 300px;
    max-width: 75vw;
    transition: transform 0.3s ease;
}

.mobile-cover:active {
    transform: scale(0.98);
}

.mobile-cover-card {
    width: 100%;
    height: 100%;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.45),
        0 10px 30px rgba(0, 0, 0, 0.3);
}

.mobile-cover-img {
    width: 100%;
    height: 100%;
}

/* 底部信息区域 */
.mobile-bottom-section {
    padding: 0 28px 35px;
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.mobile-info {
    width: 100%;
    text-align: center;
    max-width: 400px;
}

.mobile-info .song-name {
    font-size: 21px;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.5px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mobile-info .artist-name {
    font-size: 15px;
    opacity: 0.65;
    margin-top: 8px;
    font-weight: 500;
    letter-spacing: 0.3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mobile-progress {
    width: 100%;
}

.mobile-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    opacity: 0.85;
    flex-wrap: wrap;
}

.mobile-controls .v-btn {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-controls .v-btn:active {
    transform: scale(0.9);
}

.mobile-volume {
    width: 100%;
    opacity: 0.75;
}

.mobile-lyrics-section {
    display: flex;
    flex-direction: column;
}

.mobile-content-sheet {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 0px 20px 40px;
    /* 添加上下沉浸式效果 - 优化渐变范围 */
    mask-image: linear-gradient(to bottom,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%);
    -webkit-overflow-scrolling: touch;
}

/* 页面指示器 */
.page-indicator {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 10;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.08);
    padding: 8px 16px;
    border-radius: 20px;
}

.indicator-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.indicator-dot.active {
    background: rgba(255, 255, 255, 0.95);
    width: 28px;
    border-radius: 4px;
}

/* =======================
   🌫 背景
======================= */
.bg {
    position: absolute;

    width: 120vmax;
    height: 120vmax;

    left: 50%;
    top: 50%;

    background-size: cover;
    background-position: center;

    filter: blur(80px) brightness(0.5) saturate(1.3);

    transition: filter 0.3s ease;
    will-change: transform, filter;
}


.wave-divider {
    width: 36px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 3px;
}

/* ⭐关键：竖点 - 优化视觉效果 */
.wave-dot {
    height: 4px;
    width: 3px;
    border-radius: 999px;
    transition: all 0.06s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: width, opacity, box-shadow;
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
        top: 12px;
        left: 12px;
    }

    .playlist-btn {
        top: 12px;
        right: 12px;
    }

    /* 优化移动端触摸体验 */
    .mobile-controls .v-btn {
        min-width: 48px;
        min-height: 48px;
    }
}

@media (max-width: 480px) {
    .mobile-cover {
        width: 260px;
        height: 260px;
    }

    .mobile-player-section {
        padding: 0 15px 15px;
    }

    .mobile-bottom-section {
        padding: 0 20px 25px;
        gap: 15px;
    }

    .mobile-controls {
        gap: 15px;
    }

    .mobile-info .song-name {
        font-size: 19px;
    }

    .mobile-info .artist-name {
        font-size: 14px;
    }

    /* 优化小屏幕上的按钮大小 */
    .apple-controls .v-btn,
    .mobile-controls .v-btn {
        min-width: 40px;
        min-height: 40px;
    }
}
</style>