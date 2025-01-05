import { createRouter, createWebHashHistory } from 'vue-router';
import From from '../views/from.vue';
import Home from '../views/index.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home, // 关联 HomeView 组件
  },
  {
    path: '/from',
    name: 'From',
    component: From, // 关联 AboutView 组件
  },
  // ... 其他路由
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
