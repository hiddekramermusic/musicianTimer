import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { WebSocketServer } from 'ws'
import './assets/main.css'

const app = createApp(App)

app.use(router);

app.mount('#app')
