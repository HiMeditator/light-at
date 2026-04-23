import './assets/css/main.css';
import 'katex/dist/katex.min.css';
// import "@vscode-elements/elements/dist/bundled.js";

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from '@/i18n'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(i18n)
app.mount('#app')
