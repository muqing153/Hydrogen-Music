<template>
    <div class="search-page">
        <!-- 搜索栏 -->
        <v-card class="search-header mb-6" elevation="2" style="flex-shrink: 0;">
            <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="搜索歌曲、歌手、专辑" variant="outlined"
                density="comfortable" clearable @keyup.enter="handleSearch" @click:clear="clearSearch" @input="onInput"
                @focus="onFocus" autofocus hide-details class="search-input" ref="searchFieldRef">
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
        <!-- 搜索内容选择 -->
        <v-card v-if="searched" class="search-content mb-6" elevation="1">
            <v-card-title class="text-subtitle-1 py-3">
                <v-icon start>mdi-music-note</v-icon>
                搜索内容
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <div class="search-type-tabs">
                    <v-chip v-for="type in searchTypes" :key="type.value"
                        :color="currentSearchType === type.value ? 'primary' : undefined"
                        :variant="currentSearchType === type.value ? 'tonal' : 'outlined'" clickable size="small"
                        class="ma-1" @click="changeSearchType(type.value)">
                        <v-icon start size="x-small">{{ type.icon }}</v-icon>
                        {{ type.label }}
                    </v-chip>
                </div>
            </v-card-text>
        </v-card>

        <!-- 搜索结果 -->
        <v-card v-if="searchResults.length > 0" class="results-container" elevation="1">
            <v-card-title class="d-flex align-center justify-space-between py-3" style="flex-shrink: 0;">
                <span class="text-subtitle-1">
                    <v-icon start>{{ currentSearchTypeIcon }}</v-icon>
                    {{ currentSearchTypeName }}结果
                </span>
                <v-chip size="small" variant="tonal">
                    {{ total }} {{ currentSearchTypeUnit }}
                </v-chip>
            </v-card-title>
            <v-divider style="flex-shrink: 0;"></v-divider>


            <v-infinite-scroll :items="searchResults" @load="loadMore">
                <!-- 单曲结果 -->
                <template v-if="currentSearchType === 1">
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
                            <v-chip v-if="item.al?.name || item.album?.name" size="x-small" class="mt-1"
                                variant="tonal">
                                <v-icon start size="x-small">mdi-album</v-icon>
                                {{ item.al?.name || item.album?.name }}
                            </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-play-circle" size="large" variant="text" @click.stop="playTrack(item)" />
                        </template>
                    </v-list-item>
                </template>

                <!-- 歌单结果 -->
                <template v-else-if="currentSearchType === 1000">
                    <v-list-item v-for="(item, index) in searchResults" :key="index" class="result-item"
                        @click="openPlaylist(item.id)">
                        <template v-slot:prepend>
                            <v-avatar size="56" rounded="lg">
                                <v-img :src="item.coverImgUrl" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-icon color="grey-lighten-2" size="large">mdi-playlist-music</v-icon>
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
                                <v-icon size="x-small" class="mr-1">mdi-account</v-icon>
                                {{ item.creator?.nickname }}
                            </span>
                            <br />
                            <v-chip size="x-small" class="mt-1" variant="tonal">
                                <v-icon start size="x-small">mdi-music-note</v-icon>
                                {{ item.trackCount }} 首
                            </v-chip>
                            <v-chip size="x-small" class="mt-1 ml-2" variant="tonal">
                                <v-icon start size="x-small">mdi-play-circle</v-icon>
                                {{ formatPlayCount(item.playCount) }}
                            </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-chevron-right" size="large" variant="text" />
                        </template>
                    </v-list-item>
                </template>

                <!-- 专辑结果 -->
                <template v-else-if="currentSearchType === 10">
                    <v-list-item v-for="(item, index) in searchResults" :key="index" class="result-item"
                        @click="openAlbum(item.id)">
                        <template v-slot:prepend>
                            <v-avatar size="56" rounded="lg">
                                <v-img :src="item.picUrl || item.blurPicUrl" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-icon color="grey-lighten-2" size="large">mdi-album</v-icon>
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
                                {{ item.artist?.name || item.artists?.[0]?.name }}
                            </span>
                            <br />
                            <v-chip size="x-small" class="mt-1" variant="tonal">
                                <v-icon start size="x-small">mdi-music-note</v-icon>
                                {{ item.size }} 首
                            </v-chip>
                            <v-chip size="x-small" class="mt-1 ml-2" variant="tonal">
                                <v-icon start size="x-small">mdi-calendar</v-icon>
                                {{ formatDate(item.publishTime) }}
                            </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-chevron-right" size="large" variant="text" />
                        </template>
                    </v-list-item>
                </template>

                <!-- 歌手结果 -->
                <template v-else-if="currentSearchType === 100">
                    <v-list-item v-for="(item, index) in searchResults" :key="index" class="result-item"
                        @click="openArtist(item.id)">
                        <template v-slot:prepend>
                            <v-avatar size="56" rounded="lg">
                                <v-img :src="item.picUrl || item.img1v1Url" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-icon color="grey-lighten-2" size="large">mdi-account-music</v-icon>
                                        </div>
                                    </template>
                                </v-img>
                            </v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-medium text-body-1">
                            {{ item.name }}
                        </v-list-item-title>

                        <v-list-item-subtitle class="mt-1">
                            <v-chip size="x-small" class="mt-1" variant="tonal">
                                <v-icon start size="x-small">mdi-album</v-icon>
                                {{ item.albumSize }} 张专辑
                            </v-chip>
                            <v-chip size="x-small" class="mt-1 ml-2" variant="tonal">
                                <v-icon start size="x-small">mdi-music-note</v-icon>
                                {{ item.musicSize }} 首歌曲
                            </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-chevron-right" size="large" variant="text" />
                        </template>
                    </v-list-item>
                </template>

                <!-- MV结果 -->
                <template v-else-if="currentSearchType === 1004">
                    <v-list-item v-for="(item, index) in searchResults" :key="index" class="result-item"
                        @click="openMV(item.id)">
                        <template v-slot:prepend>
                            <v-avatar size="56" rounded="lg">
                                <v-img :src="item.cover" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-icon color="grey-lighten-2" size="large">mdi-video</v-icon>
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
                                {{ item.artistName || item.artists?.[0]?.name }}
                            </span>
                            <br />
                            <v-chip size="x-small" class="mt-1" variant="tonal">
                                <v-icon start size="x-small">mdi-play-circle</v-icon>
                                {{ formatPlayCount(item.playCount) }}
                            </v-chip>
                            <v-chip size="x-small" class="mt-1 ml-2" variant="tonal">
                                <v-icon start size="x-small">mdi-clock-outline</v-icon>
                                {{ formatDuration(item.duration) }}
                            </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-play-circle" size="large" variant="text" />
                        </template>
                    </v-list-item>
                </template>

                <!-- 电台结果 -->
                <template v-else-if="currentSearchType === 1009">
                    <v-list-item v-for="(item, index) in searchResults" :key="index" class="result-item"
                        @click="openRadio(item.id)">
                        <template v-slot:prepend>
                            <v-avatar size="56" rounded="lg">
                                <v-img :src="item.picUrl" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-icon color="grey-lighten-2" size="large">mdi-radio</v-icon>
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
                                <v-icon size="x-small" class="mr-1">mdi-account</v-icon>
                                {{ item.dj?.nickname }}
                            </span>
                            <br />
                            <v-chip size="x-small" class="mt-1" variant="tonal">
                                <v-icon start size="x-small">mdi-music-note</v-icon>
                                {{ item.programCount }} 期
                            </v-chip>
                            <v-chip size="x-small" class="mt-1 ml-2" variant="tonal">
                                <v-icon start size="x-small">mdi-account-group</v-icon>
                                {{ item.subCount }} 订阅
                            </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-chevron-right" size="large" variant="text" />
                        </template>
                    </v-list-item>
                </template>

                <!-- 视频结果 -->
                <template v-else-if="currentSearchType === 1014">
                    <v-list-item v-for="(item, index) in searchResults" :key="index" class="result-item"
                        @click="openVideo(item.vid)">
                        <template v-slot:prepend>
                            <v-avatar size="56" rounded="lg">
                                <v-img :src="item.coverUrl" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-icon color="grey-lighten-2" size="large">mdi-play-circle</v-icon>
                                        </div>
                                    </template>
                                </v-img>
                            </v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-medium text-body-1">
                            {{ item.title }}
                        </v-list-item-title>

                        <v-list-item-subtitle class="mt-1">
                            <span class="text-truncate">
                                <v-icon size="x-small" class="mr-1">mdi-account</v-icon>
                                {{ item.creator?.[0]?.userName }}
                            </span>
                            <br />
                            <v-chip size="x-small" class="mt-1" variant="tonal">
                                <v-icon start size="x-small">mdi-play-circle</v-icon>
                                {{ item.playTime }} 次播放
                            </v-chip>
                            <v-chip size="x-small" class="mt-1 ml-2" variant="tonal">
                                <v-icon start size="x-small">mdi-clock-outline</v-icon>
                                {{ formatDuration(item.durationms) }}
                            </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-play-circle" size="large" variant="text" />
                        </template>
                    </v-list-item>
                </template>

                <!-- 用户结果 -->
                <template v-else-if="currentSearchType === 1002">
                    <v-list-item v-for="(item, index) in searchResults" :key="index" class="result-item"
                        @click="openUser(item.userId)">
                        <template v-slot:prepend>
                            <v-avatar size="56" rounded="lg">
                                <v-img :src="item.avatarUrl" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-icon color="grey-lighten-2" size="large">mdi-account</v-icon>
                                        </div>
                                    </template>
                                </v-img>
                            </v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-medium text-body-1">
                            {{ item.nickname }}
                        </v-list-item-title>

                        <v-list-item-subtitle class="mt-1">
                            <span v-if="item.signature" class="text-truncate">
                                {{ item.signature }}
                            </span>
                            <br v-if="item.signature" />
                            <v-chip size="x-small" class="mt-1" variant="tonal">
                                <v-icon start size="x-small">mdi-account-group</v-icon>
                                {{ item.follows }} 关注
                            </v-chip>
                            <v-chip size="x-small" class="mt-1 ml-2" variant="tonal">
                                <v-icon start size="x-small">mdi-account-multiple</v-icon>
                                {{ item.followeds }} 粉丝
                            </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-chevron-right" size="large" variant="text" />
                        </template>
                    </v-list-item>
                </template>

                <!-- 歌词结果（使用单曲展示） -->
                <template v-else-if="currentSearchType === 1006">
                    <v-list-item v-for="(item, index) in searchResults" :key="index" class="result-item"
                        @click="playTrack(item)">
                        <template v-slot:prepend>
                            <v-avatar size="56" rounded="lg">
                                <v-img :src="item.al?.picUrl || item.album?.picUrl" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-icon color="grey-lighten-2" size="large">mdi-text</v-icon>
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
                            <v-chip v-if="item.al?.name || item.album?.name" size="x-small" class="mt-1"
                                variant="tonal">
                                <v-icon start size="x-small">mdi-album</v-icon>
                                {{ item.al?.name || item.album?.name }}
                            </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-play-circle" size="large" variant="text" @click.stop="playTrack(item)" />
                        </template>
                    </v-list-item>
                </template>

                <!-- 其他类型的默认展示 -->
                <template v-else>
                    <v-list-item v-for="(item, index) in searchResults" :key="index" class="result-item">
                        <template v-slot:prepend>
                            <v-avatar size="56" rounded="lg">
                                <v-img :src="item.picUrl || item.coverImgUrl || item.avatarUrl || item.cover" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-icon color="grey-lighten-2" size="large">{{ currentSearchTypeIcon
                                            }}</v-icon>
                                        </div>
                                    </template>
                                </v-img>
                            </v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-medium text-body-1">
                            {{ item.name || item.nickname || item.title }}
                        </v-list-item-title>

                        <v-list-item-subtitle class="mt-1">
                            <span v-if="item.description || item.signature" class="text-truncate">
                                {{ item.description || item.signature }}
                            </span>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-btn icon="mdi-chevron-right" size="large" variant="text" />
                        </template>
                    </v-list-item>
                </template>
                <!-- 加载中提示 -->
                <template v-slot:loading>
                    <div class="text-center py-4">
                        <v-progress-circular indeterminate color="pink" size="32"></v-progress-circular>
                        <div class="mt-2 text-body-2 text-pink-accent-2">✨ 正在努力加载中...</div>
                    </div>
                </template>

                <!-- 没有更多数据提示 -->
                <template v-slot:empty>
                    <div class="text-center py-6">
                        <v-icon size="48" color="grey-lighten-1">mdi-check-circle-outline</v-icon>
                        <div class="mt-2 text-body-2 text-medium-emphasis">🎵 已经到底啦~</div>
                    </div>
                </template>
                <!-- 加载错误提示 -->
                <template v-slot:error>
                    <div class="text-center py-6">
                        <v-icon size="48" color="error">mdi-alert-circle-outline</v-icon>
                        <div class="mt-2 text-body-2 text-error">😢 加载失败了...</div>
                        <v-btn size="small" variant="text" color="primary" class="mt-2"
                            @click="$event.target.closest('.v-infinite-scroll').__vueParentComponent.ctx.retry()">
                            再试一次 💪
                        </v-btn>
                    </div>
                </template>

            </v-infinite-scroll>
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

        <!-- 加载状态 -->
        <div v-if="loading && searchResults.length === 0" class="loading-state">
            <v-progress-circular indeterminate size="64" width="6"></v-progress-circular>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as api from '../api'
import { player } from '@/staic'
import router from '@/router'

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const loading = ref(false)
const searched = ref(false)
const offset = ref(0)
const hasMore = ref(true)
const total = ref(0)

// 搜索类型
const currentSearchType = ref(1) // 默认为单曲
const searchTypes = [
    { label: '单曲', value: 1, icon: 'mdi-music-note' },
    { label: '专辑', value: 10, icon: 'mdi-album' },
    { label: '歌手', value: 100, icon: 'mdi-account-music' },
    { label: '歌单', value: 1000, icon: 'mdi-playlist-music' },
    { label: '用户', value: 1002, icon: 'mdi-account' },
    { label: 'MV', value: 1004, icon: 'mdi-video' },
    { label: '歌词', value: 1006, icon: 'mdi-text' },
    { label: '电台', value: 1009, icon: 'mdi-radio' },
    { label: '视频', value: 1014, icon: 'mdi-play-circle' }
]

// 当前搜索类型的图标
const currentSearchTypeIcon = computed(() => {
    const type = searchTypes.find(t => t.value === currentSearchType.value)
    return type?.icon || 'mdi-music-note'
})

// 当前搜索类型的名称
const currentSearchTypeName = computed(() => {
    const type = searchTypes.find(t => t.value === currentSearchType.value)
    return type?.label || '单曲'
})

// 当前搜索类型的单位
const currentSearchTypeUnit = computed(() => {
    switch (currentSearchType.value) {
        case 1: return '首'
        case 10: return '张'
        case 100: return '位'
        case 1000: return '个'
        case 1002: return '个'
        case 1004: return '个'
        case 1006: return '条'
        case 1009: return '个'
        case 1014: return '个'
        default: return '条'
    }
})

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
        const res = await api.searchCloud(searchQuery.value.trim(), 30, offset.value, currentSearchType.value)

        // 根据搜索类型获取对应的结果数据
        let results: any[] = []
        let count = 0

        switch (currentSearchType.value) {
            case 1: // 单曲
                results = res.result?.songs || []
                count = res.result?.songCount || 0
                break
            case 10: // 专辑
                results = res.result?.albums || []
                count = res.result?.albumCount || 0
                break
            case 100: // 歌手
                results = res.result?.artists || []
                count = res.result?.artistCount || 0
                break
            case 1000: // 歌单
                results = res.result?.playlists || []
                count = res.result?.playlistCount || 0
                break
            case 1002: // 用户
                results = res.result?.userprofiles || []
                count = res.result?.userprofileCount || 0
                break
            case 1004: // MV
                results = res.result?.mvs || []
                count = res.result?.mvCount || 0
                break
            case 1006: // 歌词
                results = res.result?.songs || []
                count = res.result?.songCount || 0
                break
            case 1009: // 电台
                results = res.result?.djRadios || []
                count = res.result?.djRadiosCount || 0
                break
            case 1014: // 视频
                results = res.result?.videos || []
                count = res.result?.videoCount || 0
                break
            default:
                results = res.result?.songs || []
                count = res.result?.songCount || 0
        }

        searchResults.value = results
        total.value = count
        hasMore.value = count > searchResults.value.length

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

// 切换搜索类型
async function changeSearchType(type: number) {
    if (currentSearchType.value === type) return

    currentSearchType.value = type
    offset.value = 0
    searchResults.value = []
    hasMore.value = true

    // 重新搜索
    if (searchQuery.value.trim()) {
        await handleSearch()
    }
}

async function loadMore({ done }: { done: (status: 'ok' | 'error' | 'empty') => void }) {
    if (!searchQuery.value.trim() || !hasMore.value || loading.value) {
        done('empty');
        return;
    }

    loading.value = true;

    try {
        const res = await api.searchCloud(searchQuery.value.trim(), 30, offset.value, currentSearchType.value);

        // 根据搜索类型获取对应的结果数据
        let results: any[] = []
        let count = 0

        switch (currentSearchType.value) {
            case 1: // 单曲
                results = res.result?.songs || []
                count = res.result?.songCount || 0
                break
            case 10: // 专辑
                results = res.result?.albums || []
                count = res.result?.albumCount || 0
                break
            case 100: // 歌手
                results = res.result?.artists || []
                count = res.result?.artistCount || 0
                break
            case 1000: // 歌单
                results = res.result?.playlists || []
                count = res.result?.playlistCount || 0
                break
            case 1002: // 用户
                results = res.result?.userprofiles || []
                count = res.result?.userprofileCount || 0
                break
            case 1004: // MV
                results = res.result?.mvs || []
                count = res.result?.mvCount || 0
                break
            case 1006: // 歌词
                results = res.result?.songs || []
                count = res.result?.songCount || 0
                break
            case 1009: // 电台
                results = res.result?.djRadios || []
                count = res.result?.djRadiosCount || 0
                break
            case 1014: // 视频
                results = res.result?.videos || []
                count = res.result?.videoCount || 0
                break
            default:
                results = res.result?.songs || []
                count = res.result?.songCount || 0
        }

        searchResults.value.push(...results);
        offset.value += 30;
        hasMore.value = count > searchResults.value.length;
        done('ok');  // 加载成功
    } catch (error) {
        console.error('加载更多失败:', error);
        done('error');  // 加载失败
    } finally {
        loading.value = false;
    }
}

function clearSearch() {
    searchQuery.value = ''
    searchResults.value = []
    searched.value = false
    offset.value = 0
    hasMore.value = true
    total.value = 0
    currentSearchType.value = 1 // 重置为单曲
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

onMounted(() => {
    // 加载热门搜索
    loadHotSearch()
    // 加载搜索历史
    loadSearchHistory()
})

async function playTrack(item: any) {
    try {
        await player.addTrack(String(item.id), true)
    } catch (error) {
        console.error('播放失败:', error)
    }
}

// 打开歌单
function openPlaylist(playlistId: number) {
    // TODO: 跳转到歌单详情页
    console.log('打开歌单:', playlistId)
    router.push({ path: '/MusicPlaylist', query: { id: playlistId } })
}

// 格式化播放次数
function formatPlayCount(count: number): string {
    if (count >= 100000000) {
        return (count / 100000000).toFixed(1) + '亿'
    } else if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万'
    }
    return count.toString()
}

// 格式化日期
function formatDate(timestamp: number): string {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 格式化时长（毫秒转分秒）
function formatDuration(ms: number): string {
    if (!ms) return '00:00'
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 打开专辑
function openAlbum(albumId: number) {
    console.log('打开专辑:', albumId)
    // TODO: 跳转到专辑详情页
}

// 打开歌手页
function openArtist(artistId: number) {
    console.log('打开歌手:', artistId)
    // TODO: 跳转到歌手详情页
}

// 打开MV
function openMV(mvId: number) {
    console.log('打开MV:', mvId)
    // TODO: 跳转到MV播放页
}

// 打开电台
function openRadio(radioId: number) {
    console.log('打开电台:', radioId)
    // TODO: 跳转到电台详情页
}

// 打开视频
function openVideo(videoId: string) {
    console.log('打开视频:', videoId)
    // TODO: 跳转到视频播放页
}

// 打开用户主页
function openUser(userId: number) {
    console.log('打开用户:', userId)
    // TODO: 跳转到用户主页
}
</script>

<style scoped>
/* 防止页面出现滚动条 */
.search-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* 防止浏览器滚动条 */
    overflow-x: hidden;
    /* 禁止横向滚动 */
    padding: 16px;
}

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
    flex-shrink: 0;
    /* 防止被压缩 */
}

.history-search {
    border-radius: 12px;
    flex-shrink: 0;
    /* 防止被压缩 */
}

.hot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.search-type-tabs {
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
    min-height: 0;
    /* 允许flex子项收缩 */
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
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 无限滚动提示样式 */
.v-infinite-scroll__loading,
.v-infinite-scroll__empty,
.v-infinite-scroll__error {
    animation: fadeInUp 0.3s ease-out;
}

/* v-infinite-scroll 自适应高度 */
:deep(.v-infinite-scroll) {
    flex: 1;
    min-height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
}

/* 加载状态居中 */
.loading-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>