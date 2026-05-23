<script setup lang="ts">
import buttomPlayer from './bottomPlayer.vue';
import UnifiedPlaylistDrawer from './UnifiedPlaylistDrawer.vue';
import LoginView from './components/LoginView.vue';
import { ref, computed } from 'vue';
import { AudioViewShow, player } from './staic';
import { useRoute } from 'vue-router';
import AudioView from './components/AudioView.vue';
import { useThemeManager, useAuth } from './ts/useApp';
const route = useRoute();

// 使用共享的组合式函数
const { isDark, toggleTheme } = useThemeManager();
const {
  showLoginDialog,
  loginStatus,
  userInfo,
  fetchUserInfo,
  handleLogin,
  handleLogoutSuccess
} = useAuth();

// 判断是否为搜索页面
const isSearchPage = computed(() => {
  return route.name === 'SearchView' || route.path === '/Search';
});
</script>
<style scoped src="./css/shared.css"></style>

<template>
  <v-app>
    <!-- 顶部标题栏 - AudioView 页面隐藏 -->
    <v-app-bar v-if="!AudioViewShow" flat density="compact" class="phone-header">
      <!-- 用户头像按钮 -->
      <v-btn @click="handleLogin" variant="text" size="small">
        <v-avatar size="32" v-if="loginStatus && userInfo?.profile?.avatarUrl">
          <v-img :src="userInfo.profile.avatarUrl"></v-img>
        </v-avatar>
        <v-icon v-else>mdi-account</v-icon>
      </v-btn>
      <!-- 搜索框样式 -->
      <v-text-field style="margin: 3px 8px 0px 8px;" :style="{ visibility: isSearchPage ? 'hidden' : 'visible' }"
        variant="solo" density="compact" placeholder="搜索" prepend-inner-icon="mdi-magnify" hide-details readonly
        class="search-field" @click="$router.push('/Search')"></v-text-field>

      <v-btn :icon="isDark() ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'" @click="toggleTheme()"
        variant="text" size="small"></v-btn>

    </v-app-bar>

    <!-- 主要内容区域 -->
    <v-main class="phone-main" :class="{ 'no-header': AudioViewShow }">
      <VSheet class="phone-content" :class="{ 'no-bottom-nav': AudioViewShow }">
        <router-view v-slot="{ Component }">
          <keep-alive include="RecommendView">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </VSheet>
    </v-main>

    <!-- 底部播放器 -->
    <buttomPlayer v-if="player.playlist.value.length > 0" class="phone-player"
      :class="{ 'with-bottom-nav': !AudioViewShow }" />

    <!-- 底部导航栏 - AudioView 页面隐藏 -->
    <v-bottom-navigation v-if="!AudioViewShow" grow class="phone-bottom-nav">
      <v-btn value="recommend" to="/">
        <v-icon>mdi-home-account</v-icon>
        <span>推荐</span>
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

  <!-- 登录对话框 -->
  <LoginView v-model="showLoginDialog" @login-success="fetchUserInfo" @logout-success="handleLogoutSuccess" />
  <!-- 全屏音频视图 -->
  <Transition name="slide-up">
    <AudioView v-if="AudioViewShow" class="audio-view-overlay" />
  </Transition>
</template>