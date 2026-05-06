<template>
    <v-col class="recommend-page">
        <!-- 推荐歌单区域 -->
        <v-card v-if="items && items.length > 0" class="playlist-section mb-6" elevation="1">
            <v-card-title class="text-subtitle-1 py-3 d-flex align-center">
                <v-icon start color="primary">mdi-star-circle</v-icon>
                推荐歌单
            </v-card-title>
            <v-card-text>
                <!-- 横向滚动列表 -->
                <v-slide-group class="py-2" hide-arrows>
                    <v-col v-for="(item, index) in items" :key="index" cols="auto">
                        <v-card class="playlist-card" width="160" height="180" link
                            @click="router.push({ path: '/MusicPlaylist', query: { id: item.id } })">
                            <!-- 封面图片区域 -->
                            <v-img :src="`${item.picUrl}?param=360y360`" height="180" cover>
                                <template #placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular color="grey-lighten-4" indeterminate />
                                    </div>
                                </template>
                                <!-- 播放量徽章 -->
                                <div class="play-count-badge" v-if="item.playcount">
                                    <v-icon size="x-small">mdi-play</v-icon>
                                    {{ formatPlayCount(item.playcount) }}
                                </div>
                            </v-img>
                            <!-- 内容区域 -->
                            <div class="playlist-content">
                                <!-- 标题 -->
                                <div class="playlist-title">
                                    {{ item.name }}
                                </div>
                                <!-- 播放按钮 -->
                                <v-btn class="play-icon" size="32" variant="tonal"
                                    :icon="player.PlaylistUID.value === String(item.id) ? (player.isPlaying.value ? 'mdi-pause' : 'mdi-play') : 'mdi-play'"
                                    @click.stop="handlePlaylistClick(String(item.id))" text>
                                </v-btn>
                            </div>
                        </v-card>
                    </v-col>
                </v-slide-group>
            </v-card-text>
        </v-card>
        <!-- 登陆后才显示区域 我的歌单 -->
        <v-card v-if="api.isLoggedIn() && myPlaylists && myPlaylists.length > 0" class="my-playlist-section mb-6"
            elevation="1">
            <v-card-title class="text-subtitle-1 py-3 d-flex align-center">
                <v-icon start color="primary">mdi-music-note</v-icon>
                我的歌单
            </v-card-title>
            <v-card-text>
                <!-- 横向滚动列表 -->
                <v-slide-group class="py-2" hide-arrows>
                    <v-col v-for="(playlist, index) in myPlaylists" :key="index" cols="auto">
                        <v-card class="playlist-card" width="160" height="180" link
                            @click="router.push({ path: '/MusicPlaylist', query: { id: playlist.id } })">
                            <!-- 封面图片区域 -->
                            <v-img :src="`${playlist.coverImgUrl || playlist.picUrl}?param=360y360`" height="180" cover>
                                <template #placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular color="grey-lighten-4" indeterminate />
                                    </div>
                                </template>
                                <!-- 播放量徽章 -->
                                <div class="play-count-badge" v-if="playlist.playCount">
                                    <v-icon size="x-small">mdi-play</v-icon>
                                    {{ formatPlayCount(playlist.playCount) }}
                                </div>
                            </v-img>
                            <!-- 内容区域 -->
                            <div class="playlist-content">
                                <!-- 标题 -->
                                <div class="playlist-title">
                                    {{ playlist.name }}
                                </div>
                                <!-- 播放按钮 -->
                                <v-btn class="play-icon" size="32" variant="tonal"
                                    :icon="player.PlaylistUID.value === String(playlist.id) ? (player.isPlaying.value ? 'mdi-pause' : 'mdi-play') : 'mdi-play'"
                                    @click.stop="handlePlaylistClick(String(playlist.id))" text>
                                </v-btn>
                            </div>
                        </v-card>
                    </v-col>
                </v-slide-group>
            </v-card-text>
        </v-card>
        <!-- 登陆后才显示区域 收藏歌单 -->
        <v-card v-if="api.isLoggedIn()" class="liked-playlist-section mb-6" elevation="1">
            <v-card-title class="text-subtitle-1 py-3 d-flex align-center">
                <v-icon start color="error">mdi-heart</v-icon>
                收藏歌单
            </v-card-title>
            <v-card-text>
                <!-- 横向滚动列表 -->
                <v-slide-group class="py-2" hide-arrows>
                    <v-col v-for="(playlist, index) in likedPlaylists" :key="index" cols="auto">
                        <v-card class="playlist-card" width="160" height="180" link
                            @click="router.push({ path: '/MusicPlaylist', query: { id: playlist.id } })">
                            <!-- 封面图片区域 -->
                            <v-img :src="`${playlist.coverImgUrl || playlist.picUrl}?param=360y360`" height="180" cover>
                                <template #placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular color="grey-lighten-4" indeterminate />
                                    </div>
                                </template>
                                <!-- 播放量徽章 -->
                                <div class="play-count-badge" v-if="playlist.playCount">
                                    <v-icon size="x-small">mdi-play</v-icon>
                                    {{ formatPlayCount(playlist.playCount) }}
                                </div>
                            </v-img>
                            <!-- 内容区域 -->
                            <div class="playlist-content">
                                <!-- 标题 -->
                                <div class="playlist-title">
                                    {{ playlist.name }}
                                </div>
                                <!-- 播放按钮 -->
                                <v-btn class="play-icon" size="32" variant="tonal"
                                    :icon="player.PlaylistUID.value === String(playlist.id) ? (player.isPlaying.value ? 'mdi-pause' : 'mdi-play') : 'mdi-play'"
                                    @click.stop="handlePlaylistClick(String(playlist.id))" text>
                                </v-btn>
                            </div>
                        </v-card>
                    </v-col>
                </v-slide-group>
            </v-card-text>
        </v-card>
        <!-- 推荐歌曲区域 -->
        <v-card v-if="MusicList && MusicList.length > 0" class="songs-section" elevation="1">
            <v-card-title class="text-subtitle-1 py-3 d-flex align-center justify-space-between">
                <span>
                    <v-icon start color="success">mdi-music-note</v-icon>
                    推荐歌曲
                </span>
                <v-chip size="small" variant="tonal">
                    {{ MusicList.length }} 首
                </v-chip>
            </v-card-title>

            <!-- 推荐歌曲列表 -->
            <v-list lines="two" class="pa-2" density="comfortable">
                <v-list-item v-for="(item, index) in MusicList" :key="index" class="song-item" @click="async () => {
                    await player.addTrack(String(item.id), true)
                }">
                    <!-- 封面 -->
                    <template v-slot:prepend>
                        <v-avatar size="56" rounded="lg">
                            <v-img :src="`${item.al?.picUrl}?param=56y56`" cover>
                                <template v-slot:placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
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
                            {{item.ar?.map((a: any) => a.name).join(' / ')}}
                        </span>
                        <br v-if="item.al?.name" />
                        <v-chip v-if="item.al?.name" size="x-small" class="mt-1" variant="tonal">
                            <v-icon start size="x-small">mdi-album</v-icon>
                            {{ item.al.name }}
                        </v-chip>
                    </v-list-item-subtitle>

                    <!-- 播放按钮 -->
                    <template v-slot:append>
                        <v-btn icon="mdi-play-circle" size="large" variant="text" @click.stop="async () => {
                            await player.addTrack(String(item.id), true)
                        }" />
                    </template>
                </v-list-item>
            </v-list>
        </v-card>

        <!-- 空状态 -->
        <v-empty-state v-if="(!items || items.length === 0) && (!MusicList || MusicList.length === 0)"
            icon="mdi-music-off" title="暂无推荐" text="请稍后再试或检查网络连接" class="empty-state">
        </v-empty-state>

        <!-- 加载状态 -->
        <div v-if="(!items && !MusicList)" class="d-flex justify-center align-center pa-16">
            <v-progress-circular indeterminate size="64" width="6"></v-progress-circular>
        </div>
    </v-col>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import * as api from '../api'
import { player } from '@/staic'
import router from '@/router';

defineOptions({
    name: "RecommendView",
});

const items: any = ref(null)
const MusicList: any = ref(null)
const myPlaylists: any = ref([])
const likedPlaylists: any = ref([])

// 加载推荐歌单
async function loadRecommendPlaylists(forceRefresh: boolean = false) {
    try {
        console.log('[RecommendView] 开始加载推荐歌单, forceRefresh:', forceRefresh)
        const res = await api.recommendResource(forceRefresh)
        items.value = res.recommend
        console.log('[RecommendView] 推荐歌单加载成功，数量:', res.recommend?.length)
    } catch (error) {
        console.error('[RecommendView] 加载推荐歌单失败:', error)
    }
}

// 加载每日推荐歌曲
async function loadRecommendSongs(forceRefresh: boolean = false) {
    try {
        console.log('[RecommendView] 开始加载推荐歌曲, forceRefresh:', forceRefresh)
        const res = await api.getRecommendMusic(forceRefresh)
        MusicList.value = res.data.dailySongs
        console.log('[RecommendView] 推荐歌曲加载成功，数量:', res.data.dailySongs?.length)
    } catch (error) {
        console.error('[RecommendView] 加载推荐歌曲失败:', error)
    }
}

// 加载用户收藏歌单
async function loadLikedPlaylist() {
    if (!api.isLoggedIn()) {
        return
    }
    try {
        console.log('[RecommendView] 开始加载用户收藏歌单')
        // 获取用户账号信息以得到 uid
        const accountRes = await api.getUserAccount()
        if (accountRes.success && accountRes.data) {
            const uid = accountRes.data.account?.id || accountRes.data.profile?.userId
            if (uid) {
                // 使用收藏歌单 API
                const collectRes = await api.getUserPlaylistCollect(uid, 50, 0)
                // 数据结构可能是 { data: { playlist: [...] } } 或 { data: [...] }
                const playlists = collectRes.data?.playlist || collectRes.data || []
                if (playlists && playlists.length > 0) {
                    likedPlaylists.value = playlists
                    console.log('[RecommendView] 收藏歌单加载成功，数量:', likedPlaylists.value.length)
                    return
                }
            }
        }
        console.log('[RecommendView] 收藏歌单加载失败，无法获取用户账号信息')
    } catch (error) {
        console.error('[RecommendView] 加载用户收藏歌单失败:', error)
    }
}

// 加载用户创建歌单
async function loadMyPlaylist() {
    if (!api.isLoggedIn()) {
        return
    }
    try {
        console.log('[RecommendView] 开始加载用户创建歌单')
        // 获取用户账号信息以得到 uid
        const accountRes = await api.getUserAccount()
        if (accountRes.success && accountRes.data) {
            const uid = accountRes.data.account?.id || accountRes.data.profile?.userId
            if (uid) {
                // 使用创建歌单 API
                const createRes = await api.getUserPlaylistCreate(uid, 50, 0)
                // 数据结构可能是 { data: { playlist: [...] } } 或 { data: [...] }
                const playlists = createRes.data?.playlist || createRes.data || []
                if (playlists && playlists.length > 0) {
                    myPlaylists.value = playlists
                    console.log('[RecommendView] 创建歌单加载成功，数量:', myPlaylists.value.length)
                    return
                }
            }
        }
        console.log('[RecommendView] 创建歌单加载失败，无法获取用户账号信息')
    } catch (error) {
        console.error('[RecommendView] 加载用户创建歌单失败:', error)
    }
}

// 初始加载
loadRecommendPlaylists()
loadRecommendSongs()
loadMyPlaylist()
loadLikedPlaylist()

// 暴露刷新方法供父组件调用
defineExpose({
    refreshData: () => {
        console.log('[RecommendView] 收到刷新请求，强制重新加载数据...')
        // 清除缓存
        localStorage.removeItem('recommendResource')
        localStorage.removeItem('getRecommendMusic')
        localStorage.removeItem('getRecommendMusic_time')
        // 强制刷新
        loadRecommendPlaylists(true)
        loadRecommendSongs(true)
        loadMyPlaylist()
        loadLikedPlaylist()
    }
})

/** 格式化播放次数 */
function formatPlayCount(count: number): string {
    if (count >= 100000000) {
        return (count / 100000000).toFixed(1) + '亿'
    } else if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万'
    }
    return count.toString()
}

/** 处理歌单点击 */
function handlePlaylistClick(id: string) {
    if (player.PlaylistUID.value === id) {
        // 如果当前正在播放该歌单，则切换播放/暂停
        player.toggle()
    } else {
        // 否则加载新歌单
        player.loadPlaylist(id)
    }
}
</script>
<style scoped>
.recommend-page {
    padding: 16px;
}

/* 推荐歌单区域 */
.playlist-section {
    border-radius: 12px;
}

.playlist-card {
    transition: all 0.3s ease;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
}

.playlist-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.playlist-card:active {
    transform: scale(0.98);
}


.play-count-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.playlist-content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    background: linear-gradient(to top,
            rgba(var(--v-theme-surface), 0.95) 0%,
            rgba(var(--v-theme-surface), 0.85) 60%,
            rgba(var(--v-theme-surface), 0.6) 100%);
}

.playlist-title {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    color: rgba(var(--v-theme-on-surface), 0.95);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    letter-spacing: 0.2px;
    margin-right: 8px;
}

.play-icon {
    position: absolute;
    right: 3px;
    top: -16px;
}

/* 推荐歌曲区域 */
.songs-section {
    border-radius: 12px;
}

.song-item {
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
}

.song-item:hover {
    background-color: rgba(var(--v-theme-primary), 0.08);
    transform: translateX(4px);
}

.song-item:active {
    background-color: rgba(var(--v-theme-primary), 0.12);
}

/* 空状态 */
.empty-state {
    margin-top: 48px;
}

/* 响应式调整 */
@media (max-width: 600px) {
    .recommend-page {
        padding: 8px;
    }

    .playlist-card {
        width: 140px;
        height: 200px;
    }

    .playlist-card .v-img {
        height: 140px;
    }

    .playlist-content {
        height: 60px;
        padding: 8px;
    }

    .playlist-title {
        font-size: 12px;
    }

    .play-icon {
        width: 28px !important;
        height: 28px !important;
    }
}
</style>