import AudioView from '@/components/AudioView.vue'
import MusicPlaylist from '@/components/MusicPlaylist.vue'
import RecommendView from '@/components/RecommendView.vue'
import TopView from '@/components/TopView.vue'
import { AudioViewShow } from '@/staic'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'RecommendView',
    component: RecommendView,
  },
  {
    path: '/AudioView',
    name: 'AudioView',
    component: AudioView,
  },
  {
    path: '/TopView',
    name: 'TopView',
    component: TopView,
  },
  {
    path: '/MusicPlaylist',
    name: 'MusicPlaylist',
    component: MusicPlaylist,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
router.beforeEach((to, from, next) => {
  if (to.name === 'AudioView') {
    // ⭐ 进入 AudioView 之前修改变量
    AudioViewShow.value = true
    console.log('进入 AudioView，变量已修改')
  }
  next()
})

export default router
