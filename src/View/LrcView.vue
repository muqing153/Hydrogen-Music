<template>
  <VList
    ref="lrcView"
    height="100%"
    width="100%"
    class="no-scrollbar"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @scroll.passive="onScroll"
  >
    <div v-if="!lrclsit.length" class="lrc-empty">暂无歌词</div>
    <VCol v-for="(item, index) in lrclsit" :key="index">
      <div class="LrcCard" @click="play(item)" draggable="false">
        <VCol :class="['lrc-line', { active: index === currentIndex }]" draggable="false">
          <!-- 逐字歌词（仅当前行） -->
          <template v-if="index === currentIndex && karaokeSegs">
            <span v-for="(seg, si) in karaokeSegs" :key="si" :class="{ sung: isSung(seg) }">{{
              seg.text
            }}</span>
          </template>
          <div v-else class="lrc-main" draggable="false">{{ item.text }}</div>
          <div v-if="item.ttext" class="lrc-sub" draggable="false">{{ item.ttext }}</div>
          <div v-else-if="item.rtext" class="lrc-sub lrc-roma" draggable="false">
            {{ item.rtext }}
          </div>
        </VCol>
        <VIcon
          style="width: 24px; height: 24px"
          class="hover-icon"
          draggable="false"
          @click.stop="play(item)"
        >
          mdi-play
        </VIcon>
      </div>
    </VCol>
  </VList>
</template>
<script setup lang="ts">
import { player } from '@/staic'
import { onMounted, ref, watch, onUnmounted, computed } from 'vue'
import { parseNeteaseLyric, type LyricLine, type YrcWord } from './LrcTools'

defineProps<{
  themeColor?: string
}>()

// player
const lrclsit = ref<LyricLine[]>([])
const currentIndex = ref(0)
const lrcView: any = ref()
const isHover = ref(false)

interface KaraSeg {
  text: string
  word?: YrcWord
}

const karaokeCache = new Map<LyricLine, KaraSeg[] | null>()

/* =========================
   单击歌词行 → seek
========================= */
function play(item: LyricLine) {
  player.seek(item.time)
}

/* =========================
   歌词解析
========================= */
watch(
  () => player.currentTrack.value?.lyric,
  (lyric) => {
    if (!lyric) {
      lrclsit.value = []
      return
    }

    const lrcText = lyric.lrc?.lyric
    if (!lrcText) {
      lrclsit.value = []
      return
    }

    lrclsit.value = parseNeteaseLyric(
      lrcText,
      lyric.tlyric?.lyric,
      lyric.romalrc?.lyric,
      lyric.yrc?.lyric,
      lyric.ytlrc?.lyric,
      lyric.yromalrc?.lyric,
    )
    karaokeCache.clear()
  },
  { immediate: true, deep: true },
)

/* =========================
   🎤 逐字歌词：把 yrcWords 对齐到 item.text（重建词间空格）
========================= */
function buildKaraoke(line: LyricLine): KaraSeg[] | null {
  const cached = karaokeCache.get(line)
  if (cached !== undefined) return cached

  const words = line.yrcWords
  if (!words || !words.length) {
    karaokeCache.set(line, null)
    return null
  }

  const segs: KaraSeg[] = []
  let cursor = 0
  let prev: YrcWord | undefined
  for (const w of words) {
    const idx = line.text.indexOf(w.word, cursor)
    if (idx === -1) {
      // 对不上 → 回退纯文本
      karaokeCache.set(line, null)
      return null
    }
    if (idx > cursor) segs.push({ text: line.text.slice(cursor, idx), word: w })
    segs.push({ text: line.text.slice(idx, idx + w.word.length), word: w })
    prev = w
    cursor = idx + w.word.length
  }
  if (cursor < line.text.length) segs.push({ text: line.text.slice(cursor), word: prev })

  karaokeCache.set(line, segs)
  return segs
}

const karaokeSegs = computed(() => {
  const line = lrclsit.value[currentIndex.value]
  return line ? buildKaraoke(line) : null
})

function isSung(seg: KaraSeg): boolean {
  if (!seg.word) return true
  return player.currentTime.value >= seg.word.startTime
}

/* =========================
   🎵 二分查找当前歌词索引
========================= */
function findCurrentLyricIndex(currentTime: number, list: LyricLine[]): number {
  if (!list.length) return 0

  let left = 0
  let right = list.length - 1

  if (currentTime < list[0]!.time) return 0
  if (currentTime >= list[right]!.time) return right

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const midTime = list[mid]!.time

    if (midTime <= currentTime && (mid === list.length - 1 || list[mid + 1]!.time > currentTime)) {
      return mid
    } else if (midTime > currentTime) {
      right = mid - 1
    } else {
      left = mid + 1
    }
  }

  return left
}

// 🎵 防抖 - 避免频繁触发滚动
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (...args: Parameters<T>) {
    if (timeout !== null) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 监听播放时间变化 → 定位歌词行
watch(player.currentTime, () => {
  const list = lrclsit.value
  if (!list.length) return

  const newIndex = findCurrentLyricIndex(player.currentTime.value, list)
  if (newIndex !== currentIndex.value) {
    currentIndex.value = newIndex
    debouncedScrollToCurrent()
  }
})

const debouncedScrollToCurrent = debounce(() => {
  scrollToCurrent()
}, 50)

// 状态
const isUserScrolling = ref(false)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null
let lastUserInteraction = 0
const USER_INTERACTION_THRESHOLD = 1900 // ms
let scrollAnimationId: number | null = null

function markUser() {
  lastUserInteraction = Date.now()
}

onMounted(() => {
  const el = lrcView.value?.$el ?? lrcView.value
  el?.addEventListener('wheel', markUser, { passive: true })
  el?.addEventListener('pointerdown', markUser, { passive: true })
  window.addEventListener('keydown', markUser, { passive: true })
})

onUnmounted(() => {
  const el = lrcView.value?.$el ?? lrcView.value
  el?.removeEventListener('wheel', markUser)
  el?.removeEventListener('pointerdown', markUser)
  window.removeEventListener('keydown', markUser)

  if (scrollTimeout) clearTimeout(scrollTimeout)
  if (scrollAnimationId !== null) cancelAnimationFrame(scrollAnimationId)
})

function onScroll() {
  if (!isHover.value) return

  const now = Date.now()
  const isRecentUser = now - lastUserInteraction < USER_INTERACTION_THRESHOLD

  if (!isRecentUser) {
    isUserScrolling.value = false
    return
  }

  isUserScrolling.value = true
  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    isUserScrolling.value = false
  }, 1500)
}

function onMouseEnter() {
  isHover.value = true
}
function onMouseLeave() {
  isHover.value = false
  isUserScrolling.value = false
}

// 🎵 rAF 平滑滚动到当前歌词
function scrollToCurrent() {
  if (isUserScrolling.value) return

  const el = lrcView.value?.$el
  if (!el) return

  const children = el.querySelectorAll('.LrcCard')
  const target = children[currentIndex.value] as HTMLElement
  if (!target) return

  const offsetTop = target.offsetTop
  const firstChild = children[0] as HTMLElement
  const lineHeight = firstChild ? firstChild.offsetHeight : 80

  const secondLinePosition = lineHeight + 8
  const targetScrollTop = Math.max(0, offsetTop - secondLinePosition)

  if (scrollAnimationId !== null) {
    cancelAnimationFrame(scrollAnimationId)
  }

  const startScrollTop = el.scrollTop
  const distance = targetScrollTop - startScrollTop
  const duration = 400
  const startTime = performance.now()

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeInOutCubic(progress)

    el.scrollTop = startScrollTop + distance * easedProgress

    if (progress < 1) {
      scrollAnimationId = requestAnimationFrame(animate)
    } else {
      scrollAnimationId = null
    }
  }

  scrollAnimationId = requestAnimationFrame(animate)
}
</script>
<style scoped>
.no-scrollbar {
  overflow-y: auto;
  scrollbar-width: none;
  background-color: transparent;
  /* Firefox */
  position: relative;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
  /* Chrome / Edge / Safari */
}

.lrc-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.45);
  font-size: 22px;
  letter-spacing: 2px;
  user-select: none;
}

.lrc-line {
  -webkit-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  user-drag: none;
  font-size: 26px;
  opacity: 0.4;
  color: rgba(255, 255, 255, 0.75);
  transition:
    font-size 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    text-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    letter-spacing 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: blur(1px);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.4;
  will-change: font-size, opacity, filter;
}

.lrc-line.active {
  font-size: 36px;
  opacity: 1;
  filter: blur(0px);
  font-weight: 600;
  color: #ffffff;
  text-shadow:
    0 0 20px rgb(var(--c-main) / 0.55),
    0 0 44px rgb(var(--c-main) / 0.25),
    0 4px 8px rgba(0, 0, 0, 0.4);
  letter-spacing: 0.5px;
}

/* 🎤 逐字高亮：已唱部分用 accent，未唱部分压暗 */
.lrc-line.active span {
  color: rgba(255, 255, 255, 0.35);
  transition: color 0.25s linear;
}

.lrc-line.active span.sung {
  color: rgb(var(--c-main));
  text-shadow: 0 0 18px rgb(var(--c-main) / 0.45);
}

.LrcCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  will-change: transform, background-color;
  -webkit-user-drag: none;
  user-drag: none;
  cursor: pointer;
}

.LrcCard:hover {
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.LrcCard:active {
  background-color: rgba(255, 255, 255, 0.08);
  transform: scale(0.98);
}

.LrcCard .hover-icon {
  opacity: 0;
  margin-right: 3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(0.8);
  color: rgb(var(--c-main));
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.LrcCard:hover .hover-icon {
  opacity: 1;
  transform: scale(1);
}

/* 原文行 */
.lrc-line > div.lrc-main {
  font-weight: 500;
}

/* 翻译/罗马音副行（修复 div:last-child 误伤单行歌词的 bug） */
.lrc-line .lrc-sub {
  font-size: 0.75em;
  opacity: 0.7;
  margin-top: 4px;
  font-style: normal;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  transition:
    color 0.3s ease,
    opacity 0.3s ease;
}

.lrc-line .lrc-roma {
  font-style: italic;
  opacity: 0.55;
}

.lrc-line.active .lrc-sub {
  opacity: 0.85;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
}

.lrc-line.active .lrc-roma {
  opacity: 0.65;
}
</style>
