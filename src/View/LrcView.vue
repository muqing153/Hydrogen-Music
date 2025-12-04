<template>
    <VList ref="lrcView" height="100%" width="100%" class="no-scrollbar" @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave" @scroll.passive="onScroll">
        <VCol v-for="(item, index) in lrclsit" :key="index" :class="['lrc-line', { active: index === currentIndex }]">
            <div>{{ item.text }}</div>
        </VCol>
        <VCol class="pa-3" v-if="lrclsit.length < 1">
            <div class="text-center " style="font-size: 23px;">暂无歌词</div>
        </VCol>
    </VList>
</template>
<script setup lang="ts">
import type { AudioPlayer } from '@/player';
import { getCurrentInstance, onMounted, ref, watch } from 'vue';

const global = getCurrentInstance()!.appContext.config.globalProperties
const player = global.$player as AudioPlayer;
const lrclsit: any = ref([])
const reg = /\[(\d{2}):(\d{2})\.(\d{2,3})(?:-\d+)?\]/
// defineExpose({ load, lrc })
const currentIndex = ref(0)
const lrcView: any = ref()
const isHover = ref(false)
function lrc() {
    console.log('UI')

    const value = player.currentTrack.value
    if (!value) return
    const lyric = value?.lyric.lrc.lyric
    const lines = lyric.split('\n')
    lrclsit.value = []

    lines.forEach((line: string) => {
        const match: any = line.match(reg)
        if (!match) return

        const text = line.replace(reg, '').trim()
        if (!text) return
        const min = Number(match[1])
        const sec = Number(match[2])
        const ms = Number(match[3]) / (match[3].length === 3 ? 1000 : 100)

        lrclsit.value.push({
            time: match[0],
            seconds: min * 60 + sec + ms,
            text,
        })
    })
}
lrc()
watch(() => player.currentTrack.value, () => {
    lrc()
})
// window.lrclist = lrclsit
// 监听播放时间变化 → 找到对应的歌词行
watch(player.currentTime, () => {
    for (let i = 0; i < lrclsit.value.length; i++) {
        if (player.currentTime.value <= lrclsit.value[i].seconds) {
            currentIndex.value = Math.max(i - 1, 0)
            // scrollToCurrent()
            break
        }
    }
})
// 状态
const isUserScrolling = ref(false)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null
let lastUserInteraction = 0      // 毫秒时间戳
const USER_INTERACTION_THRESHOLD = 1000 // ms，1s 内视为用户滚动
let isAutoScrolling = false
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

    console.log('用户滚动')
    // 真正的用户滚动行为
    isUserScrolling.value = true
    if (scrollTimeout) clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => { isUserScrolling.value = false }, 1500)
}

function onMouseEnter() { isHover.value = true }
function onMouseLeave() { isHover.value = false; isUserScrolling.value = false }
// 自动滚动
function scrollToCurrent() {
    const list = lrcView.value?.$el
    const activeLine = list?.querySelector('.active')
    // console.log(isHover)
    if (!isUserScrolling.value) {
        activeLine?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
}
</script>
<style scoped>
.no-scrollbar {
    overflow-y: auto;
    scrollbar-width: none;
    background-color: transparent;
    /* Firefox */
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
    /* Chrome / Edge / Safari */
}

.lrc-line {
    font-size: 16px;
    opacity: 0.5;
    transition: font-size 0.35s cubic-bezier(.4, 0, .2, 1),
        opacity 0.35s cubic-bezier(.4, 0, .2, 1),
        transform 0.35s cubic-bezier(.4, 0, .2, 1);
}

.lrc-line.active {
    font-size: 23px;
    opacity: 1;
    transform: translateX(0);
}
</style>