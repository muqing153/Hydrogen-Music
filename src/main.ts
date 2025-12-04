import { createApp, ref } from 'vue'
import App from './App.vue'
// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'unfonts.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import { AudioPlayer } from './player'
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

export const navigationrightShow = ref(false)

createApp(App).use(vuetify).use(router).mount('#app')
