<script setup lang="ts">
import UnifiedPlaylistDrawer from './UnifiedPlaylistDrawer.vue';
import buttomPlayer from './bottomPlayer.vue';
import AppPhone from './AppPhone.vue';
import LoginView from './components/LoginView.vue';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { AudioViewShow, player } from './staic';
import { useTheme } from 'vuetify';
import { isLoggedIn, logout, getUserAccount, getLoginStatus, getCookie } from './api';

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
const currentComponent = ref<any>(null)

// 获取用户信息
async function fetchUserInfo() {
  console.log('[App] 开始获取用户信息, isLoggedIn:', isLoggedIn())
  console.log('[App] 当前 cookie 长度:', getCookie().length)

  if (isLoggedIn()) {
    // 先检查登录状态
    const statusResult = await getLoginStatus()
    console.log('[App] 登录状态检查结果:', statusResult)

    if (statusResult.success) {
      console.log('登录状态正常:', statusResult.data)

      // 登录状态正常，获取用户信息
      const userResult = await getUserAccount()
      console.log('[App] 用户信息获取结果:', userResult)

      if (userResult.success && userResult.data) {
        userInfo.value = userResult.data
        localStorage.setItem('user_info', JSON.stringify(userResult.data))
        console.log('[App] 用户信息已更新:', userResult.data.profile?.nickname)

        // 登录后刷新推荐页面数据
        refreshPageData()
      } else {
        console.warn('[App] 获取用户信息失败:', userResult.message)
      }
    } else {
      // 登录状态异常，但不要立即清除 cookie，可能是网络问题
      console.warn('[App] 登录状态异常:', statusResult.message)
      console.warn('[App] 保留 cookie，等待下次重试')
      // 不调用 logout()，避免误清除有效的 cookie
      // logout()
      // userInfo.value = null
      // localStorage.removeItem('user_info')
    }
  } else {
    // 未登录时从 localStorage 清除用户信息
    console.log('[App] 未登录，清除用户信息')
    userInfo.value = null
    localStorage.removeItem('user_info')
  }
}

// 刷新页面数据
function refreshPageData() {
  // 如果当前是推荐页面，刷新推荐数据
  if (currentComponent.value && currentComponent.value.refreshData) {
    console.log('检测到推荐页面，刷新数据...')
    currentComponent.value.refreshData()
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
    console.log('退出登录成功')
  } else {
    console.warn('退出登录:', result.message)
  }
}

function handleLogoutSuccess() {
  userInfo.value = null
  console.log('退出登录成功（从 LoginView）')
  // 退出后也可以刷新页面，显示未登录状态的数据
  refreshPageData()
}

// 检测设备是否为移动端
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => {
  return windowWidth.value <= 768;
});

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  // 初始化时获取用户信息
  fetchUserInfo()
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <!-- 根据设备类型显示不同界面 -->
  <AppPhone v-if="isMobile" />

  <v-card v-else>
    <v-layout>
      <v-navigation-drawer expand-on-hover permanent width="160" :model-value="!AudioViewShow">
        <v-list>
          <v-list-item :prepend-avatar="userInfo?.profile?.avatarUrl || '/favicon.ico'"
            :subtitle="loginStatus ? getVipTypeText(userInfo?.profile?.vipType || 0) : '未登录'"
            :title="userInfo?.profile?.nickname || '用户'" link @click="handleLogin">
          </v-list-item>
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
              <component :is="Component" ref="currentComponent" />
            </keep-alive>
          </router-view>

        </VSheet>
        <buttomPlayer v-if="!AudioViewShow && player.playlist.value.length > 0" class="playerClass" />
      </v-main>
      <UnifiedPlaylistDrawer location="right" />
    </v-layout>
  </v-card>

  <!-- 登录对话框 -->
  <LoginView v-model="showLoginDialog" @login-success="fetchUserInfo" @logout-success="handleLogoutSuccess" />
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
