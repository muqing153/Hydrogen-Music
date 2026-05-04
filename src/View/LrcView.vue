<template>
    <VList ref="lrcView" height="100%" width="100%" class="no-scrollbar" @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave" @scroll.passive="onScroll">
        <VCol v-for="(item, index) in lrclsit" :key="index">
            <div class="LrcCard" @click="play(item)" draggable="false">
                <VCol :class="['lrc-line', { active: index === currentIndex }]" draggable="false">
                    <div draggable="false">{{ item.text }}</div>
                    <div draggable="false">{{ item.ttext }}</div>
                </VCol>
                <VIcon style="width: 24px; height: 24px;" class="hover-icon" draggable="false">
                    mdi-play
                </VIcon>

            </div>
        </VCol>
    </VList>
</template>
<script setup lang="ts">
import { player } from '@/staic';
import { onMounted, ref, watch } from 'vue';
import { parseNeteaseLyric, type LyricLine } from './LrcTools';
// player
const lrclsit = ref<LyricLine[]>([])
const currentIndex = ref(0)
const lrcView: any = ref()
const isHover = ref(false)
let lastClick = 0;
let lastClickIS = true
function play(item: LyricLine) {
    const now = Date.now();
    if (now - lastClick < 300 && lastClickIS) {
        // 🎵 在这里写你的播放逻辑
        player.seek(item.time)
        lastClickIS = false
        setTimeout(() => { lastClickIS = true }, 1000)
    }
    lastClick = now;
}

function lrc() {
    const value = player.currentTrack.value

    const lrcText = value?.lyric?.lrc?.lyric
    const tlyricText = value?.lyric?.tlyric?.lyric

    if (!lrcText) {
        lrclsit.value = []
        return
    }

    lrclsit.value = parseNeteaseLyric(lrcText, tlyricText)
}
function lrcNull() {
    lrclsit.value = [{
        time: 0,
        text: '暂无歌词'
    }]
}
watch(
    () => player.currentTrack.value,
    (track) => {
        if (!track?.lyric) {
            lrclsit.value = []
            return
        }

        const lrcText = track.lyric?.lrc?.lyric
        const tText = track.lyric?.tlyric?.lyric

        if (!lrcText) {
            lrclsit.value = []
            return
        }

        lrclsit.value = parseNeteaseLyric(lrcText, tText)
    },
    { immediate: true }
)
// window.lrclist = lrclsit

// 🎵 优化的二分查找算法 - 快速定位当前歌词索引
function findCurrentLyricIndex(currentTime: number, list: LyricLine[]): number {
    let left = 0
    let right = list.length - 1

    // 边界检查
    if (currentTime < list[0]!.time) return 0
    if (currentTime >= list[right]!.time) return right

    // 二分查找
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

// 🎵 防抖函数 - 避免频繁触发滚动
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return function (...args: Parameters<T>) {
        if (timeout !== null) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

// 🎵 缓存 DOM 元素引用，避免重复查询
let cachedChildren: HTMLElement[] = []
let lastListLength = 0

// 监听播放时间变化 → 找到对应的歌词行（使用二分查找优化）
watch(player.currentTime, () => {
    const list = lrclsit.value
    // 处理没有歌词的情况
    if (!list.length) return

    // 🎵 使用二分查找替代线性遍历，时间复杂度从 O(n) 降到 O(log n)
    const newIndex = findCurrentLyricIndex(player.currentTime.value, list)

    // 🎵 只有当索引真正变化时才更新和滚动
    if (newIndex !== currentIndex.value) {
        currentIndex.value = newIndex
        debouncedScrollToCurrent()
    }
})

// 🎵 创建防抖版本的滚动函数（100ms 防抖）
const debouncedScrollToCurrent = debounce(() => {
    scrollToCurrent()
}, 50)

// 状态
const isUserScrolling = ref(false)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null
let lastUserInteraction = 0      // 毫秒时间戳
const USER_INTERACTION_THRESHOLD = 1900 // ms，1.9s 内视为用户滚动
let scrollAnimationId: number | null = null

onMounted(() => {
    const el = lrcView.value?.$el ?? lrcView.value
    const markUser = () => { lastUserInteraction = Date.now() }

    // 推荐在 list 容器上监听（如果移动端要支持 touch）
    el?.addEventListener('wheel', markUser, { passive: true })
    el?.addEventListener('touchstart', markUser, { passive: true })
    el?.addEventListener('pointerdown', markUser, { passive: true })
    // 可选，键盘控制也认为是用户交互
    window.addEventListener('keydown', markUser, { passive: true })
})
// onScroll 只在被认为是用户滚动时生效
function onScroll() {
    if (!isHover.value) return

    // 如果最近有用户交互（例如 wheel/touchstart），则认为是用户滚动
    const now = Date.now()
    const isRecentUser = (now - lastUserInteraction) < USER_INTERACTION_THRESHOLD

    if (!isRecentUser) {
        isUserScrolling.value = false
        // 非用户触发的 scroll（程序滚动） → 忽略
        return
    }

    // 真正的用户滚动行为
    isUserScrolling.value = true
    if (scrollTimeout) clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => { isUserScrolling.value = false }, 1500)
}

function onMouseEnter() { isHover.value = true }
function onMouseLeave() { isHover.value = false; isUserScrolling.value = false }
// 🎵 优化的自动滚动函数 - 使用 requestAnimationFrame 实现更流畅的滚动
function scrollToCurrent() {
    if (isUserScrolling.value) return

    const el = lrcView.value?.$el
    if (!el) return

    const children = el.querySelectorAll('.LrcCard')
    const target = children[currentIndex.value] as HTMLElement

    if (!target) return

    // 🎵 让当前歌词保持在第二行位置（显示上一句和下一句）
    const offsetTop = target.offsetTop
    const firstChild = children[0] as HTMLElement
    const lineHeight = firstChild ? firstChild.offsetHeight : 80 // 获取单行高度

    // 计算第二行的位置：第一行高度 + 间距
    const secondLinePosition = lineHeight + 8 // 8px 是 margin 间距
    const targetScrollTop = Math.max(0, offsetTop - secondLinePosition)

    // 取消之前的动画帧
    if (scrollAnimationId !== null) {
        cancelAnimationFrame(scrollAnimationId)
    }

    // 使用自定义缓动动画实现更流畅的滚动
    const startScrollTop = el.scrollTop
    const distance = targetScrollTop - startScrollTop
    const duration = 400 // 动画持续时间（毫秒）
    const startTime = performance.now()

    // 缓动函数 - cubic-bezier(0.4, 0, 0.2, 1) 的近似实现
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

.lrc-line {
    /* 不可复制 */
    -webkit-user-select: none;
    user-select: none;
    /* 禁止拖拽 */
    -webkit-user-drag: none;
    user-drag: none;
    font-size: 26px;
    opacity: 0.4;
    color: rgba(255, 255, 255, 0.6);
    transition:
        font-size 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        filter 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        text-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        letter-spacing 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: blur(1px);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1.6;
    will-change: font-size, opacity, filter;
}

.lrc-line.active {
    font-size: 36px;
    opacity: 1;
    color: #ffffff;
    filter: blur(0px);
    font-weight: 600;
    text-shadow:
        0 0 20px rgba(255, 255, 255, 0.5),
        0 0 40px rgba(255, 255, 255, 0.3),
        0 4px 8px rgba(0, 0, 0, 0.4);
    letter-spacing: 0.5px;
}

.LrcCard {
    /* 默认状态不应用任何特殊样式 */
    display: flex;
    /* 水平布局 */
    justify-content: space-between;
    /* 垂直居中 */
    align-items: center;
    padding: 12px 16px;
    margin: 8px 0;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    will-change: transform, background-color;
    /* 禁止拖拽 */
    -webkit-user-drag: none;
    user-drag: none;
}

.LrcCard:hover {
    border-radius: 16px;
    background-color: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

/* 默认隐藏图标 */
.LrcCard .hover-icon {
    opacity: 0;
    margin-right: 3px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(0.8);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* 当 .LrcCard 被 hover 时显示图标 */
.LrcCard:hover .hover-icon {
    opacity: 1;
    transform: scale(1);
}

/* 🎵 翻译歌词样式优化 */
.lrc-line div:first-child {
    font-weight: 500;
}

.lrc-line div:last-child {
    font-size: 0.75em;
    opacity: 0.7;
    margin-top: 4px;
    font-style: italic;
}

.lrc-line.active div:last-child {
    opacity: 0.85;
    font-style: normal;
}
</style>