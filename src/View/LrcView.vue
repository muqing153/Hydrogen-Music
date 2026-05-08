<template>
    <VList ref="lrcView" height="100%" width="100%" class="no-scrollbar" @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave" @scroll.passive="onScroll">
        <VCol v-for="(item, index) in lrclsit" :key="index">
            <div class="LrcCard" @click="play(item)" @touchstart="handleTouchStart" @touchend="handleTouchEnd"
                draggable="false">
                <VCol :class="['lrc-line', { active: index === currentIndex }]" draggable="false"
                    :style="{ color: props.themeColor || 'rgba(255, 255, 255, 0.6)' }">
                    <div draggable="false">{{ item.text }}</div>
                    <div v-if="item.ttext" draggable="false">{{ item.ttext }}</div>
                </VCol>
                <VIcon style="width: 24px; height: 24px;" class="hover-icon" draggable="false"
                    :style="{ color: props.themeColor }">
                    mdi-play
                </VIcon>
            </div>
        </VCol>
    </VList>
</template>
<script setup lang="ts">
import { player } from '@/staic';
import { onMounted, ref, watch, onUnmounted } from 'vue';
import { parseNeteaseLyric, type LyricLine } from './LrcTools';

// 🎨 接收父组件传递的主题颜色
const props = defineProps<{
    themeColor?: string
}>()

// player
const lrclsit = ref<LyricLine[]>([])
const currentIndex = ref(0)
const lrcView: any = ref()
const isHover = ref(false)
let lastClick = 0;
let lastClickIS = true

// 📱 移动端触摸相关
const touchStartTime = ref(0)
const touchStartY = ref(0)
const isTouching = ref(false)
function play(item: LyricLine) {
    const now = Date.now();
    // 🎯 防抖处理：300ms 内只响应一次点击
    if (now - lastClick < 300 && lastClickIS) {
        player.seek(item.time)
        lastClickIS = false
        setTimeout(() => { lastClickIS = true }, 1000)
    }
    lastClick = now;
}

// 📱 移动端触摸事件处理
function handleTouchStart(event: TouchEvent) {
    touchStartTime.value = Date.now()
    touchStartY.value = event.touches[0]?.clientY || 0
    isTouching.value = true
}

function handleTouchEnd(event: TouchEvent) {
    const touchEndTime = Date.now()
    const touchEndY = event.changedTouches[0]?.clientY || 0
    const deltaY = Math.abs(touchEndY - touchStartY.value)
    const deltaTime = touchEndTime - touchStartTime.value

    // 🎯 判断是否为有效点击（时间短且移动距离小）
    if (deltaTime < 300 && deltaY < 10) {
        // 找到对应的歌词项并播放
        const card = (event.target as HTMLElement).closest('.LrcCard')
        if (card) {
            const wrapper = card.closest('.lrc-item-wrapper')
            if (wrapper) {
                const index = Array.from(wrapper.parentElement?.children || []).indexOf(wrapper)
                if (index !== -1 && lrclsit.value[index]) {
                    play(lrclsit.value[index]!)
                }
            }
        }
    }

    isTouching.value = false
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
    () => player.currentTrack.value?.lyric,
    (lyric) => {
        if (!lyric) {
            lrclsit.value = []
            return
        }

        const lrcText = lyric.lrc?.lyric
        const tText = lyric.tlyric?.lyric

        if (!lrcText) {
            lrclsit.value = []
            return
        }

        lrclsit.value = parseNeteaseLyric(lrcText, tText)
    },
    { immediate: true, deep: true }
)
// window.lrclist = lrclsit

// 🎵 优化的二分查找算法 - 快速定位当前歌词索引
function findCurrentLyricIndex(currentTime: number, list: LyricLine[]): number {
    if (!list.length) return 0

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

// 🎵 节流函数 - 限制执行频率
function throttle<T extends (...args: any[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle = false
    return function (...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => { inThrottle = false }, limit)
        }
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

    // 📱 标记用户交互的函数
    const markUser = () => { lastUserInteraction = Date.now() }

    // 📱 监听用户交互事件
    el?.addEventListener('wheel', markUser, { passive: true })
    el?.addEventListener('touchstart', markUser, { passive: true })
    el?.addEventListener('pointerdown', markUser, { passive: true })
    window.addEventListener('keydown', markUser, { passive: true })
})

// 🧹 组件卸载时清理事件监听器
onUnmounted(() => {
    const el = lrcView.value?.$el ?? lrcView.value

    // 📱 标记用户交互的函数（需要重新定义以用于移除）
    const markUser = () => { lastUserInteraction = Date.now() }

    if (el) {
        el.removeEventListener('wheel', markUser)
        el.removeEventListener('touchstart', markUser)
        el.removeEventListener('pointerdown', markUser)
    }
    window.removeEventListener('keydown', markUser)

    // 清理定时器
    if (scrollTimeout) clearTimeout(scrollTimeout)
    if (scrollAnimationId !== null) cancelAnimationFrame(scrollAnimationId)
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

    // 📱 根据设备类型调整滚动位置
    const isMobile = window.innerWidth <= 768
    const offsetTop = target.offsetTop
    const firstChild = children[0] as HTMLElement
    const lineHeight = firstChild ? firstChild.offsetHeight : (isMobile ? 70 : 80)

    // 🎯 移动端：保持在中间位置；桌面端：保持在第二行
    const secondLinePosition = isMobile ? lineHeight * 1.5 : lineHeight + 8
    const targetScrollTop = Math.max(0, offsetTop - secondLinePosition)

    // 取消之前的动画帧
    if (scrollAnimationId !== null) {
        cancelAnimationFrame(scrollAnimationId)
    }

    // 🚀 使用自定义缓动动画实现更流畅的滚动
    const startScrollTop = el.scrollTop
    const distance = targetScrollTop - startScrollTop
    const duration = isMobile ? 300 : 400 // 移动端更快
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
    line-height: 1.4;
    will-change: font-size, opacity, filter;
    /* 📱 优化移动端触摸反馈 */
    -webkit-tap-highlight-color: transparent;
}

.lrc-line.active {
    font-size: 36px;
    opacity: 1;
    /* 🎨 使用内联样式中的主题颜色，这里作为备选 */
    filter: blur(0px);
    font-weight: 600;
    text-shadow:
        0 0 20px rgba(255, 255, 255, 0.3),
        0 0 40px rgba(255, 255, 255, 0.1),
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
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    will-change: transform, background-color;
    /* 禁止拖拽 */
    -webkit-user-drag: none;
    user-drag: none;
    /* 📱 优化移动端触摸反馈 */
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
}

.LrcCard:hover {
    border-radius: 16px;
    background-color: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

/* 📱 移动端触摸激活状态 */
.LrcCard:active {
    background-color: rgba(255, 255, 255, 0.08);
    transform: scale(0.98);
}

/* 默认隐藏图标 */
.LrcCard .hover-icon {
    opacity: 0;
    margin-right: 3px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(0.8);
    color: #ffffff;
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

/* =======================
   📱 移动端响应式优化
======================= */
@media (max-width: 768px) {
    .lrc-line {
        font-size: 20px;
        line-height: 1.4;
    }

    .lrc-line.active {
        font-size: 28px;
    }

    .LrcCard {
        padding: 0;
        margin: 0;
    }

    /* 📱 移动端隐藏 hover 图标，改用触摸反馈 */
    .LrcCard .hover-icon {
        display: none;
    }

    /* 🎵 翻译歌词字体调整 */
    .lrc-line div:last-child {
        font-size: 0.7em;
        margin-top: 3px;
    }
}

/* 📱 小屏幕设备进一步优化 */
@media (max-width: 480px) {
    .lrc-line {
        font-size: 18px;
    }

    .lrc-line.active {
        font-size: 24px;
    }

}
</style>