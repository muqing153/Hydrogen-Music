<script setup lang="ts">
import buttomPlayer from './bottomPlayer.vue';
import UnifiedPlaylistDrawer from './UnifiedPlaylistDrawer.vue';
import LoginView from './components/LoginView.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { AudioViewShow, player } from './staic';
import { useTheme } from 'vuetify';
import { navigationrightShow } from './state';
import { useRoute } from 'vue-router';
import { isLoggedIn, logout, getUserAccount, getLoginStatus, getCookie } from './api';

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

// 登录状态管理
const showLoginDialog = ref(false)
const loginStatus = computed(() => isLoggedIn())
const userInfo = ref<any>(null)

// 获取用户信息
async function fetchUserInfo() {
  console.log('[AppPhone] 开始获取用户信息, isLoggedIn:', isLoggedIn())
  console.log('[AppPhone] 当前 cookie 长度:', getCookie().length)

  if (isLoggedIn()) {
    // 先检查登录状态
    const statusResult = await getLoginStatus()
    console.log('[AppPhone] 登录状态检查结果:', statusResult)

    if (statusResult.success) {
      console.log('[AppPhone] 登录状态正常')

      // 登录状态正常，获取用户信息
      const userResult = await getUserAccount()
      console.log('[AppPhone] 用户信息获取结果:', userResult)

      if (userResult.success && userResult.data) {
        userInfo.value = userResult.data
        localStorage.setItem('user_info', JSON.stringify(userResult.data))
        console.log('[AppPhone] 用户信息已更新:', userResult.data.profile?.nickname)
      } else {
        console.warn('[AppPhone] 获取用户信息失败:', userResult.message)
      }
    } else {
      // 登录状态异常，但不要立即清除 cookie，可能是网络问题
      console.warn('[AppPhone] 登录状态异常:', statusResult.message)
      console.warn('[AppPhone] 保留 cookie，等待下次重试')
    }
  } else {
    // 未登录时从 localStorage 清除用户信息
    console.log('[AppPhone] 未登录，清除用户信息')
    userInfo.value = null
    localStorage.removeItem('user_info')
  }
}

// 获取 VIP 类型文本
function getVipTypeText(vipType: number): string {
  switch (vipType) {
    case 0:
      return '普通用户'
    case 11:
      return '黑胶 VIP'
    case 110:
      return '黑胶 VIP'
    default:
      return '普通用户'
  }
}

function handleLogin() {
  showLoginDialog.value = true
}

async function handleLogout() {
  const result = await logout()
  if (result.success) {
    userInfo.value = null
    console.log('[AppPhone] 退出登录成功')
  } else {
    console.warn('[AppPhone] 退出登录:', result.message)
  }
}

function handleLogoutSuccess() {
  userInfo.value = null
  console.log('[AppPhone] 退出登录成功（从 LoginView）')
}

// 控制底部导航栏显示
const showBottomNav = ref(true);

// 判断是否为 AudioView 页面
const isAudioViewPage = computed(() => {
  return route.name === 'AudioView';
});

onMounted(() => {
  // 初始化时获取用户信息
  fetchUserInfo()
});
</script>

<template>
  <v-app class="phone-container">
    <!-- 顶部标题栏 - AudioView 页面隐藏 -->
    <v-app-bar v-if="!isAudioViewPage" flat density="compact" class="phone-header">
      <v-spacer></v-spacer>
      <v-btn :icon="isDark() ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'" @click="toggleTheme()"
        variant="text" size="small"></v-btn>

      <!-- 用户头像按钮 -->
      <v-btn @click="handleLogin" variant="text" size="small">
        <v-avatar size="32" v-if="loginStatus && userInfo?.profile?.avatarUrl">
          <v-img :src="userInfo.profile.avatarUrl"></v-img>
        </v-avatar>
        <v-icon v-else>mdi-account</v-icon>
      </v-btn>
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

  <!-- 登录对话框 -->
  <LoginView v-model="showLoginDialog" @login-success="fetchUserInfo" @logout-success="handleLogoutSuccess" />
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
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
  height: 100%;
}

/* AudioView 页面无顶部栏时的样式 */
.phone-main.no-header {
  padding-top: 0 !important;
}

.phone-content {
  /* 移除 overflow，让 v-main 处理滚动 */
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