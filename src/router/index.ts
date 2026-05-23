import MusicPlaylist from '@/components/MusicPlaylist.vue'
import RecommendView from '@/components/RecommendView.vue'
import TopView from '@/components/TopView.vue'
import SearchView from '@/components/SerchView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'RecommendView',
    component: RecommendView,
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
  {
    path: '/Search',
    name: 'SearchView',
    component: SearchView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
