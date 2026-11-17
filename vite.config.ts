import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  // GitHub Pages 项目站点部署在 /PlayerDemo/ 子路径下，构建时需要带上 base
  base: command === 'build' ? '/PlayerDemo/' : '/',
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5273,
  },
}))
