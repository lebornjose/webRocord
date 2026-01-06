<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1 class="page-title">数据统计</h1>
      <p style="color: #666">录制记录概览和统计信息</p>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16" style="margin-bottom: 24px">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :loading="loading">
          <a-statistic
            title="总录制数"
            :value="stats.totalRecordings"
            :prefix="h(VideoCameraOutlined)"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :loading="loading">
          <a-statistic
            title="总观看次数"
            :value="stats.totalViews"
            :prefix="h(EyeOutlined)"
            :value-style="{ color: '#52c41a' }"
          />
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :loading="loading">
          <a-statistic
            title="今日录制"
            :value="stats.todayRecordings"
            :prefix="h(ClockCircleOutlined)"
            :value-style="{ color: '#faad14' }"
          />
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card :loading="loading">
          <a-statistic
            title="活跃录制"
            :value="stats.activeRecordings"
            :prefix="h(FireOutlined)"
            :value-style="{ color: '#f5222d' }"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近录制 -->
    <a-card title="最近录制" :loading="loading">
      <a-list
        :data-source="recentRecordings"
        :locale="{ emptyText: '暂无录制数据' }"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <a @click="viewRecording(item._id)">{{ item.metadata?.title }}</a>
              </template>
              <template #description>
                <a-space>
                  <span>
                    <calendar-outlined />
                    {{ formatDate(item.metadata?.recordedAt) }}
                  </span>
                  <span v-if="item.metadata?.url">
                    <link-outlined />
                    {{ item.metadata?.url }}
                  </span>
                  <span>
                    <eye-outlined />
                    观看 {{ item.stats?.viewCount }} 次
                  </span>
                </a-space>
              </template>
            </a-list-item-meta>
            <template #actions>
              <a-button type="link" @click="viewRecording(item._id)">
                查看详情
              </a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>

      <div style="text-align: center; margin-top: 16px">
        <a-button type="link" @click="goToRecordings">
          查看全部录制 <arrow-right-outlined />
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  VideoCameraOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  FireOutlined,
  CalendarOutlined,
  LinkOutlined,
  ArrowRightOutlined
} from '@ant-design/icons-vue'
import recordingApi from '@/api/recording'

const router = useRouter()
const loading = ref(false)
const stats = ref({
  totalRecordings: 0,
  totalViews: 0,
  todayRecordings: 0,
  activeRecordings: 0
})
const recentRecordings = ref([])

const fetchStatistics = async () => {
  loading.value = true
  try {
    const result = await recordingApi.getStatistics()
    if (result.success) {
      stats.value = {
        totalRecordings: result.data.totalRecordings || 0,
        totalViews: result.data.totalViews || 0,
        todayRecordings: result.data.todayRecordings || 0,
        activeRecordings: result.data.activeRecordings || 0
      }
      recentRecordings.value = result.data.recentRecordings || []
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    message.error('获取统计信息失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const viewRecording = (id) => {
  router.push(`/recordings/${id}`)
}

const goToRecordings = () => {
  router.push('/recordings')
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.dashboard-container {
  /* Styles already defined in global styles.css */
}
</style>
