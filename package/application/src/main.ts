import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 引入 router
import 'rrweb-player/dist/style.css';
import './style.css';


const app = createApp(App);
app.use(Antd)
app.use(router); // 使用 router
app.mount('#app');
