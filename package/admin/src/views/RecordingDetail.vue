<template>
  <div class="recording-detail-container">
    <a-page-header
      title="录制详情"
      @back="() => $router.back()"
      style="padding: 0 0 24px 0"
    >
      <template #extra>
        <a-space>
          <a-button type="primary" @click="playRecording">
            <template #icon><play-circle-outlined /></template>
            回放录制
          </a-button>
          <a-button @click="editModalVisible = true">
            <template #icon><edit-outlined /></template>
            编辑
          </a-button>
          <a-button danger @click="handleDelete">
            <template #icon><delete-outlined /></template>
            删除
          </a-button>
        </a-space>
      </template>
    </a-page-header>

    <a-spin :spinning="loading">
      <a-row :gutter="16">
        <!-- 左侧：基本信息 -->
        <a-col :xs="24" :lg="16">
          <a-card title="基本信息" style="margin-bottom: 16px">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="标题" :span="2">
                {{ recording.metadata?.title }}
              </a-descriptions-item>
              
              <a-descriptions-item label="录制ID" :span="2">
                <a-typography-text copyable>
                  {{ recording.recordingId }}
                </a-typography-text>
              </a-descriptions-item>

              <a-descriptions-item label="URL">
                <a :href="recording.metadata?.url" target="_blank">
                  {{ recording.metadata?.url }}
                </a>
              </a-descriptions-item>

              <a-descriptions-item label="录制时间">
                {{ formatDate(recording.metadata?.recordedAt) }}
              </a-descriptions-item>

              <a-descriptions-item label="时长">
                {{ formatDuration(recording.metadata?.duration) }}
              </a-descriptions-item>

              <a-descriptions-item label="事件数">
                <a-badge
                  :count="recording.metadata?.eventCount"
                  :number-style="{ backgroundColor: '#52c41a' }"
                />
              </a-descriptions-item>

              <a-descriptions-item label="用户ID">
                {{ recording.metadata?.userId || '-' }}
              </a-descriptions-item>

              <a-descriptions-item label="状态">
                <a-tag :color="recording.status === 'active' ? 'green' : 'default'">
                  {{ getStatusText(recording.status) }}
                </a-tag>
              </a-descriptions-item>

              <a-descriptions-item label="标签" :span="2">
                <a-space>
                  <a-tag
                    v-for="tag in recording.metadata?.tags"
                    :key="tag"
                    :color="getTagColor(tag)"
                  >
                    {{ tag }}
                  </a-tag>
                </a-space>
              </a-descriptions-item>

              <a-descriptions-item label="描述" :span="2">
                {{ recording.metadata?.description || '-' }}
              </a-descriptions-item>

              <a-descriptions-item label="User Agent" :span="2">
                <a-typography-text code style="font-size: 12px">
                  {{ recording.metadata?.userAgent }}
                </a-typography-text>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 回放预览 -->
          <a-card title="回放预览">
            <div ref="playerContainer" class="player-container">
              <a-empty v-if="!recording.events || recording.events.length === 0" description="没有录制数据" />
            </div>
          </a-card>
        </a-col>

        <!-- 右侧：统计信息 -->
        <a-col :xs="24" :lg="8">
          <a-card title="统计信息" style="margin-bottom: 16px">
            <div class="stat-item">
              <div class="stat-label">观看次数</div>
              <div class="stat-value">{{ recording.stats?.viewCount || 0 }}</div>
            </div>
            <a-divider />
            <div class="stat-item">
              <div class="stat-label">最后观看</div>
              <div class="stat-text">
                {{ recording.stats?.lastViewedAt ? formatDate(recording.stats.lastViewedAt) : '从未观看' }}
              </div>
            </div>
            <a-divider />
            <div class="stat-item">
              <div class="stat-label">创建时间</div>
              <div class="stat-text">{{ formatDate(recording.createdAt) }}</div>
            </div>
            <a-divider />
            <div class="stat-item">
              <div class="stat-label">更新时间</div>
              <div class="stat-text">{{ formatDate(recording.updatedAt) }}</div>
            </div>
          </a-card>

          <a-card title="快速操作">
            <a-space direction="vertical" style="width: 100%">
              <a-button block @click="playRecording">
                <play-circle-outlined />
                在新窗口回放
              </a-button>
              <a-button block @click="copyPlaybackUrl">
                <link-outlined />
                复制回放链接
              </a-button>
              <a-button block @click="downloadRecording">
                <download-outlined />
                导出数据
              </a-button>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>

    <!-- 编辑对话框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑录制信息"
      @ok="handleEditSubmit"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="标题">
          <a-input v-model:value="editForm.title" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="editForm.description" :rows="4" />
        </a-form-item>
        <a-form-item label="标签">
          <a-select
            v-model:value="editForm.tags"
            mode="tags"
            placeholder="输入标签"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import rrwebPlayer from 'rrweb-player'
import 'rrweb-player/dist/style.css'
import {
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'
import recordingApi from '@/api/recording'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const recording = ref({})
const editModalVisible = ref(false)
const playerContainer = ref(null)
let player = null

const editForm = reactive({
  title: '',
  description: '',
  tags: []
})

const fetchRecordingDetail = async () => {
  loading.value = true
  try {
    const result = await recordingApi.getRecording(route.params.id, true)
    
    if (result.success) {
      recording.value = result.data
      
      // 初始化播放器
      await nextTick()
      if (recording.value.events && recording.value.events.length > 0) {
        initPlayer()
      }
    }
  } catch (error) {
    console.error('Failed to fetch recording:', error)
    message.error('获取录制详情失败')
  } finally {
    loading.value = false
  }
}

const initPlayer = () => {
  if (!playerContainer.value || !recording.value.events) return

  try {
    player = new rrwebPlayer({
      target: playerContainer.value,
      props: {
        events: recording.value.events,
        width: 800,
        height: 600,
        autoPlay: false
      }
    })
  } catch (error) {
    console.error('Failed to initialize player:', error)
    message.error('初始化播放器失败')
  }
}

const playRecording = () => {
  const url = recordingApi.getPlaybackUrl(route.params.id)
  window.open(url, '_blank')
}

const copyPlaybackUrl = () => {
  const url = window.location.origin + recordingApi.getPlaybackUrl(route.params.id)
  navigator.clipboard.writeText(url)
  message.success('回放链接已复制到剪贴板')
}

const downloadRecording = () => {
  const dataStr = JSON.stringify(recording.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `recording-${recording.value.recordingId}.json`
  link.click()
  URL.revokeObjectURL(url)
  message.success('开始下载')
}

const handleEditSubmit = async () => {
  try {
    await recordingApi.updateRecording(route.params.id, {
      metadata: {
        title: editForm.title,
        description: editForm.description,
        tags: editForm.tags
      }
    })
    message.success('更新成功')
    editModalVisible.value = false
    fetchRecordingDetail()
  } catch (error) {
    message.error('更新失败')
  }
}

const handleDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除录制 "${recording.value.metadata?.title}" 吗？`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await recordingApi.deleteRecording(route.params.id)
        message.success('删除成功')
        router.push('/recordings')
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const formatDuration = (duration) => {
  if (!duration) return '-'
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getTagColor = (tag) => {
  const colors = {
    '表单': 'blue',
    'bug': 'red',
    '用户操作': 'green',
    'urgent': 'orange'
  }
  return colors[tag] || 'default'
}

const getStatusText = (status) => {
  const statusMap = {
    active: '正常',
    archived: '已归档',
    deleted: '已删除'
  }
  return statusMap[status] || status
}

onMounted(() => {
  fetchRecordingDetail()
  
  // 监听编辑按钮
  editForm.title = recording.value.metadata?.title || ''
  editForm.description = recording.value.metadata?.description || ''
  editForm.tags = recording.value.metadata?.tags || []
})
</script>

<style scoped>
.recording-detail-container {
  /* Styles from global styles.css */
}

.player-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
}

.stat-item {
  text-align: center;
  padding: 8px 0;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
}

.stat-text {
  font-size: 14px;
  color: #333;
}
</style>

