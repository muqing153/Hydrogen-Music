<template>
    <v-col class="toplist-page">
        <!-- 页面标题 -->
        <v-card-title class="text-h5 font-weight-bold" style="flex-shrink: 0;">
            <v-icon start color="primary">mdi-trophy-award</v-icon>
            排行榜
        </v-card-title>
        <v-divider class="mb-4" style="flex-shrink: 0;"></v-divider>

        <!-- 排行榜列表 -->
        <v-card v-if="source && source.length > 0" class="toplist-section" elevation="1">
            <v-card-text>
                <v-list lines="two" class="pa-2" density="comfortable">
                    <v-list-item v-for="(item, index) in source" :key="item.id" class="toplist-item"
                        @click="router.push({ path: '/MusicPlaylist', query: { id: item.id } })">
                        <!-- 排名序号 -->
                        <template v-slot:prepend>
                            <div class="rank-number" :class="getRankClass(index)">
                                {{ index + 1 }}
                            </div>
                        </template>

                        <!-- 封面图片 -->
                        <template v-slot:title>
                            <div class="toplist-name text-subtitle-1 font-weight-medium">
                                {{ item.name }}
                            </div>
                        </template>

                        <template v-slot:subtitle>
                            <div class="toplist-info">
                                <!-- 更新频率标签 -->
                                <v-chip v-if="item.updateFrequency" size="x-small" variant="tonal" color="primary"
                                    class="mb-2">
                                    {{ item.updateFrequency }}
                                </v-chip>

                                <!-- 描述 -->
                                <div class="toplist-description text-body-2 text-medium-emphasis">
                                    {{ item.description || '暂无描述' }}
                                </div>

                                <!-- 播放量和订阅数 -->
                                <div class="toplist-stats d-flex align-center mt-2">
                                    <v-icon size="x-small" class="mr-1">mdi-play</v-icon>
                                    <span class="text-caption text-medium-emphasis mr-4">
                                        {{ formatPlayCount(item.playCount) }}
                                    </span>
                                    <v-icon size="x-small" class="mr-1">mdi-star</v-icon>
                                    <span class="text-caption text-medium-emphasis">
                                        {{ formatPlayCount(item.subscribedCount) }}
                                    </span>
                                </div>
                            </div>
                        </template>

                        <!-- 封面图片放在 append 位置 -->
                        <template v-slot:append>
                            <v-img :src="`${item.coverImgUrl}?param=100y100`" width="80" height="80" rounded="lg" cover>
                                <template #placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-progress-circular color="grey-lighten-4" indeterminate size="24" />
                                    </div>
                                </template>
                            </v-img>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>

        <!-- 加载状态 -->
        <v-card v-else-if="!source" class="loading-card" elevation="0">
            <v-card-text class="text-center py-8">
                <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                <div class="mt-4 text-body-1 text-medium-emphasis">正在加载排行榜...</div>
            </v-card-text>
        </v-card>

        <!-- 空状态 -->
        <v-card v-else class="empty-card" elevation="0">
            <v-card-text class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1">mdi-trophy-outline</v-icon>
                <div class="mt-4 text-body-1 text-medium-emphasis">暂无排行榜数据</div>
            </v-card-text>
        </v-card>
    </v-col>
</template>

<script setup lang="ts">
import { getTopList } from '@/api'
import { ref, onMounted } from 'vue'
import router from '@/router'

interface TopListItem {
    id: number
    name: string
    coverImgUrl: string
    description?: string
    updateFrequency?: string
    playCount?: number
    subscribedCount?: number
    trackCount?: number
}

const source = ref<TopListItem[]>([])
const loading = ref(false)

// 获取排行榜数据
async function fetchTopList() {
    loading.value = true
    try {
        const res = await getTopList()
        console.log('排行榜数据:', res)
        source.value = res.list || []
    } catch (error) {
        console.error('获取排行榜失败:', error)
    } finally {
        loading.value = false
    }
}

// 格式化播放量
function formatPlayCount(count?: number): string {
    if (!count) return '0'
    if (count >= 100000000) {
        return `${(count / 100000000).toFixed(1)}亿`
    }
    if (count >= 10000) {
        return `${(count / 10000).toFixed(1)}万`
    }
    return count.toString()
}

// 获取排名样式类
function getRankClass(index: number): string {
    if (index === 0) return 'rank-first'
    if (index === 1) return 'rank-second'
    if (index === 2) return 'rank-third'
    return 'rank-normal'
}

// 组件挂载时获取数据
onMounted(() => {
    fetchTopList()
})
</script>

<style scoped>
.toplist-page {
    padding: 16px;
    overflow-y: auto;
}

.toplist-section {
    border-radius: 12px;
}

.toplist-item {
    transition: all 0.2s ease;
    border-radius: 8px;
    margin-bottom: 8px;
}

.toplist-item:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
    transform: translateX(4px);
}

/* 排名数字样式 */
.rank-number {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    border-radius: 6px;
    margin-right: 12px;
}

.rank-first {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    color: white;
}

.rank-second {
    background: linear-gradient(135deg, #ffa94d 0%, #ff922b 100%);
    color: white;
}

.rank-third {
    background: linear-gradient(135deg, #ffd43b 0%, #fcc419 100%);
    color: white;
}

.rank-normal {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
    color: rgba(var(--v-theme-on-surface), 0.6);
}

/* 内容布局 */
.toplist-info {
    width: 100%;
}

.toplist-description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
}

.toplist-stats {
    gap: 8px;
}

/* 加载和空状态 */
.loading-card,
.empty-card {
    border-radius: 12px;
}
</style>