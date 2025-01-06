import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 引入 router
import './style.css';


const app = createApp(App);
app.use(router); // 使用 router
app.mount('#app');
