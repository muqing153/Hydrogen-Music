<script setup lang="ts">
import navigationdrawer from './navigation-drawer.vue';
import buttomPlayer from './bottomPlayer.vue';
import { AudioViewShow, player } from './staic';
</script>

<template>
  <v-card>
    <v-layout>
      <v-toolbar extended v-if="false">
        <v-toolbar-title text="Toolbar"></v-toolbar-title>
        <template v-slot:append>
          <v-btn icon="mdi-magnify"></v-btn>

          <v-btn icon="mdi-heart"></v-btn>

          <v-btn icon="mdi-dots-vertical"></v-btn>
        </template>
      </v-toolbar>

      <v-main class="main">
        <VSheet class="content">
          <router-view v-slot="{ Component }">
            <keep-alive include="RecommendView">
              <component :is="Component" />
            </keep-alive>
          </router-view>

        </VSheet>
        <buttomPlayer v-if="!AudioViewShow && player.playlist.value.length > 0" class="playerClass" />
      </v-main>
      <navigationdrawer location="bottom" />
      <v-bottom-navigation grow :elevation="0" v-if="!AudioViewShow">
        <v-btn value="RecommendView" to="/">
          <v-icon>mdi-home-account</v-icon>
          <span>推荐</span>
        </v-btn>

        <v-btn value="AudioView" to="/AudioView">
          <v-icon>mdi-music-note</v-icon>
          <span>音频</span>
        </v-btn>

        <v-btn value="MusicPlaylist" to="/MusicPlaylist">
          <v-icon>mdi-music</v-icon>
          <span>音乐表</span>
        </v-btn>

        <v-btn value="TopView" to="/TopView">
          <v-icon>mdi-star</v-icon>
          <span>排行榜</span>
        </v-btn>
      </v-bottom-navigation>

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
