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
                    <v-menu location="bottom end">
                        <template v-slot:activator="{ props }">
                            <v-btn variant="tonal" rounded="xl" icon="mdi-dots-horizontal" class="more-btn" height="40"
                                width="40" v-bind="props">
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item @click="sharePlaylist">
                                <template v-slot:prepend>
                                    <v-icon>mdi-share-variant</v-icon>
                                </template>
                                <v-list-item-title>分享歌单</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="copyPlaylistLink">
                                <template v-slot:prepend>
                                    <v-icon>mdi-content-copy</v-icon>
                                </template>
                                <v-list-item-title>复制链接</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
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
        <div class="songs-header d-flex align-center justify-space-between mb-2" v-if="playlistDetail?.trackCount">
            <div class="text-body-2 text-medium-emphasis">
                <v-icon size="small" class="mr-1">mdi-music-note</v-icon>
                {{ playlistDetail.trackCount }} 首歌曲
            </div>
            <div v-if="songs.length < playlistDetail.trackCount" class="text-caption text-medium-emphasis">
                已加载 {{ songs.length }} 首
            </div>
        </div>

        <!-- 播放列表内容 -->
        <v-card v-if="songs.length > 0" class="playlist-content" elevation="1" flat>
            <v-virtual-scroll :items="songs" height="100%" item-height="72">
                <template v-slot:default="{ item }: { item: any }">
                    <v-list-item class="song-item" @click="async () => {
                        await player.addTrack(String(item.id), true)
                    }">
                        <template v-slot:prepend>
                            <v-avatar size="56" rounded="lg">
                                <v-img :src="`${item.al.picUrl}?param=56y56`" cover>
                                    <template v-slot:placeholder>
                                        <div class="d-flex align-center justify-center fill-height">
                                            <v-progress-circular color="grey-lighten-4"
                                                indeterminate></v-progress-circular>
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
                                {{item.ar.map((a: any) => a.name).join(' / ')}}
                            </span>
                            <br v-if="item.al.name" />
                            <v-chip v-if="item.al.name" size="x-small" class="mt-1" variant="tonal">
                                <v-icon start size="x-small">mdi-album</v-icon>
                                {{ item.al.name }}
                            </v-chip>
                        </v-list-item-subtitle>

                        <template v-slot:append>
                            <v-btn icon="mdi-play-circle" size="large" variant="text" @click.stop="async () => {
                                await player.addTrack(String(item.id), true)
                            }" />
                        </template>
                    </v-list-item>
                </template>
            </v-virtual-scroll>
        </v-card>

        <!-- 空状态 -->
        <v-empty-state v-if="songs.length === 0" icon="mdi-music-off" title="暂无歌曲"
            text="当前歌单选择信息为空你可以测试MusicPlaylist?id=歌单id" class="empty-state">
        </v-empty-state>
    </div>
</template>
<script setup lang="ts">
import { PlaylistUID, player } from '@/staic';
import { onActivated, onDeactivated, onMounted, onUnmounted, ref } from 'vue';
import * as api from '../api'
import { useRoute } from 'vue-router';
import { IP, getCookie } from '../api'

const route = useRoute();
const songs: any = ref([]);
const playlistName = ref('');
const playlistDetail = ref<any>(null);
const isPlayingAll = ref(false);
const isAddingAll = ref(false);
let id = route.query.id as string;

if (id === undefined || id === '' || id === 'undefined' || id === 'null' || id === null) {
    if (PlaylistUID.value !== '') {
        id = PlaylistUID.value;
    }
}

if (id) {
    PlaylistUID.value = id;
    console.log('PlaylistUID.value');
    getPlaylistDetailInfo(id);
}

// 获取歌单详情
async function getPlaylistDetailInfo(id: string) {
    try {
        const res = await api.getPlaylistDetail(id);
        if (res && res.playlist) {
            playlistDetail.value = res.playlist;
            playlistName.value = res.playlist.name || '';

            songs.value = res.playlist.tracks;
            console.log(res.privileges.tracks)
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

        // 并行获取所有歌曲的基本信息（不获取歌词，提升加载速度）
        const tracks = await Promise.all(
            songs.value.map(async (data: any) => {
                try {
                    return {
                        id: String(data.id),
                        name: data.name,
                        artist: data.ar.map((a: any) => a.name).join('/'),
                        picUrl: data.al.picUrl + '?param=512y512',
                        url: `${IP}/song/url/v1/302?id=${data.id}&level=exhigh${getCookie() ? '&cookie=' + getCookie() : ''}`,
                        lyric: null, // 歌词在需要时再获取
                    }
                } catch (error) {
                    console.error(`获取歌曲 ${data.id} 信息失败:`, error)
                    return null
                }
            })
        );

        // 过滤掉失败的歌曲
        const validTracks = tracks.filter((track): track is NonNullable<typeof track> => track !== null);

        // 批量添加到播放列表
        player.playlist.value = validTracks;

        // 播放第一首歌
        if (validTracks.length > 0) {
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
        // 并行获取所有歌曲的基本信息
        const tracks = await Promise.all(
            songs.value.map(async (data: any) => {
                try {
                    return {
                        id: String(data.id),
                        name: data.name,
                        artist: data.ar.map((a: any) => a.name).join('/'),
                        picUrl: data.al.picUrl + '?param=512y512',
                        url: `${IP}/song/url/v1/302?id=${data.id}&level=exhigh${getCookie() ? '&cookie=' + getCookie() : ''}`,
                        lyric: null,
                    }
                } catch (error) {
                    console.error(`获取歌曲 ${data.id} 信息失败:`, error)
                    return null
                }
            })
        );

        // 过滤掉失败的歌曲并添加到播放列表
        const validTracks = tracks.filter((track): track is NonNullable<typeof track> => track !== null);
        player.playlist.value.push(...validTracks);
    } catch (error) {
        console.error('加入播放列表失败:', error);
    } finally {
        isAddingAll.value = false;
    }
}

// 分享歌单
function sharePlaylist() {
    if (!playlistDetail.value || !id) return;

    const shareData = {
        title: playlistDetail.value.name || '歌单分享',
        text: `分享歌单：${playlistDetail.value.name} - ${playlistDetail.value.creator?.nickname || ''}`,
        url: window.location.href,
    };

    // 尝试使用 Web Share API
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('分享成功'))
            .catch((error) => {
                console.error('分享失败:', error);
                // 如果分享失败，降级为复制链接
                copyPlaylistLink();
            });
    } else {
        // 不支持 Web Share API，直接复制链接
        copyPlaylistLink();
    }
}

// 复制歌单链接
function copyPlaylistLink() {
    if (!id) return;

    const url = window.location.href;

    navigator.clipboard.writeText(url)
        .then(() => {
            // 显示成功提示
            showSnackbar('链接已复制到剪贴板');
        })
        .catch((error) => {
            console.error('复制失败:', error);
            showSnackbar('复制失败，请手动复制', 'error');
        });
}

// 显示提示消息
function showSnackbar(message: string, type: 'success' | 'error' = 'success') {
    // 创建一个简单的提示元素
    const snackbar = document.createElement('div');
    snackbar.textContent = message;
    snackbar.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        animation: fadeInUp 0.3s ease-out;
    `;

    document.body.appendChild(snackbar);

    setTimeout(() => {
        snackbar.style.opacity = '0';
        snackbar.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(snackbar);
        }, 300);
    }, 2000);
}



</script>
<style scoped>
.playlist-wrapper {
    width: 100%;
    padding: 16px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* 防止浏览器滚动条 */
    overflow-x: hidden;
    /* 禁止横向滚动 */
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
    overflow: hidden;
    flex: 1;
    min-height: 0;
    /* 允许flex子项收缩 */
    display: flex;
    flex-direction: column;
}

/* 隐藏虚拟滚动的横向滚动条 */
:deep(.v-virtual-scroll__container) {
    overflow-x: hidden !important;
}

:deep(.v-virtual-scroll) {
    overflow-x: hidden !important;
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