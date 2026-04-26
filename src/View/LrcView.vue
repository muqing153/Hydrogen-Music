<template>
    <VList ref="lrcView" height="100%" width="100%" class="no-scrollbar" @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave" @scroll.passive="onScroll">
        <VCol v-for="(item, index) in lrclsit" :key="index">
            <div class="LrcCard" @click="play(item)">
                <VCol :class="['lrc-line', { active: index === currentIndex }]">
                    <div>{{ item.text }}</div>
                    <div>{{ item.ttext }}</div>
                </VCol>
                <VIcon style="width: 24px; height: 24px;" class="hover-icon">
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
        console.log("双击触发！" + item.time);
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
// 监听播放时间变化 → 找到对应的歌词行
watch(player.currentTime, () => {
    const list = lrclsit.value
    // 处理没有歌词的情况
    if (!list.length) return

    for (let i = 0; i < list.length; i++) {
        if (player.currentTime.value < list[i]!.time) {
            currentIndex.value = Math.max(i - 1, 0)
            scrollToCurrent()
            return
        }
    }

    // ⭐ 播放时间超过最后一句 → 显示最后一句
    currentIndex.value = list.length - 1
    scrollToCurrent()
})

// 状态
const isUserScrolling = ref(false)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null
let lastUserInteraction = 0      // 毫秒时间戳
const USER_INTERACTION_THRESHOLD = 1900 // ms，1s 内视为用户滚动
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
    if (isUserScrolling.value) return

    const el = lrcView.value?.$el
    if (!el) return

    const children = el.querySelectorAll('.LrcCard')
    const target = children[currentIndex.value] as HTMLElement

    if (!target) return

    const containerHeight = el.clientHeight
    const offsetTop = target.offsetTop

    el.scrollTo({
        top: offsetTop - containerHeight / 2,
        behavior: 'smooth'
    })
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
    /* 不可复制 */
    -webkit-user-select: none;
    font-size: 26px;
    opacity: 0.5;
    transition: font-size 0.35s cubic-bezier(.4, 0, .2, 1),
        opacity 0.35s cubic-bezier(.4, 0, .2, 1),
        transform 0.35s cubic-bezier(.4, 0, .2, 1);
}

.lrc-line.active {
    font-size: 56px;
    opacity: 1;
}

.LrcCard {
    /* 默认状态不应用任何特殊样式 */
    display: flex;
    /* 水平布局 */
    justify-content: space-between;
    /* 垂直居中 */
    align-items: center;
}

.LrcCard:hover {
    border-radius: 16px;
    background-color: rgba(255, 255, 255, 0.1);
}

/* 默认隐藏图标 */
.LrcCard .hover-icon {
    opacity: 0;
    margin-right: 3px;
    transition: 0.2s;
}

/* 当 .LrcCard 被 hover 时显示图标 */
.LrcCard:hover .hover-icon {
    opacity: 1;
}
</style>