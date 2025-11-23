import { createApp, ref } from 'vue'
import App from './App.vue'
// Vuetify
import 'unfonts.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
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

export const currentComponent = ref('RecommendView')
export function changeComponent(name: string) {
  currentComponent.value = name
}
createApp(App).use(vuetify).mount('#app')
