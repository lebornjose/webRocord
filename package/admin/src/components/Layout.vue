<template>
  <a-layout style="min-height: 100vh">
    <!-- 侧边栏 -->
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo">
        <VideoCameraOutlined />
        <span v-if="!collapsed">录制管理</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      >
        <a-menu-item key="dashboard">
          <dashboard-outlined />
          <span>仪表板</span>
        </a-menu-item>
        <a-menu-item key="recordings">
          <video-camera-outlined />
          <span>录制记录</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout>
      <!-- 顶部导航栏 -->
      <a-layout-header style="background: #fff; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
        <a-breadcrumb>
          <a-breadcrumb-item>
            <home-outlined />
          </a-breadcrumb-item>
          <a-breadcrumb-item>{{ currentTitle }}</a-breadcrumb-item>
        </a-breadcrumb>
        
        <a-space>
          <a-badge :count="notificationCount" :offset="[-5, 5]">
            <a-button type="text" shape="circle">
              <template #icon><bell-outlined /></template>
            </a-button>
          </a-badge>
          <a-dropdown>
            <a-button type="text">
              <user-outlined /> 管理员
              <down-outlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <user-outlined /> 个人信息
                </a-menu-item>
                <a-menu-item key="settings">
                  <setting-outlined /> 设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout">
                  <logout-outlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content style="margin: 24px 16px; padding: 24px; background: #fff; min-height: 280px">
        <router-view />
      </a-layout-content>

      <!-- 底部 -->
      <a-layout-footer style="text-align: center">
        rrweb Recording Admin ©{{ currentYear }}
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DashboardOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  BellOutlined,
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const selectedKeys = ref(['dashboard'])
const notificationCount = ref(5)
const currentYear = new Date().getFullYear()

const currentTitle = computed(() => {
  return route.meta.title || '首页'
})

watch(
  () => route.path,
  (path) => {
    const key = path.split('/')[1] || 'dashboard'
    selectedKeys.value = [key]
  },
  { immediate: true }
)

const handleMenuClick = ({ key }) => {
  router.push(`/${key}`)
}
</script>

<style scoped>
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.logo span {
  white-space: nowrap;
}

:deep(.ant-layout-sider-collapsed) .logo span {
  display: none;
}
</style>

