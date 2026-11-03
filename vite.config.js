import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { seoPages } from './scripts/vite-seo.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoPages()],
  appType: 'mpa',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
