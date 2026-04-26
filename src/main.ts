import { createApp, ref } from 'vue'
import App from './App.vue'
// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'unfonts.css'
import { createVuetify, useTheme } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import { AudioPlayer } from './player'
import router from './router'
import AppPhone from './AppPhone.vue'
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
function isMobile() {
  const userAgent = navigator.userAgent
  const mobileAgents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
  return mobileAgents.some((agent) => userAgent.includes(agent))
}
export const navigationrightShow = ref(false)
if (isMobile()) {
  createApp(AppPhone).use(vuetify).use(router).mount('#app')
} else {
  createApp(App).use(vuetify).use(router).mount('#app')
}