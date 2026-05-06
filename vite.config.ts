import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
// import vueDevTools from 'vite-plugin-vue-devtools'

import wasm from 'vite-plugin-wasm'

import ViteFonts from 'unplugin-fonts/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ViteFonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
        ],
      },
    }),
    wasm(),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 2026,
    open: true,
    allowedHosts: [
      'muqingcandy.cn',
      // 如果你还想通过 localhost 访问，也可以加上
      'localhost',
      '127.0.0.1',
    ],
    proxy: {
      '/api': {
        target: 'http://192.168.124.4:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
