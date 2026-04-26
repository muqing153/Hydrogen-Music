<template>
    <v-col>
        <v-card-title>推荐歌单</v-card-title>
        <v-divider></v-divider>
        <!-- 横向滚动列表 -->
        <v-slide-group show-arrows class="py-4">
            <v-col v-for="(item, index) in items" :key="index" cols="auto">
                <v-card class="overflow-hidden position-relative" width="130" height="150" link
                    @click="router.push({ path: '/MusicPlaylist', query: { id: item.id } })">
                    <!-- 右下角播放图标 -->
                    <v-img :src="`${item.picUrl}`" height="150" cover>
                        <template #placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular color="grey-lighten-4" indeterminate />
                            </div>
                        </template>
                    </v-img>
                    <!-- 名称 -->
                    <div class="play-text">
                        {{ item.name }}
                    </div>
                    <v-btn class="play-icon" size="28" icon="mdi-play" variant="plain"
                        @click.stop="player.loadPlaylist(String(item.id))">
                    </v-btn>
                </v-card>
            </v-col>
        </v-slide-group>
        <v-divider></v-divider>
        <v-card-title>推荐歌曲</v-card-title>
        <v-divider></v-divider>
        <!-- 推荐歌曲 -->
        <!-- 推荐歌曲（竖向列表） -->
        <div class="song-list">
            <v-card v-for="(item, index) in MusicList" :key="index" class="song-item">
                <!-- 封面 -->
                <v-img :src="item.al?.picUrl" class="cover" cover />

                <!-- 信息 -->
                <div class="info">
                    <div class="title">
                        {{ item.name }}
                    </div>

                    <div class="artist">
                        {{item.ar?.map((a: any) => a.name).join(' / ')}}
                    </div>

                    <div class="reason" v-if="item.recommendReason">
                        {{ item.recommendReason }}
                    </div>
                </div>

                <!-- 播放 -->
                <v-btn class="play-btn" icon="mdi-play" variant="text" @click="async () => {
                    await player.addTrack(String(item.id), true)
                }" />
            </v-card>
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
api.recommendResource().then((res) => {
    items.value = res.recommend
})
// 加载每日推荐歌曲
const MusicList: any = ref(null)
api.getRecommendMusic().then((res) => {
    // console.log(res)
    MusicList.value = res.data.dailySongs
})

</script>
<style scoped>
.play-icon {
    position: absolute;
    right: 1px;
    bottom: 50px;
}

.play-text {
    position: absolute;
    bottom: 0;
    left: 0;
    text-align: center;
    width: 100%;
    height: 50px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(16px);
    overflow: hidden;
    /* 🔥 防止溢出 */
    border-radius: inherit;
    /* 可选：继承 v-card 圆角 */
}

.v-text-back {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 36%;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(16px);
    overflow: hidden;
    /* 🔥 防止溢出 */
    border-radius: inherit;
    /* 可选：继承 v-card 圆角 */
    display: flex;
    align-items: start;
    /* 设置文字的超出 */
    padding: 6px 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /* 控制显示行数 */
    -webkit-box-orient: vertical;
    overflow: hidden;
}



.song-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 0;
}

.song-item {
    display: flex;
    align-items: center;
    height: 70px;
    padding: 6px;
    position: relative;
}

.cover {
    flex: 0 0 60px;
    /* 🔥 防止被 flex 拉伸 */
    width: 60px !important;
    height: 60px !important;
    border-radius: 8px;
    border-radius: 8px;
}

.info {
    flex: 1;
    padding-left: 10px;
    overflow: hidden;
}

.title {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.artist {
    font-size: 12px;
    opacity: 0.7;
    margin-top: 2px;
}

.reason {
    font-size: 11px;
    color: #4caf50;
    margin-top: 2px;
}

.play-btn {
    position: absolute;
    right: 6px;
}
</style>