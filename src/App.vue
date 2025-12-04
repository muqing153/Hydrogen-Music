<script setup lang="ts">
import navigationdrawer from './navigation-drawer.vue';
import { navigationrightShow } from './main';
import buttomPlayer from './bottomPlayer.vue';
import { getCurrentInstance } from 'vue';
import type { AudioPlayer } from './player';
import { AudioViewShow, player } from './staic';
// player
</script>

<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer expand-on-hover permanent width="160" :model-value="!AudioViewShow">
        <v-list>
          <v-list-item prepend-avatar="/favicon.ico" subtitle="未登录" title="用户"></v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list ref="navRef" density="compact" nav>
          <v-list-item prepend-icon="mdi-home-account" title="推荐" value="RecommendView" to="/"></v-list-item>
          <v-list-item prepend-icon="mdi-music-note" title="音频" value="AudioView" to="/AudioView"></v-list-item>
          <v-list-item prepend-icon="mdi-star" title="排行榜" value="TopView" to="/TopView"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main class="main">
        <VSheet class="content">
          <RouterView />
        </VSheet>
        <buttomPlayer v-if="!AudioViewShow && player.playlist.value.length > 0" class="playerClass" />
      </v-main>
      <navigationdrawer />
    </v-layout>
  </v-card>
</template>

<style scoped>
.main-container {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* 总高度永不超过浏览器高度 */
}

/* 内容区域自动填满剩余空间 */
.content {
  flex: 1;
  max-height: 100vh;
  /* 🚀 保证永不超过浏览器高度 */
  overflow-y: auto;
  /* 内容超出则滚动 */
}

/* 底部播放器 */
.playerClass {
  flex-shrink: 0;
  height: 10vh;
  min-height: 56px;
}
</style>
