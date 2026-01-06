import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据统计' }
      },
      {
        path: '/recordings',
        name: 'Recordings',
        component: () => import('@/views/RecordingList.vue'),
        meta: { title: '录制列表' }
      },
      {
        path: '/recordings/:id',
        name: 'RecordingDetail',
        component: () => import('@/views/RecordingDetail.vue'),
        meta: { title: '录制详情' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
