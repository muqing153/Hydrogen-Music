<template>
    <v-col>
        <!-- 页面标题 -->
        <v-card-title class="text-h5 font-weight-bold" style="flex-shrink: 0;">
            <v-icon start>mdi-magnify</v-icon>
            搜索
        </v-card-title>
        <v-divider class="mb-4" style="flex-shrink: 0;"></v-divider>

        <!-- 搜索栏 -->
        <v-card class="search-header mb-6" elevation="2" style="flex-shrink: 0;">
            <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="搜索歌曲、歌手、专辑" variant="outlined"
                density="comfortable" clearable @keyup.enter="handleSearch" @click:clear="clearSearch" @input="onInput"
                @focus="onFocus" autofocus hide-details class="search-input" ref="searchFieldRef">
                <!-- 搜索建议菜单 -->
                <template v-slot:append-inner v-if="suggestions.length > 0">
                    <v-btn icon="mdi-close" size="x-small" variant="text" @click="closeSuggestions"></v-btn>
                </template>
            </v-text-field>

            <!-- 搜索建议下拉菜单 -->
            <v-menu v-model="showSuggestions" :close-on-content-click="false" location="bottom center" offset="5"
                max-height="300" max-width="600" scroll-strategy="close" activator="parent"
                transition="slide-y-transition">
                <v-list class="suggestion-list" density="compact">
                    <v-list-subheader v-if="suggestions.length > 0">
                        <v-icon start size="small">mdi-lightbulb-outline</v-icon>
                        搜索建议
                    </v-list-subheader>
                    <v-list-item v-for="(item, index) in suggestions" :key="index"
                        @click="selectSuggestion(item.keyword)">
                        <template v-slot:prepend>
                            <v-icon size="small" color="grey">mdi-magnify</v-icon>
                        </template>
                        <v-list-item-title v-html="highlightMatch(item.keyword, searchQuery)"></v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-card>
        <!-- 搜索历史 -->
        <v-card v-if="!searched && searchHistory.length > 0" class="history-search mb-6" elevation="1">
            <v-card-title class="text-subtitle-1 py-3 d-flex align-center justify-space-between">
                <span>
                    <v-icon start>mdi-history</v-icon>
                    搜索历史
                </span>
                <v-btn size="small" variant="text" prepend-icon="mdi-delete-outline" @click="clearHistory">
                    清空
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <div class="hot-tags">
                    <v-chip v-for="(keyword, index) in searchHistory" :key="index" class="ma-1" variant="outlined"
                        clickable size="small" @click="searchWithTag(keyword)">
                        <v-icon start size="x-small">mdi-clock-outline</v-icon>
                        {{ keyword }}
                    </v-chip>
                </div>
            </v-card-text>
        </v-card>
        <!-- 热门搜索 -->
        <v-card v-if="!searched" class="hot-search mb-6" elevation="1">
            <v-card-title class="text-subtitle-1 py-3">
                <v-icon start color="error">mdi-fire</v-icon>
                热门搜索
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <div class="hot-tags">
                    <v-chip v-for="(tag, index) in hotTagsList" :key="index" class="ma-1" variant="tonal" clickable
                        size="small" @click="searchWithTag(tag.searchWord)">
                        <v-icon start size="x-small" color="error">mdi-fire</v-icon>
                        {{ tag.searchWord }}
                    </v-chip>
                </div>
            </v-card-text>
        </v-card>

        <!-- 搜索结果 -->
        <v-card v-if="searchResults.length > 0" class="results-container" elevation="1">
            <v-card-title class="d-flex align-center justify-space-between py-3">
                <span class="text-subtitle-1">
                    <v-icon start>mdi-music-note</v-icon>
                    搜索结果
                </span>
                <v-chip size="small" variant="tonal">
                    {{ total }} 首
                </v-chip>
            </v-card-title>
            <v-divider></v-divider>

            <!-- 搜索关键词标签 -->
            <v-card-text v-if="searchQuery" class="pb-0">
                <v-chip size="small" variant="outlined" prepend-icon="mdi-magnify">
                    {{ searchQuery }}
                </v-chip>
            </v-card-text>

            <v-list lines="two" class="pa-2" ref="resultsListRef">
                <v-list-item v-for="(item, index) in searchResults" :key="index" class="result-item"
                    @click="playTrack(item)">
                    <template v-slot:prepend>
                        <v-avatar size="56" rounded="lg">
                            <v-img :src="item.al?.picUrl || item.album?.picUrl" cover>
                                <template v-slot:placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-icon color="grey-lighten-2" size="large">mdi-music-note</v-icon>
                                    </div>
                                </template>
                            </v-img>
                        </v-avatar>
                    </template>

                    <v-list-item-title class="font-weight-medium text-body-1">
                        {{ item.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle class="mt-1">
                        <span class="text-truncate">
                            <v-icon size="x-small" class="mr-1">mdi-account-music</v-icon>
                            {{item.ar?.map((a: any) => a.name).join(' / ') || item.artists?.map((a: any) =>
                                a.name).join(' / ')}}
                        </span>
                        <br v-if="item.al?.name || item.album?.name" />
                        <v-chip v-if="item.al?.name || item.album?.name" size="x-small" class="mt-1" variant="tonal">
                            <v-icon start size="x-small">mdi-album</v-icon>
                            {{ item.al?.name || item.album?.name }}
                        </v-chip>
                    </v-list-item-subtitle>

                    <template v-slot:append>
                        <v-btn icon="mdi-play-circle" size="large" variant="text"
                            @click.stop="playTrack(item)" />
                    </template>
                </v-list-item>
            </v-list>

            <!-- 加载更多提示 -->
            <div v-if="hasMore && !loading" class="text-center pa-4 text-caption text-medium-emphasis">
                向下滚动加载更多...
            </div>
            <div v-if="loading" class="d-flex justify-center pa-4">
                <v-progress-circular indeterminate size="32" width="3"></v-progress-circular>
            </div>
            <div v-if="!hasMore && searchResults.length > 0" class="text-center pa-4 text-caption text-medium-emphasis">
                已加载全部结果
            </div>
        </v-card>

        <!-- 空状态 -->
        <v-empty-state v-if="searched && !loading && searchResults.length === 0" icon="mdi-music-off" title="未找到相关结果"
            :text="`没有找到与「${searchQuery}」相关的内容`" class="empty-state">
            <template v-slot:actions>
                <v-btn variant="tonal" prepend-icon="mdi-close" @click="clearSearch">
                    清除搜索
                </v-btn>
            </template>
        </v-empty-state>

        <!-- 初始状态提示 -->
        <v-empty-state v-if="!searched" icon="mdi-magnify" title="搜索音乐" text="输入歌曲名、歌手或专辑开始搜索" class="empty-state">
        </v-empty-state>

        <!-- 加载状态 -->
        <div v-if="loading && searchResults.length === 0" class="d-flex justify-center align-center pa-16">
            <v-progress-circular indeterminate size="64" width="6"></v-progress-circular>
        </div>
    </v-col>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import * as api from '../api'
import { player } from '@/staic'

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const loading = ref(false)
const searched = ref(false)
const offset = ref(0)
const hasMore = ref(true)
const total = ref(0)

// 搜索建议
const suggestions = ref<any[]>([])
const showSuggestions = ref(false)
let debounceTimer: any = null

// 热门搜索列表
const hotTagsList = ref<any[]>([])

// 搜索历史
const searchHistory = ref<string[]>([])
const MAX_HISTORY = 10 // 最多保存10条历史记录

// 加载热门搜索和搜索历史
async function loadHotSearch() {
    try {
        const res = await api.searchHot()
        if (res.data && res.data.length > 0) {
            hotTagsList.value = res.data.slice(0, 10) // 只显示前10个
        }
    } catch (error) {
        console.error('加载热门搜索失败:', error)
    }
}

async function handleSearch() {
    if (!searchQuery.value.trim()) return

    // 关闭建议菜单
    closeSuggestions()

    loading.value = true
    searched.value = true
    offset.value = 0
    searchResults.value = []

    try {
        const res = await api.searchCloud(searchQuery.value.trim(), 30, offset.value)

        if (res.result && res.result.songs) {
            searchResults.value = res.result.songs
            total.value = res.result.songCount || 0
            hasMore.value = res.result.songCount > searchResults.value.length
        } else {
            searchResults.value = []
            total.value = 0
            hasMore.value = false
        }

        // 保存搜索历史
        saveToHistory(searchQuery.value.trim())
    } catch (error) {
        console.error('搜索失败:', error)
        searchResults.value = []
        total.value = 0
    } finally {
        loading.value = false
    }
}

async function loadMore() {
    if (!searchQuery.value.trim() || loading.value) return

    loading.value = true
    offset.value += 30

    try {
        const res = await api.searchCloud(searchQuery.value.trim(), 30, offset.value)

        if (res.result && res.result.songs) {
            searchResults.value.push(...res.result.songs)
            hasMore.value = res.result.songCount > searchResults.value.length
        } else {
            hasMore.value = false
        }
    } catch (error) {
        console.error('加载更多失败:', error)
    } finally {
        loading.value = false
    }
}

function clearSearch() {
    searchQuery.value = ''
    searchResults.value = []
    searched.value = false
    offset.value = 0
    hasMore.value = true
    total.value = 0
    closeSuggestions()
}

function searchWithTag(tag: string) {
    searchQuery.value = tag
    handleSearch()
}

// 输入时获取搜索建议（防抖）
function onInput() {
    // 如果输入为空，则clearSearch
    if (!searchQuery.value.trim()) {
        clearSearch()
        return
    }
    // 清空防抖倒计时
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }

    if (!searchQuery.value.trim()) {
        closeSuggestions()
        return
    }

    debounceTimer = setTimeout(async () => {
        try {
            const res = await api.searchSuggest(searchQuery.value.trim())
            if (res.result && res.result.allMatch && res.result.allMatch.length > 0) {
                suggestions.value = res.result.allMatch.slice(0, 8) // 最多显示8条建议
                showSuggestions.value = true
            } else {
                closeSuggestions()
            }
        } catch (error) {
            console.error('获取搜索建议失败:', error)
            closeSuggestions()
        }
    }, 300) // 300ms 防抖
}

// 聚焦时显示建议
function onFocus() {
    if (searchQuery.value.trim() && suggestions.value.length > 0) {
        showSuggestions.value = true
    }
}

// 选择建议
function selectSuggestion(keyword: string) {
    searchQuery.value = keyword
    handleSearch()
}

// 关闭建议菜单
function closeSuggestions() {
    showSuggestions.value = false
    suggestions.value = []
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
}

// 高亮匹配文本
function highlightMatch(text: string, query: string): string {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<strong style="color: var(--v-theme-primary);">$1</strong>')
}

// 保存搜索历史
function saveToHistory(keyword: string) {
    // 移除重复的
    const index = searchHistory.value.indexOf(keyword)
    if (index !== -1) {
        searchHistory.value.splice(index, 1)
    }

    // 添加到开头
    searchHistory.value.unshift(keyword)

    // 限制数量
    if (searchHistory.value.length > MAX_HISTORY) {
        searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY)
    }

    // 保存到 localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 加载搜索历史
function loadSearchHistory() {
    const history = localStorage.getItem('searchHistory')
    if (history) {
        try {
            searchHistory.value = JSON.parse(history)
        } catch (error) {
            console.error('加载搜索历史失败:', error)
            searchHistory.value = []
        }
    }
}

// 清空搜索历史
function clearHistory() {
    searchHistory.value = []
    localStorage.removeItem('searchHistory')
}

// 滚动加载更多
let scrollTimer: any = null

function attachScrollListener() {
    const el = document.querySelector('.content') as HTMLElement | null
    if (!el) return
    el.addEventListener('scroll', onScrollHandler, { passive: true })
}

function detachScrollListener() {
    const el = document.querySelector('.content') as HTMLElement | null
    if (!el) return
    el.removeEventListener('scroll', onScrollHandler)
}

onMounted(() => {
    attachScrollListener()
    // 加载热门搜索
    loadHotSearch()
    // 加载搜索历史
    loadSearchHistory()
})

onUnmounted(() => detachScrollListener())

// keep-alive 下的切换
onActivated(() => attachScrollListener())
onDeactivated(() => detachScrollListener())

function onScrollHandler(e: Event) {
    const el = e.target as HTMLElement
    const { scrollTop, clientHeight, scrollHeight } = el

    // 防抖处理
    if (scrollTimer) {
        clearTimeout(scrollTimer)
    }

    scrollTimer = setTimeout(() => {
        // 当滚动到底部时加载更多
        if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore.value && !loading.value) {
            loadMore()
        }
    }, 150)
}

async function playTrack(item: any) {
    try {
        await player.addTrack(String(item.id), true)
    } catch (error) {
        console.error('播放失败:', error)
    }
}
</script>

<style scoped>
.search-header {
    border-radius: 12px;
    padding: 8px;
    flex-shrink: 0;
    /* 防止被压缩 */
}

.search-input {
    margin: 8px;
}

/* 搜索建议列表样式 */
.suggestion-list {
    border-radius: 8px;
    padding: 4px 0;
}

:deep(.suggestion-list .v-list-item) {
    min-height: 40px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

:deep(.suggestion-list .v-list-item:hover) {
    background-color: rgba(var(--v-theme-primary), 0.08);
}

:deep(.suggestion-list .v-list-subheader) {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.7;
}

.hot-search {
    border-radius: 12px;
}

.history-search {
    border-radius: 12px;
}

.hot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.results-container {
    border-radius: 12px;
    flex: 1;
    /* 占据剩余空间 */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* 防止内容溢出 */
}

.result-item {
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
    /* 优化移动端点击响应 */
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
}

.result-item:hover {
    background-color: rgba(var(--v-theme-primary), 0.08);
    transform: translateX(4px);
}

.result-item:active {
    background-color: rgba(var(--v-theme-primary), 0.12);
}

.empty-state {
    margin-top: 48px;
}


/* 搜索结果列表不需要独立滚动 */
:deep(.results-container .v-list) {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    /* 移动端平滑滚动 */
    -webkit-overflow-scrolling: touch;
    /* 防止触摸时页面整体滚动 */
    touch-action: pan-y;
}

/* 响应式调整 */
@media (max-width: 600px) {
    .search-page {
        padding: 8px;
        height: calc(100vh - 56px);
        /* 移动端导航栏可能更矮 */
    }

    :deep(.results-container .v-list) {
        /* 确保在移动端可以流畅滚动 */
        overscroll-behavior: contain;
    }
}
</style>