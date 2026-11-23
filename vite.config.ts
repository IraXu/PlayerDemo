import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

// animal-island-vue 内置了 Noto Sans SC 全量中文字体，单个字重 1.1MB，
// 首屏会额外下载 3.4MB。这里去掉中文字体（保留 latin / Nunito），
// 中文交给系统字体（PingFang SC / 微软雅黑）兜底，视觉差异很小。
function dropCjkWebFonts(): Plugin {
  const cjkFontFace = /@font-face\{[^}]*chinese-simplified[^}]*\}/g
  return {
    name: 'drop-cjk-webfonts',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('animal-island-vue') || !/\.css(\?|$)/.test(id)) return null
      return code.replace(cjkFontFace, '')
    },
  }
}

export default defineConfig(({ mode }) => ({
  // GitHub Pages 项目站点部署在 /PlayerDemo/ 子路径下；
  // preview 也使用 production mode，这样本地能按线上路径验证 SW / manifest
  base: mode === 'production' ? '/PlayerDemo/' : '/',
  plugins: [vue(), dropCjkWebFonts()],
  server: {
    host: '127.0.0.1',
    port: 5273,
  },
}))
