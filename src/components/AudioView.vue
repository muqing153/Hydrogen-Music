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
                <v-card class="image-card">
                    <v-img cover
                        :src="player.currentTrack.value?.picUrl ?? 'https://p2.music.126.net/5r_yzQhx5yY_Y5ZQyY5ZQ==/109951163888371807.jpg'" />
                </v-card>

            </v-col>
            <VDivider vertical></VDivider>
            <!-- 右侧 -->
            <v-col class="right">
                <v-sheet class="content-sheet">
                    歌词
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
.left,
.right {
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

/*** 图片 card 居中且不撑开布局 ***/
.image-card {
    width: 70%;
    max-width: 420px;
    aspect-ratio: 1 / 1;
    border-radius: 16px;
    overflow: hidden;
}

/*** 右侧内容区域 ***/
.content-sheet {
    width: 100%;
    height: 100%;
}
</style>
