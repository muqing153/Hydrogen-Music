<script setup lang="ts">
import navigationdrawer from './navigation-drawer.vue';
import buttomPlayer from './bottomPlayer.vue';
import { ref } from 'vue';
import { AudioViewShow, player } from './staic';
import { useTheme } from 'vuetify';

const theme = useTheme()
function isDark() {
  return !theme.global.current.value.dark
}
//切换主题
function toggleTheme() {
  theme.toggle()
  //切换完成后保存当前的主题
  localStorage.setItem('theme', isDark() ? 'light' : 'dark')
}
// 初始化当前主题
let thememode = localStorage.getItem('theme')
if (thememode) {
  theme.change(thememode)
}

const islogin = ref(false)
function login() {
  islogin.value = true
}
</script>

<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer expand-on-hover permanent width="160" :model-value="!AudioViewShow">
        <v-list>
          <v-list-item prepend-avatar="/favicon.ico" subtitle="未登录" title="用户" link v-on:click="login"></v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list ref="navRef" density="compact" nav>
          <v-list-item prepend-icon="mdi-home-account" title="推荐" value="RecommendView" to="/"></v-list-item>
          <v-list-item prepend-icon="mdi-magnify" title="搜索" value="SearchView" to="/Search"></v-list-item>
          <v-list-item prepend-icon="mdi-music-note" title="音频" value="AudioView" to="/AudioView"></v-list-item>
          <v-list-item prepend-icon="mdi-music" title="音乐表" value="MusicPlaylist" to="/MusicPlaylist"></v-list-item>
          <v-list-item prepend-icon="mdi-star" title="排行榜" value="TopView" to="/TopView"></v-list-item>
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <v-btn :icon="isDark() ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'" @click="toggleTheme()"
              variant="plain">
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>

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
      <navigationdrawer location="right" />
    </v-layout>
  </v-card>
  <v-overlay v-model="islogin" class="flex-col justify-center">
    <p>请使用手机扫码登陆</p>
    <VImg src="../public/favicon.ico">
    </VImg>
  </v-overlay>
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
