<template>
    <v-sheet class="fullscreen">

        <!-- 顶部按钮（绝对定位，不占布局高度） -->
        <div class="top-btn">
            <v-btn icon="mdi-fullscreen-exit" variant="plain" @click='Close()'></v-btn>
        </div>

        <!-- 主体区域：左右 50% -->
        <v-row no-gutters class="main-row">
            <!-- 左侧 -->
            <v-col class="left">
                <VSheet class="text-center align-center" width="100%">
                    <v-card class="image-card">
                        <v-img cover :src="player.currentTrack.value?.picUrl" />
                    </v-card>
                    <v-col class="mt-3">
                        <p class="text-h5">{{ player.currentTrack.value?.name ?? '暂无歌曲' }}</p>
                        <p class="text-body-2">{{ player.currentTrack.value?.artist ?? '暂无作者' }}</p>
                    </v-col>
                    <v-row class="justify-center mt-1">
                        <v-btn icon='mdi-heart-outline' variant="text"></v-btn>
                        <v-btn icon='mdi-skip-previous' @click='player.prev()' variant="text"></v-btn>
                        <v-btn :icon="player.isPlaying.value ? 'mdi-pause' : 'mdi-play'" @click='player.toggle()'
                            variant="text"></v-btn>
                        <v-btn icon='mdi-skip-next' @click='player.next()' variant="text"></v-btn>
                        <v-btn icon='mdi-playlist-music' variant="text" @click='navigationrightShow = true'></v-btn>
                    </v-row>
                </VSheet>
            </v-col>
            <VDivider vertical></VDivider>
            <!-- 右侧 -->
            <v-col class="right">
                <v-sheet class="content-sheet">
                    <LrcView />
                </v-sheet>
            </v-col>

        </v-row>
    </v-sheet>
</template>

<script setup lang="ts">
import { AudioViewShow, player } from '@/staic'
import type { AudioPlayer } from '@/player';
import { getCurrentInstance } from 'vue';
import router from '@/router';
import LrcView from '@/View/LrcView.vue';
import { navigationrightShow } from '@/main';
if (player.playlist.value.length < 1) {

}
// player.addTrack('2722253787', true)
// player
function Close() {
    AudioViewShow.value = false
    router.back()
}
</script>
<style scoped>
/*** 整个容器完全锁定浏览器宽高 ***/
.fullscreen {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
}

/*** 顶部按钮固定，不占高度，不挤压布局 ***/
.top-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 20;
}

/*** 主 layout 始终占 100vh ***/
.main-row {
    height: 100%;
    overflow: hidden;
}

/*** 左右两侧容器，不允许超出 ***/
.left {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* 横向居中 */
    justify-content: center;
    /* 垂直居中 */
    gap: 20px;
    /* 控制间距 */
}

/*** 图片 card 居中且不撑开布局 ***/
.image-card {
    width: 50%;
    aspect-ratio: 1 / 1;
    border-radius: 16px;
    overflow: hidden;
    margin: 0 auto;
}

/*** 右侧内容区域 ***/
.right {
    height: 100%;
    overflow: hidden;
    display: flex;
}

.content-sheet {
    width: 100%;
    flex: 1;
    overflow-y: auto;
}
</style>
