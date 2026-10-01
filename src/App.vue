<script setup lang="ts">
import UnifiedPlaylistDrawer from './UnifiedPlaylistDrawer.vue'
import buttomPlayer from './bottomPlayer.vue'
import LoginView from './components/LoginView.vue'
import AudioView from './components/AudioView.vue'
import { AudioViewShow, player } from './staic'
import { useThemeManager, useAuth } from './ts/useApp'

// 使用共享的组合式函数（页面数据刷新由 RecommendView 订阅登录态变化自动完成）
const { isDark, toggleTheme } = useThemeManager()
const {
  showLoginDialog,
  loginStatus,
  userInfo,
  handleLogin,
  handleLoginSuccess,
  handleLogoutSuccess,
  getVipTypeText,
} = useAuth()
</script>
<style scoped src="./css/shared.css"></style>

<template>
  <v-layout>
    <v-navigation-drawer expand-on-hover permanent width="160" :model-value="!AudioViewShow">
      <v-list>
        <v-list-item
          :prepend-avatar="userInfo?.profile?.avatarUrl || '/favicon.ico'"
          :subtitle="loginStatus ? getVipTypeText(userInfo?.profile?.vipType || 0) : '未登录'"
          :title="userInfo?.profile?.nickname || '用户'"
          link
          @click="handleLogin"
        >
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list ref="navRef" density="compact" nav>
        <v-list-item
          prepend-icon="mdi-home-account"
          title="推荐"
          value="RecommendView"
          to="/"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-magnify"
          title="搜索"
          value="SearchView"
          to="/Search"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-music"
          title="音乐表"
          value="MusicPlaylist"
          to="/MusicPlaylist"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-star"
          title="排行榜"
          value="TopView"
          to="/TopView"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn
            :icon="isDark() ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
            @click="toggleTheme()"
            variant="plain"
          >
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
    <!-- 播放列表抽屉：置于 AudioView 之后，确保层级和 DOM 顺序均在其上方 -->
    <UnifiedPlaylistDrawer />
  </v-layout>
  <!-- 登录对话框 -->
  <LoginView
    v-model="showLoginDialog"
    @login-success="handleLoginSuccess"
    @logout-success="handleLogoutSuccess"
  />
  <!-- 全屏音频视图 -->
  <Transition name="slide-up">
    <AudioView v-if="AudioViewShow" class="audio-view-overlay" />
  </Transition>
</template>
