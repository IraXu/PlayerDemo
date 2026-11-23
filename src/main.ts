import { createApp } from 'vue'
import 'animal-island-vue/style'
import App from './App.vue'
import './styles.css'

createApp(App).mount('#app')

// 只在生产环境注册，开发时避免缓存干扰热更新
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => undefined)
  })
}
