import { createApp } from 'vue'
import App from './App.vue'
// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'unfonts.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
// import AppPhone from './AppPhone.vue'
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
createApp(App).use(vuetify).use(router).mount('#app')
