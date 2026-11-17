import { createApp } from 'vue'
import { Button, Slider, Tag, Tooltip } from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import App from './App.vue'
import './styles.css'

createApp(App).use(Button).use(Slider).use(Tag).use(Tooltip).mount('#app')
