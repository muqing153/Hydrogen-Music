<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTheme } from 'vuetify'
// 导入组件
import RecommendView from './components/RecommendView.vue'
import AudioView from './components/AudioView.vue'
import TopView from './components/TopView.vue'
import { player, rightDrawer } from './player'
import buttonPlayer from './bottomPlayer.vue'
import navigationdrawer from './navigation-drawer.vue'
import { currentComponent, changeComponent } from './main'
const theme = useTheme()
// 把组件映射成一个对象，方便切换
const componentsMap: Record<string, any> = {
  RecommendView,
  AudioView,
  TopView
}
player.addTrack('2150435618', true)
</script>

<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer expand-on-hover permanent width="160">
        <v-list>
          <v-list-item prepend-avatar="/favicon.ico" subtitle="未登录" title="用户"></v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list ref="navRef" density="compact" nav>
          <v-list-item prepend-icon="mdi-home-account" title="推荐" value="RecommendView"
            :active="currentComponent === 'RecommendView'" @click="changeComponent('RecommendView')"></v-list-item>
          <v-list-item prepend-icon="mdi-music-note" title="音频" value="AudioView"
            :active="currentComponent === 'AudioView'" @click='changeComponent("AudioView")'></v-list-item>
          <v-list-item prepend-icon="mdi-star" title="排行榜" value="TopView" :active="currentComponent === 'TopView'"
            @click="changeComponent('TopView')"></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <v-main class="pa-5" style="margin-bottom: 100px;">
          <component :is="componentsMap[currentComponent]"></component>
        </v-main>
        <buttonPlayer />
      </v-main>
      <navigationdrawer />
    </v-layout>

  </v-card>
</template>
