<script setup lang="ts">
import buttomPlayer from './bottomPlayer.vue';
import UnifiedPlaylistDrawer from './UnifiedPlaylistDrawer.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { AudioViewShow, player } from './staic';
import { useTheme } from 'vuetify';
import { navigationrightShow } from './state';
import { useRoute } from 'vue-router';

const route = useRoute();
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

// 控制底部导航栏显示
const showBottomNav = ref(true);

// 判断是否为 AudioView 页面
const isAudioViewPage = computed(() => {
  return route.name === 'AudioView';
});
</script>

<template>
  <v-app class="phone-container">
    <!-- 顶部标题栏 - AudioView 页面隐藏 -->
    <v-app-bar v-if="!isAudioViewPage" flat density="compact" class="phone-header">
      <v-spacer></v-spacer>
      <v-btn :icon="isDark() ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'" @click="toggleTheme()"
        variant="text" size="small"></v-btn>

      <v-btn icon="mdi-account" @click="login" variant="text" size="small"></v-btn>
    </v-app-bar>

    <!-- 主要内容区域 -->
    <v-main class="phone-main" :class="{ 'no-header': isAudioViewPage }">
      <VSheet class="phone-content" :class="{ 'no-bottom-nav': isAudioViewPage }">
        <router-view v-slot="{ Component }">
          <keep-alive include="RecommendView">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </VSheet>
    </v-main>

    <!-- 底部播放器 -->
    <buttomPlayer v-if="!AudioViewShow && player.playlist.value.length > 0" class="phone-player"
      :class="{ 'with-bottom-nav': !isAudioViewPage }" />

    <!-- 底部导航栏 - AudioView 页面隐藏 -->
    <v-bottom-navigation v-if="!isAudioViewPage" v-model="showBottomNav" grow class="phone-bottom-nav">
      <v-btn value="recommend" to="/">
        <v-icon>mdi-home-account</v-icon>
        <span>推荐</span>
      </v-btn>

      <v-btn value="search" to="/Search">
        <v-icon>mdi-magnify</v-icon>
        <span>搜索</span>
      </v-btn>

      <v-btn value="audio" to="/AudioView">
        <v-icon>mdi-music-note</v-icon>
        <span>音频</span>
      </v-btn>

      <v-btn value="playlist" to="/MusicPlaylist">
        <v-icon>mdi-music</v-icon>
        <span>歌单</span>
      </v-btn>

      <v-btn value="top" to="/TopView">
        <v-icon>mdi-star</v-icon>
        <span>排行</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- 右侧播放列表面板 -->
    <UnifiedPlaylistDrawer />
  </v-app>

  <!-- 登录弹窗 -->
  <v-overlay v-model="islogin" class="flex-col justify-center">
    <p>请使用手机扫码登陆</p>
    <VImg src="../public/favicon.ico"></VImg>
  </v-overlay>
</template>

<style scoped>
.phone-container {
  /* v-app 会自动处理布局 */
}

.phone-header {
  background-color: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(10px);
}

.phone-main {
  /* v-main 会自动填充剩余空间 */
}

/* AudioView 页面无顶部栏时的样式 */
.phone-main.no-header {
  padding-top: 0 !important;
}

.phone-content {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 60px;
  /* 为底部导航留出空间 */
}

/* AudioView 页面无底部导航栏时的样式 */
.phone-content.no-bottom-nav {
  padding-bottom: 0 !important;
}

.phone-player {
  position: fixed;
  bottom: 56px;
  left: 0;
  right: 0;
  z-index: 50;
}

/* 当有底部导航栏时，调整播放器位置 */
.phone-player.with-bottom-nav {
  bottom: 56px;
  /* Vuetify 底部导航栏高度 */
}

/* AudioView 页面无底部导航栏时 */
.phone-player:not(.with-bottom-nav) {
  bottom: 0;
}

.phone-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(10px);
}

/* 移动端优化 */
@media (max-width: 600px) {
  .phone-content {
    padding-bottom: 120px;
    /* 在小屏幕上为底部导航和播放器留出更多空间 */
  }

  .phone-player.with-bottom-nav {
    bottom: 52px;
    /* 小屏幕上底部导航栏高度 */
  }
}
</style>