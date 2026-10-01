<template>
  <v-navigation-drawer
    v-model="navigationrightShow"
    :location="computedLocation"
    temporary
    :width="drawerWidth"
    style="z-index: 2000; bottom: 0; right: 0"
  >
    <v-card flat class="pa-2 playlist-drawer">
      <!-- 顶部标题 -->
      <v-card-title class="d-flex align-center justify-space-between py-3">
        <span class="text-subtitle-1">
          <v-icon start>mdi-playlist-music</v-icon>
          播放列表
        </span>
        <v-chip size="small" variant="tonal"> {{ player.playlist.value.length }} 首 </v-chip>
      </v-card-title>
      <v-divider></v-divider>

      <!-- 列表 -->
      <v-list lines="two" class="pa-2 playlist-list">
        <v-list-item
          v-for="(item, index) in player.playlist.value"
          :key="item.id"
          @click="player.playIndex(index, true)"
          class="song-item"
          :class="{ active: player.currentTrack?.value?.id === item.id }"
        >
          <template v-slot:prepend>
            <v-avatar size="48" rounded="lg">
              <v-img :src="item.picUrl" cover>
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon color="grey-lighten-2" size="small">mdi-music-note</v-icon>
                  </div>
                </template>
              </v-img>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium text-body-2">
            {{ item.name }}
          </v-list-item-title>

          <v-list-item-subtitle class="mt-1">
            <span class="text-truncate">
              <v-icon size="x-small" class="mr-1">mdi-account-music</v-icon>
              {{ item.artist }}
            </span>
          </v-list-item-subtitle>

          <template v-slot:append>
            <v-btn
              icon="mdi-play-circle"
              size="small"
              variant="text"
              @click.stop="player.playIndex(index, true)"
            />
          </template>
        </v-list-item>
      </v-list>

      <!-- 空状态 -->
      <v-empty-state
        v-if="player.playlist.value.length === 0"
        icon="mdi-music-off"
        title="播放列表为空"
        text="暂无歌曲"
        class="empty-state"
      >
      </v-empty-state>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { navigationrightShow } from './state'
import { player } from '@/staic'

const props = defineProps({
  location: {
    type: String as PropType<'bottom' | 'end' | 'left' | 'right' | 'start' | 'top'>,
    default: 'right',
  },
})

// 抽屉显示位置
const computedLocation = computed(() => props.location)

// 根据位置计算抽屉宽度/高度
const drawerWidth = computed(() => {
  if (computedLocation.value === 'bottom' || computedLocation.value === 'top') {
    // 底部或顶部抽屉：占屏幕高度的 50%
    return window.innerHeight * 0.5
  }
  // 左右侧抽屉：占屏幕宽度的 40%
  return window.innerWidth * 0.4
})
</script>

<style scoped>
.playlist-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100vh;
  overflow: hidden;
}

/* 强制列表容器可以滚动 */
:deep(.playlist-list) {
  flex: 1;
  min-height: 0;
  overflow-y: auto !important;
  overflow-x: hidden;
  /* 确保滚动条可见 */
  scrollbar-width: thin;
}

/* 针对 Vuetify v-list 的特殊处理 */
:deep(.v-list) {
  overflow-y: auto !important;
}

.song-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.song-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(4px);
}

.song-item:active {
  background-color: rgba(var(--v-theme-primary), 0.12);
}

.song-item.active {
  background-color: rgba(var(--v-theme-primary), 0.15);
  border-left: 3px solid var(--v-theme-primary);
}

.empty-state {
  margin-top: 48px;
}

/* 避免被其它 fixed UI 遮住 */
:deep(.v-navigation-drawer) {
  z-index: 99999 !important;
}
</style>
