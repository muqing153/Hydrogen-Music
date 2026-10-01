import { createApp } from 'vue'
// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'unfonts.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import router from './router'

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
// 加载桌面端应用（已放弃小屏/移动端适配）
import('./App.vue').then(({ default: App }) => {
  createApp(App).use(vuetify).use(router).mount('#app')
})
