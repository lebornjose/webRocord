<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      theme="dark"
      width="250"
    >
      <div class="logo">
        <h2 v-if="!collapsed">rrweb Admin</h2>
        <h2 v-else>RA</h2>
      </div>
      
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      >
        <a-menu-item key="/dashboard">
          <dashboard-outlined />
          <span>数据统计</span>
        </a-menu-item>
        
        <a-menu-item key="/recordings">
          <video-camera-outlined />
          <span>录制列表</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- 主内容区 -->
    <a-layout>
      <!-- 顶部导航栏 -->
      <a-layout-header class="layout-header">
        <menu-unfold-outlined
          v-if="collapsed"
          class="trigger"
          @click="collapsed = !collapsed"
        />
        <menu-fold-outlined
          v-else
          class="trigger"
          @click="collapsed = !collapsed"
        />
        
        <div class="header-right">
          <a-space :size="16">
            <a-badge :count="0">
              <bell-outlined style="font-size: 18px" />
            </a-badge>
            
            <a-dropdown>
              <a-avatar style="cursor: pointer; background-color: #1890ff">
                <template #icon><user-outlined /></template>
              </a-avatar>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile">
                    <user-outlined />
                    个人中心
                  </a-menu-item>
                  <a-menu-item key="settings">
                    <setting-outlined />
                    设置
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout">
                    <logout-outlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>

      <!-- 底部 -->
      <a-layout-footer class="layout-footer">
        <div>rrweb Recording Admin © 2026 Created by rrweb Team</div>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  VideoCameraOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const selectedKeys = ref([route.path])

// 监听路由变化，更新选中的菜单项
watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]
  }
)

const handleMenuClick = ({ key }) => {
  router.push(key)
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  margin: 0;
  color: #fff;
  font-size: 18px;
}

.layout-header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
}

.layout-content {
  margin: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 64px - 70px - 48px);
}

.layout-footer {
  text-align: center;
  background: #f0f2f5;
  padding: 24px 50px;
  color: rgba(0, 0, 0, 0.45);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

