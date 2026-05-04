<template>
    <div class="playlist-wrapper">
        <!-- 歌单头部信息 -->
        <div v-if="playlistDetail" class="playlist-header">
            <!-- 封面 -->
            <div class="playlist-cover">
                <v-img :src="`${playlistDetail.coverImgUrl}?param=200y200`" width="160" height="160" rounded="lg" cover>
                    <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                            <v-progress-circular color="grey-lighten-4" indeterminate size="40"></v-progress-circular>
                        </div>
                    </template>
                </v-img>
                <div class="play-count-badge" v-if="playlistDetail.playCount">
                    <v-icon size="small">mdi-play</v-icon>
                    {{ formatPlayCount(playlistDetail.playCount) }}
                </div>
            </div>

            <!-- 信息区域 -->
            <div class="playlist-info">
                <h2 class="playlist-title">{{ playlistDetail.name || '歌单' }}</h2>

                <div class="playlist-meta">
                    <v-avatar size="24" class="mr-2">
                        <v-img :src="playlistDetail.creator?.avatarUrl || ''"
                            v-if="playlistDetail.creator?.avatarUrl"></v-img>
                        <v-icon v-else size="small">mdi-account</v-icon>
                    </v-avatar>
                    <span class="creator-name">{{ playlistDetail.creator?.nickname || '未知' }}</span>
                    <span class="create-time">{{ playlistDetail.createTime ? formatDate(playlistDetail.createTime) : ''
                        }}创建</span>
                </div>

                <!-- 占位空间，将按钮推到底部 -->
                <div style="flex: 1;"></div>

                <!-- 操作按钮组 - 固定在底部 -->
                <div class="action-buttons">
                    <v-btn color="primary" rounded="xl" prepend-icon="mdi-play" @click="playAll" :loading="isPlayingAll"
                        :disabled="songs.length === 0" class="play-btn" height="40">
                        播放全部
                    </v-btn>
                    <v-btn variant="outlined" rounded="xl" prepend-icon="mdi-plus-box-multiple"
                        @click="addAllToPlaylist" :loading="isAddingAll" :disabled="songs.length === 0" class="add-btn"
                        height="40">
                        加入列表
                    </v-btn>
                    <v-btn variant="tonal" rounded="xl" icon="mdi-dots-horizontal" class="more-btn" height="40"
                        width="40">
                    </v-btn>
                </div>
            </div>
        </div>

        <!-- 歌单描述 -->
        <div v-if="playlistDetail?.description" class="playlist-description mt-4 mb-4">
            <div class="text-body-2 text-medium-emphasis" style="line-height: 1.6;">
                {{ playlistDetail.description }}
            </div>
        </div>

        <!-- 歌曲数量提示 -->
        <div class="songs-header d-flex align-center justify-space-between mb-2" v-if="songs.length > 0">
            <div class="text-body-2 text-medium-emphasis">
                <v-icon size="small" class="mr-1">mdi-music-note</v-icon>
                {{ songs.length }} 首歌曲
            </div>
        </div>

        <!-- 播放列表内容 -->
        <v-card v-if="songs.length > 0" class="playlist-content" elevation="1" flat>
            <v-list lines="two" class="pa-2" density="comfortable">
                <v-list-item v-for="(value, index) in songs" :key="value.id" class="song-item" @click="async () => {
                    await player.addTrack(String(value.id), true)
                }">
                    <template v-slot:prepend>
                        <v-avatar size="56" rounded="lg">
                            <v-img :src="`${value.al.picUrl}?param=56y56`" cover>
                                <template v-slot:placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                                    </div>
                                </template>
                            </v-img>
                        </v-avatar>
                    </template>

                    <v-list-item-title class="font-weight-medium text-body-1">
                        {{ value.name }}
                    </v-list-item-title>

                    <v-list-item-subtitle class="mt-1">
                        <span class="text-truncate">
                            <v-icon size="x-small" class="mr-1">mdi-account-music</v-icon>
                            {{value.ar.map((a: any) => a.name).join(' / ')}}
                        </span>
                        <br v-if="value.al.name" />
                        <v-chip v-if="value.al.name" size="x-small" class="mt-1" variant="tonal">
                            <v-icon start size="x-small">mdi-album</v-icon>
                            {{ value.al.name }}
                        </v-chip>
                    </v-list-item-subtitle>

                    <template v-slot:append>
                        <v-btn icon="mdi-play-circle" size="large" variant="text" @click.stop="async () => {
                            await player.addTrack(String(value.id), true)
                        }" />
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
            <div v-if="!hasMore && songs.length > 0" class="text-center pa-4 text-caption text-medium-emphasis">
                已加载全部歌曲
            </div>
        </v-card>

        <!-- 空状态 -->
        <v-empty-state v-if="!loading && songs.length === 0" icon="mdi-music-off" title="暂无歌曲"
            text="当前歌单选择信息为空你可以测试MusicPlaylist?id=歌单id" class="empty-state">
        </v-empty-state>

        <!-- 加载状态 -->
        <div v-if="loading && songs.length === 0" class="d-flex justify-center align-center pa-16">
            <v-progress-circular indeterminate size="64" width="6"></v-progress-circular>
        </div>
    </div>
</template>
<script setup lang="ts">
import { PlaylistUID, player } from '@/staic';
import { onActivated, onDeactivated, onMounted, onUnmounted, ref } from 'vue';
import * as api from '../api'
import { useRoute } from 'vue-router';

const route = useRoute();
const songs: any = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const playlistName = ref('');
const playlistDetail = ref<any>(null);
const isPlayingAll = ref(false);
const isAddingAll = ref(false);
let PlaylistOffset = 1;
let id = route.query.id as string;

if (id === undefined || id === '' || id === 'undefined' || id === 'null' || id === null) {
    if (PlaylistUID.value !== '') {
        id = PlaylistUID.value;
    }
}

if (id) {
    PlaylistUID.value = id;
    console.log('PlaylistUID.value');
    getPlaylist(id);
    getPlaylistDetailInfo(id);
}

// 获取歌单详情
async function getPlaylistDetailInfo(id: string) {
    try {
        const res = await api.getPlaylistDetail(id);
        if (res && res.playlist) {
            playlistDetail.value = res.playlist;
            playlistName.value = res.playlist.name || '';
        }
    } catch (error) {
        console.error('获取歌单详情失败:', error);
    }
}

// 格式化播放次数
function formatPlayCount(count: number): string {
    if (count >= 100000000) {
        return (count / 100000000).toFixed(1) + '亿';
    } else if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    }
    return count.toString();
}

// 格式化日期
function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 一键播放 - 替换当前播放列表
async function playAll() {
    if (songs.value.length === 0) return;

    isPlayingAll.value = true;
    try {
        // 清空当前播放列表
        player.clearPlaylist();

        // 逐个添加歌曲到播放列表
        for (const song of songs.value) {
            await player.addTrack(String(song.id), false);
        }

        // 播放第一首
        if (player.playlist.value.length > 0) {
            player.playIndex(0);
        }
    } catch (error) {
        console.error('播放全部失败:', error);
    } finally {
        isPlayingAll.value = false;
    }
}

// 加入播放列表 - 追加到当前播放列表
async function addAllToPlaylist() {
    if (songs.value.length === 0) return;

    isAddingAll.value = true;
    try {
        // 逐个添加歌曲到播放列表（不立即播放）
        for (const song of songs.value) {
            await player.addTrack(String(song.id), false);
        }
    } catch (error) {
        console.error('加入播放列表失败:', error);
    } finally {
        isAddingAll.value = false;
    }
}

// 滚动加载相关
let scrollTimer: any = null;

function attach() {
    const el = document.querySelector('.content') as HTMLElement | null;
    if (!el) {
        console.warn('未找到 .content 滚动容器');
        return;
    }
    el.addEventListener('scroll', onScrollHandler, { passive: true });
    console.log('已绑定滚动事件到 .content 容器');
}

function detach() {
    const el = document.querySelector('.content') as HTMLElement | null;
    if (!el) return;
    el.removeEventListener('scroll', onScrollHandler);
    console.log('已解绑滚动事件');
}

onMounted(() => {
    // 延迟绑定，确保 DOM 完全渲染
    setTimeout(() => attach(), 100);
});
onUnmounted(() => detach());

// keep-alive 下的切换
onActivated(() => {
    setTimeout(() => attach(), 100);
});
onDeactivated(() => detach());

function onScrollHandler(e: Event) {
    const el = e.target as HTMLElement;
    const { scrollTop, clientHeight, scrollHeight } = el;

    // 防抖处理
    if (scrollTimer) {
        clearTimeout(scrollTimer);
    }

    scrollTimer = setTimeout(() => {
        // 当距离底部还有 100px 时加载更多
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;
        if (distanceToBottom <= 100 && hasMore.value && !loading.value) {
            console.log('触发加载更多，当前歌曲数:', songs.value.length);
            getPlaylist(PlaylistUID.value);
        }
    }, 150);
}

function getPlaylist(id: string) {
    if (id !== PlaylistUID.value) {
        PlaylistUID.value = id;
        PlaylistOffset = 1;
        songs.value = [];
        hasMore.value = true;
    }

    loading.value = true;

    api.getPlaylist(id, PlaylistOffset).then((res) => {
        if (PlaylistOffset > 1) {
            songs.value.push(...res.songs);
        } else {
            songs.value = res.songs;
        }

        // 判断是否还有更多数据
        hasMore.value = res.songs.length > 0;
        PlaylistOffset += 10;
    }).catch((error) => {
        console.error('获取播放列表失败:', error);
        hasMore.value = false;
    }).finally(() => {
        loading.value = false;
    });
}
</script>
<style scoped>
.playlist-wrapper {
    width: 100%;
    padding: 16px;
}

/* 歌单头部布局 */
.playlist-header {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    align-items: stretch;
    min-height: 160px;
}

.playlist-cover {
    position: relative;
    flex-shrink: 0;
}

.play-count-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.playlist-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.playlist-title {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.playlist-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.creator-name {
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.8);
}

.create-time {
    font-size: 12px;
}

.action-buttons {
    display: flex;
    gap: 12px;
    align-items: center;
}

.play-btn,
.add-btn,
.more-btn {
    text-transform: none;
    font-weight: 500;
}

.playlist-description {
    padding: 12px 16px;
    background: rgba(var(--v-theme-on-surface), 0.04);
    border-radius: 8px;
}

.songs-header {
    padding: 8px 0;
}

.playlist-content {
    border-radius: 12px;
    overflow: visible;
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

.empty-state {
    margin-top: 48px;
}

/* 响应式调整 */
@media (max-width: 600px) {
    .playlist-wrapper {
        padding: 8px;
    }

    .playlist-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .playlist-cover {
        width: 200px;
        height: 200px;
    }

    .playlist-info {
        width: 100%;
    }

    .playlist-title {
        font-size: 20px;
    }

    .playlist-meta {
        justify-content: center;
        flex-wrap: wrap;
    }

    .action-buttons {
        justify-content: center;
        flex-wrap: wrap;
    }
}
</style>