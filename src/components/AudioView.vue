<template>
  <v-sheet class="fullscreen" :style="{ '--c-main': accentTriplet }">
    <!-- 🌫 分层背景 -->
    <div class="bg" aria-hidden="true">
      <div class="bg__parallax" ref="parallaxEl">
        <div
          class="bg__breathe"
          :style="{ animationPlayState: player.isPlaying.value ? 'running' : 'paused' }"
        >
          <div
            class="bg__layer"
            :class="{ 'is-active': activeLayer === 0 }"
            :style="layerStyle(0)"
          />
          <div
            class="bg__layer"
            :class="{ 'is-active': activeLayer === 1 }"
            :style="layerStyle(1)"
          />
        </div>
      </div>
      <div class="bg__glow" />
      <div class="bg__scrim" />
      <div class="bg__noise" />
    </div>

    <!-- 顶部按钮 -->
    <div class="top-btn">
      <v-btn icon="mdi-fullscreen-exit" variant="plain" @click="Close()" />
    </div>
    <!-- 🎵 右上角播放列表按钮 -->
    <div class="playlist-btn">
      <v-btn icon variant="plain" @click="navigationrightShow = !navigationrightShow">
        <v-icon>mdi-playlist-music</v-icon>
      </v-btn>
    </div>

    <!-- 主体 - 桌面端布局 -->
    <v-row no-gutters class="main-row desktop-layout">
      <!-- 🍎 左侧播放器区域 -->
      <v-col cols="12" sm="5" md="4" lg="3">
        <div class="apple-player-container">
          <!-- 封面（交叉淡入） -->
          <div class="apple-cover">
            <v-card class="cover-card" elevation="8">
              <div
                class="cover-layer"
                :class="{ 'is-active': activeCover === 0 }"
                :style="coverStyle(0)"
              />
              <div
                class="cover-layer"
                :class="{ 'is-active': activeCover === 1 }"
                :style="coverStyle(1)"
              />
            </v-card>
          </div>

          <!-- 歌曲信息 -->
          <div class="apple-info">
            <h3 class="song-name">{{ player.currentTrack.value?.name ?? '暂无歌曲' }}</h3>
            <p class="artist-name">{{ player.currentTrack.value?.artist ?? '暂无作者' }}</p>
          </div>

          <!-- 进度条 -->
          <div class="apple-progress">
            <SliderView :theme-color="accent" />
          </div>

          <!-- 控制按钮 -->
          <div class="apple-controls">
            <v-btn
              :icon="
                player.isSongLiked(player.currentTrack.value?.id || '')
                  ? 'mdi-heart'
                  : 'mdi-heart-outline'
              "
              :color="player.isSongLiked(player.currentTrack.value?.id || '') ? 'red' : 'white'"
              variant="text"
              density="comfortable"
              @click="player.like(player.currentTrack.value?.id)"
              aria-label="喜欢歌曲"
            />
            <v-btn
              icon="mdi-skip-previous"
              variant="text"
              density="comfortable"
              class="ctrl-btn"
              @click="player.prev()"
              aria-label="上一首"
            />
            <v-btn
              class="play-btn"
              :icon="player.isPlaying.value ? 'mdi-pause' : 'mdi-play'"
              size="large"
              variant="text"
              density="comfortable"
              @click="player.toggle()"
              aria-label="播放/暂停"
            />
            <v-btn
              icon="mdi-skip-next"
              variant="text"
              density="comfortable"
              class="ctrl-btn"
              @click="player.next()"
              aria-label="下一首"
            />
            <v-btn
              :icon="getPlayModeIcon()"
              variant="text"
              density="comfortable"
              class="ctrl-btn"
              @click="player.SetPlayMode()"
              aria-label="切换播放模式"
            />
          </div>

          <!-- 音量 -->
          <div class="apple-volume">
            <SliderSoundView :theme-color="accent" />
          </div>
        </div>
      </v-col>

      <!-- 🎧 音频可视化分割线 -->
      <div class="wave-divider">
        <div v-for="i in WAVE_SIZE" :key="i" class="wave-dot" :ref="(el) => setDotRef(el, i - 1)" />
      </div>

      <!-- 🎤 右侧歌词区域 -->
      <v-col class="right" cols="12" sm="7" md="8" lg="9">
        <LrcView :theme-color="accent" />
      </v-col>
    </v-row>
  </v-sheet>
</template>
<script setup lang="ts">
import { AudioViewShow, player } from '@/staic'
import { navigationrightShow } from '@/state'
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import LrcView from '@/View/LrcView.vue'
import SliderView from '@/View/SliderView.vue'
import SliderSoundView from '@/View/SliderSoundView.vue'
import axios from 'axios'
import { PlayMode } from '@/player'
import { getLyric } from '@/api'

/* =========================
   🎨 主色（--c-main 空格三元组）
========================= */
const fallbackPalette = [
  '126 168 214',
  '196 138 122',
  '148 176 130',
  '186 148 200',
  '214 176 116',
  '130 186 182',
]
const accentTriplet = ref(fallbackPalette[0]!)
const accent = computed(() => `rgb(${accentTriplet.value})`)

function fallbackAccent() {
  const id = String(player.currentTrack.value?.id ?? '')
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  accentTriplet.value = fallbackPalette[hash % fallbackPalette.length]!
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rf = r / 255
  const gf = g / 255
  const bf = b / 255
  const max = Math.max(rf, gf, bf)
  const min = Math.min(rf, gf, bf)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rf) h = (gf - bf) / d + (gf < bf ? 6 : 0)
    else if (max === gf) h = (bf - rf) / d + 2
    else h = (rf - gf) / d + 4
    h *= 60
  }
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (hp < 1) {
    r = c
    g = x
  } else if (hp < 2) {
    r = x
    g = c
  } else if (hp < 3) {
    g = c
    b = x
  } else if (hp < 4) {
    g = x
    b = c
  } else if (hp < 5) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  const m = l - c / 2
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function extractAccent(imageUrl: string) {
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.onload = () => {
    try {
      const size = 24
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return fallbackAccent()
      ctx.drawImage(img, 0, 0, size, size)
      const data = ctx.getImageData(0, 0, size, size).data

      let bestScore = -1
      let bh = 0
      let bs = 0
      let bl = 0
      for (let i = 0; i < data.length; i += 4) {
        if ((data[i + 3] ?? 0) < 125) continue
        const [h, s, l] = rgbToHsl(data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0)
        if (l < 0.1 || l > 0.94 || s < 0.12) continue
        const score = s * 1.25 + (1 - Math.abs(l - 0.55) * 2.2) * 0.85
        if (score > bestScore) {
          bestScore = score
          bh = h
          bs = s
          bl = l
        }
      }
      if (bestScore < 0) return fallbackAccent()

      const s = clamp(bs, 0.42, 0.88)
      const l = clamp(bl, 0.34, 0.58)
      const [r, g, b] = hslToRgb(bh, s, l)
      accentTriplet.value = `${r} ${g} ${b}`
    } catch {
      fallbackAccent()
    }
  }
  img.onerror = fallbackAccent
  img.src = imageUrl
}

/* =========================
   🖼 图片双层交叉淡入
========================= */
const bgLayers = ref<[string, string]>(['', ''])
const activeLayer = ref<0 | 1>(0)
const coverLayers = ref<[string, string]>(['', ''])
const activeCover = ref<0 | 1>(0)
let loadToken = 0

function layerStyle(i: 0 | 1) {
  const src = bgLayers.value[i]
  return src ? { backgroundImage: `url(${src})` } : undefined
}
function coverStyle(i: 0 | 1) {
  const src = coverLayers.value[i]
  return src ? { backgroundImage: `url(${src})` } : undefined
}

async function loadImage(url?: string) {
  if (!url) return
  const token = ++loadToken

  let src = url
  if (url.startsWith('http')) {
    try {
      const res = await axios.get(url, { responseType: 'blob' })
      src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(res.data)
      })
    } catch {
      src = url
    }
  }
  if (token !== loadToken) return

  const nextBg: 0 | 1 = activeLayer.value === 0 ? 1 : 0
  const nextCover: 0 | 1 = activeCover.value === 0 ? 1 : 0
  bgLayers.value = { ...bgLayers.value, [nextBg]: src } as [string, string]
  coverLayers.value = { ...coverLayers.value, [nextCover]: src } as [string, string]

  const probe = new Image()
  probe.src = src
  try {
    await probe.decode()
  } catch {
    /* decode 失败仍尝试展示 */
  }
  if (token !== loadToken) return
  await nextTick()
  activeLayer.value = nextBg
  activeCover.value = nextCover

  extractAccent(src)
}

/* =========================
   🎵 歌词动态加载
========================= */
async function loadLyricForCurrentTrack() {
  const track = player.currentTrack.value
  if (!track || !track.id || track.lyric) return
  try {
    const lyricData = await getLyric(track.id)
    const idx = player.playlist.value.findIndex((t) => t.id === track.id)
    if (idx !== -1 && lyricData) player.playlist.value[idx]!.lyric = lyricData
  } catch (error) {
    console.warn(`获取歌曲 ${track.id} 歌词失败:`, error)
  }
}

watch(
  () => player.currentTrack.value?.id,
  () => {
    loadImage(player.currentTrack.value?.picUrl)
    loadLyricForCurrentTrack()
  },
)

/* =========================
   🎧 rAF：视差 + 波形
========================= */
const WAVE_SIZE = 30
const parallaxEl = ref<HTMLElement | null>(null)
const dotEls: (HTMLElement | null)[] = Array(WAVE_SIZE).fill(null)
const lastDotStyle: string[] = Array(WAVE_SIZE).fill('')
let rafId = 0
const pointer = { x: 0, y: 0 }
const drift = { x: 0, y: 0 }

function setDotRef(el: unknown, i: number) {
  dotEls[i] = (el as HTMLElement | null) ?? null
}

function onPointerMove(e: PointerEvent) {
  const r = (e.currentTarget as HTMLElement | null)?.getBoundingClientRect()
  if (!r) return
  pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2
  pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2
}
function onPointerLeave() {
  pointer.x = 0
  pointer.y = 0
}

function getMirrorWave(data: Uint8Array, size: number): number[] {
  const result = new Array(size).fill(0)
  const step = data.length / size
  const center = (size - 1) / 2
  for (let i = 0; i < size; i++) {
    const mirrorIndex = i < center ? i : size - 1 - i
    const v = data[Math.floor(mirrorIndex * step)] ?? 0
    const value = v / 255
    const dist = Math.abs(i - center) / center
    const weight = Math.exp(-dist * dist * 1.5)
    result[i] = Math.pow(value, 1.5) * 0.35 + value * weight * 0.65
  }
  return result
}

function tick() {
  rafId = requestAnimationFrame(tick)

  drift.x += (pointer.x - drift.x) * 0.06
  drift.y += (pointer.y - drift.y) * 0.06
  if (parallaxEl.value) {
    parallaxEl.value.style.transform = `translate3d(${(drift.x * -18).toFixed(2)}px, ${(drift.y * -12).toFixed(2)}px, 0)`
  }

  const vals = getMirrorWave(player.getFrequencyData(), WAVE_SIZE)
  for (let i = 0; i < WAVE_SIZE; i++) {
    const v = vals[i] ?? 0
    const style = `${Math.round((3 + v * 28) * 10) / 10}|${Math.round((0.2 + v * 0.8) * 100) / 100}`
    if (style === lastDotStyle[i]) continue
    lastDotStyle[i] = style
    const el = dotEls[i]
    if (!el) continue
    el.style.width = `${3 + v * 28}px`
    el.style.opacity = String(0.2 + v * 0.8)
  }
}

/* =========================
   生命周期
========================= */
onMounted(() => {
  loadImage(player.currentTrack.value?.picUrl)
  loadLyricForCurrentTrack()
  rafId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})

/* =========================
   关闭（动画由 App.vue 的 <Transition name="slide-up"> 统一处理）
========================= */
function Close() {
  AudioViewShow.value = false
}

/* =========================
   获取播放模式图标
========================= */
function getPlayModeIcon(): string {
  switch (player.playMode.value) {
    case PlayMode.Sequential:
      return 'mdi-repeat-off'
    case PlayMode.Loop:
      return 'mdi-repeat-once'
    case PlayMode.Shuffle:
      return 'mdi-shuffle'
    case PlayMode.ListLoop:
      return 'mdi-repeat'
    default:
      return 'mdi-repeat-off'
  }
}
</script>

<style scoped>
/* =======================
   全屏容器
======================= */
.fullscreen {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: #000;
}

/* =======================
   🌫 分层背景（ambient demo 结构）
======================= */
.bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.bg__parallax {
  position: absolute;
  inset: -6%;
  will-change: transform;
}

.bg__breathe {
  position: absolute;
  inset: 0;
  animation: breathe 26s ease-in-out infinite alternate;
}

@keyframes breathe {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.08);
  }
}

.bg__layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(72px) saturate(1.75) brightness(0.55);
  transform: scale(1.1);
  opacity: 0;
  transition:
    opacity 0.9s ease,
    transform 0.9s ease;
  will-change: opacity, transform;
}

.bg__layer.is-active {
  opacity: 1;
  transform: scale(1);
}

.bg__glow {
  position: absolute;
  inset: -10%;
  mix-blend-mode: screen;
  pointer-events: none;
  background:
    radial-gradient(45% 45% at 28% 30%, rgb(var(--c-main) / 0.6), transparent 70%),
    radial-gradient(50% 50% at 75% 68%, rgb(var(--c-main) / 0.42), transparent 70%);
  transition: background 1.2s linear;
}

.bg__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.25) 35%,
    rgba(0, 0, 0, 0.3) 65%,
    rgba(0, 0, 0, 0.65) 100%
  );
}

.bg__noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.055;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* 顶部按钮 */
.top-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 20;
  backdrop-filter: blur(14px);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
}

.top-btn .v-btn {
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.2s ease;
}

.top-btn .v-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.12);
}

/* 🎵 右上角播放列表按钮 */
.playlist-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 20;
  backdrop-filter: blur(14px);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
}

.playlist-btn .v-btn {
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.2s ease;
}

.playlist-btn .v-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.12);
}

/* 主体 */
.main-row {
  height: 100%;
  position: relative;
  z-index: 1;
}

/* =======================
   🍎 Apple Music 左侧
======================= */
.apple-player-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 13px;
  height: 100%;
  width: 100%;
  padding: 36px;
}

/* 封面：用 clamp 统一替代互相矛盾的媒体查询 */
.apple-cover {
  width: clamp(200px, 26vh, 300px);
  height: clamp(200px, 26vh, 300px);
  max-width: 100%;
  transition: transform 0.3s ease;
}

.apple-cover:hover {
  transform: scale(1.02);
}

.cover-card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.35);
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.45),
    0 10px 30px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.3s ease;
}

.apple-cover:hover .cover-card {
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.55),
    0 15px 40px rgba(0, 0, 0, 0.4);
}

.cover-layer {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: scale(1.06);
  transition:
    opacity 0.7s ease,
    transform 0.7s ease;
}

.cover-layer.is-active {
  opacity: 1;
  transform: scale(1);
}

/* 信息：文字统一白色系 */
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
  color: #ffffff;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
}

.artist-name {
  font-size: 16px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 进度条 */
.apple-progress {
  width: 100%;
}

/* 控制按钮 */
.apple-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;
}

.apple-controls .ctrl-btn {
  color: rgba(255, 255, 255, 0.85);
}

/* 播放键：accent 高亮 + 微光 */
.apple-controls .play-btn {
  color: rgb(var(--c-main));
  filter: drop-shadow(0 0 10px rgb(var(--c-main) / 0.55));
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.apple-controls .v-btn {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  opacity: 0.85;
  transition: opacity 0.3s ease;
}

.apple-volume:hover {
  opacity: 1;
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
  mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 12%,
    black 88%,
    transparent 100%
  );
}

/* =======================
   🎧 波形分割线（accent）
======================= */
.wave-divider {
  width: 36px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 3px;
}

.wave-dot {
  height: 4px;
  width: 3px;
  border-radius: 999px;
  background-color: rgb(var(--c-main));
  box-shadow: 0 0 8px rgb(var(--c-main) / 0.35);
  transition:
    width 0.08s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.08s linear;
  will-change: width, opacity;
}
</style>
