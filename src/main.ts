import { createApp, ref, computed } from 'vue'
// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'unfonts.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import router from './router'

// 全局响应式状态：检测设备是否为移动端
const windowWidth = ref(window.innerWidth)
export const isMobile = computed(() => windowWidth.value <= 768)

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}
window.addEventListener('resize', handleResize)

const vuetify = createVuetify({
  components,
  directives,
  ssr: true,
  theme: {
    defaultTheme: 'system',
  },
  icons: {
    defaultSet: 'mdi',
  },
})
document.addEventListener(
  'visibilitychange',
  (e) => {
    e.stopImmediatePropagation()
  },
  true,
)
// 根据设备类型加载对应的组件
if (isMobile.value) {
  import('./AppPhone.vue').then(({ default: AppPhone }) => {
    createApp(AppPhone).use(vuetify).use(router).mount('#app')
  })
} else {
  import('./App.vue').then(({ default: App }) => {
    createApp(App).use(vuetify).use(router).mount('#app')
  })
}
