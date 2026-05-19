<script setup lang="ts">
import UnifiedPlaylistDrawer from './UnifiedPlaylistDrawer.vue';
import buttomPlayer from './bottomPlayer.vue';
import LoginView from './components/LoginView.vue';
import { ref } from 'vue';
import { AudioViewShow, player } from './staic';
import { useThemeManager, useAuth } from './ts/useApp';

const currentComponent = ref<any>(null)

// 刷新页面数据
function refreshPageData() {
  // 如果当前是推荐页面，刷新推荐数据
  if (currentComponent.value && currentComponent.value.refreshData) {
    console.log('检测到推荐页面，刷新数据...')
    currentComponent.value.refreshData()
  }
}

// 使用共享的组合式函数，传入登录成功回调
const { isDark, toggleTheme } = useThemeManager();
const {
  showLoginDialog,
  loginStatus,
  userInfo,
  fetchUserInfo,
  handleLogin,
  handleLogoutSuccess,
  getVipTypeText
} = useAuth(refreshPageData);

</script>

<template>

  <v-card>
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
