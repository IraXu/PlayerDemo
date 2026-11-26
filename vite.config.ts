import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/PlayerDemo/' : '/',
  plugins: [vue()],
  server: { host: '127.0.0.1', port: 5273 },
}))
