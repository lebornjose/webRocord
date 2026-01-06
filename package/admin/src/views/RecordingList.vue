<template>
  <div class="recording-list-container">
    <div class="page-header">
      <h1 class="page-title">录制列表</h1>
      
      <a-space style="margin-top: 16px">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索录制记录..."
          enter-button
          style="width: 300px"
          @search="handleSearch"
        />
        
        <a-select
          v-model:value="filterTag"
          placeholder="选择标签"
          style="width: 150px"
          allowClear
          @change="handleFilter"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="表单">表单</a-select-option>
          <a-select-option value="bug">Bug</a-select-option>
          <a-select-option value="用户操作">用户操作</a-select-option>
        </a-select>

        <a-button @click="fetchRecordings">
          <template #icon><reload-outlined /></template>
          刷新
        </a-button>
      </a-space>
    </div>

    <a-table
      :columns="columns"
      :data-source="recordings"
      :loading="loading"
      :pagination="pagination"
      row-key="_id"
      @change="handleTableChange"
    >
      <!-- 标题列 -->
      <template #title="{ record }">
        <a @click="viewDetail(record._id)">{{ record?.metadata?.title || '未命名' }}</a>
      </template>

      <!-- 标签列 -->
      <template #tags="{ record }">
        <a-tag
          v-for="tag in (record.metadata?.tags || [])"
          :key="tag"
          :color="getTagColor(tag)"
        >
          {{ tag }}
        </a-tag>
      </template>

      <!-- 录制时间列 -->
      <template #recordedAt="{ record }">
        {{ formatDate(record.metadata?.recordedAt) }}
      </template>

      <!-- 时长列 -->
      <template #duration="{ record }">
        {{ formatDuration(record.metadata?.duration) }}
      </template>

      <!-- 事件数列 -->
      <template #eventCount="{ record }">
        <a-badge
          :count="record.metadata?.eventCount || 0"
          :number-style="{ backgroundColor: '#52c41a' }"
        />
      </template>

      <!-- 观看次数列 -->
      <template #viewCount="{ record }">
        <a-space>
          <eye-outlined />
          {{ record.stats?.viewCount || 0 }}
        </a-space>
      </template>

      <!-- 状态列 -->
      <template #status="{ record }">
        <a-tag :color="record.status === 'active' ? 'green' : 'default'">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>

      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a-button type="link" size="small" @click="viewDetail(record.recordingId)">
            回放
          </a-button>
          <a-button type="link" size="small" @click="router.push(`/recordings/${record._id}`)">
            详情
          </a-button>
          <a-dropdown>
            <a-button type="link" size="small">
              更多 <down-outlined />
            </a-button>
            <template #overlay>
              <a-menu @click="({ key }) => handleAction(key, record)">
                <a-menu-item key="edit">
                  <edit-outlined />
                  编辑
                </a-menu-item>
                <a-menu-item key="download">
                  <download-outlined />
                  导出
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="delete" danger>
                  <delete-outlined />
                  删除
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </a-space>
      </template>
    </a-table>

    <!-- 编辑对话框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑录制信息"
      @ok="handleEditSubmit"
      @cancel="editModalVisible = false"
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

    <!-- 回放对话框 -->
    <a-modal
      v-model:open="playbackModalVisible"
      title="录制回放"
      width="90%"
      :footer="null"
      @cancel="handleClosePlayback"
    >
      <div ref="replayer" class="replay-container" style="min-height: 600px;"></div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import rrwebPlayer from 'rrweb-player'
import { record, getRecordConsolePlugin, getReplayConsolePlugin } from 'rrweb'
import {
  ReloadOutlined,
  EyeOutlined,
  DownOutlined,
  EditOutlined,
  DownloadOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import recordingApi from '@/api/recording'

const replayer = ref(null)
const router = useRouter()
const loading = ref(false)
const recordings = ref([])
const searchKeyword = ref('')
const filterTag = ref('')
const editModalVisible = ref(false)
const playbackModalVisible = ref(false)
const currentEditId = ref(null)
let playerInstance = null

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条记录`
})

const editForm = reactive({
  title: '',
  description: '',
  tags: []
})

const columns = [
  {
    title: '标题',
    key: 'title',
    slots: { customRender: 'title' },
    width: 250
  },
  {
    title: '标签',
    key: 'tags',
    slots: { customRender: 'tags' },
    width: 150
  },
  {
    title: '录制时间',
    key: 'recordedAt',
    slots: { customRender: 'recordedAt' },
    width: 180,
    sorter: true
  },
  {
    title: '时长',
    key: 'duration',
    slots: { customRender: 'duration' },
    width: 100
  },
  {
    title: '事件数',
    key: 'eventCount',
    slots: { customRender: 'eventCount' },
    width: 100
  },
  {
    title: '观看次数',
    key: 'viewCount',
    slots: { customRender: 'viewCount' },
    width: 120
  },
  {
    title: '状态',
    key: 'status',
    slots: { customRender: 'status' },
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' },
    width: 200,
    fixed: 'right'
  }
]

const fetchRecordings = async () => {
  console.log('fetchRecordings called')
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize
    }

    if (filterTag.value) {
      params.tag = filterTag.value
    }

    console.log('Fetching with params:', params)
    const result = await recordingApi.getRecordingList(params)
    console.log('API result:', result)
    
    if (result.success) {
      recordings.value = result.data || []
      pagination.total = result.pagination?.total || result.data?.length || 0
      console.log('Loaded recordings:', recordings.value.length)
    }
  } catch (error) {
    console.error('Failed to fetch recordings:', error)
    message.error('获取录制列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    fetchRecordings()
    return
  }

  loading.value = true
  try {
    const result = await recordingApi.searchRecordings(searchKeyword.value, {
      page: pagination.current,
      limit: pagination.pageSize
    })

    if (result.success) {
      recordings.value = result.data
      pagination.total = result.pagination?.total || result.data.length
    }
  } catch (error) {
    console.error('Search failed:', error)
    message.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  pagination.current = 1
  fetchRecordings()
}

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchRecordings()
}

const viewDetail = async (recordingId) => {
  try {
    loading.value = true
    const res = await recordingApi.getRecording(recordingId, true)
    
    if (!res.success || !res.data || !res.data.events) {
      message.error('无法获取录制数据')
      return
    }

    // 显示模态框
    playbackModalVisible.value = true
    
    // 等待 DOM 更新
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (!replayer.value) {
      message.error('播放器容器未就绪')
      return
    }

    // 清理之前的播放器实例
    if (playerInstance) {
      try {
        playerInstance.$destroy()
      } catch (e) {
        console.log('清理播放器实例失败', e)
      }
    }

    // 创建新的播放器实例
    playerInstance = new rrwebPlayer({
      target: replayer.value,
      props: {
        events: res.data.events,
        width: 800,
        height: 600,
        autoPlay: false,
        showController: true,
        skipInactive: true,
        plugins: [
          getReplayConsolePlugin({
            level: ['info', 'log', 'warn', 'error'],
          }),
        ],
      },
    })

    console.log('播放器创建成功')
  } catch (error) {
    console.error('播放录制失败:', error)
    message.error('播放失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleClosePlayback = () => {
  // 关闭模态框时清理播放器
  if (playerInstance) {
    try {
      playerInstance.$destroy()
      playerInstance = null
    } catch (e) {
      console.log('清理播放器实例失败', e)
    }
  }
  playbackModalVisible.value = false
}



const handleAction = async (action, record) => {
  switch (action) {
    case 'edit':
      currentEditId.value = record._id
      editForm.title = record.metadata?.title || ''
      editForm.description = record.metadata?.description || ''
      editForm.tags = record.metadata?.tags || []
      editModalVisible.value = true
      break

    case 'download':
      message.info('导出功能开发中...')
      break

    case 'delete':
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除录制 "${record.metadata?.title || '未命名'}" 吗？`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          try {
            await recordingApi.deleteRecording(record._id)
            message.success('删除成功')
            fetchRecordings()
          } catch (error) {
            console.error('Delete error:', error)
            message.error('删除失败: ' + error.message)
          }
        }
      })
      break
  }
}

const handleEditSubmit = async () => {
  try {
    await recordingApi.updateRecording(currentEditId.value, {
      metadata: {
        title: editForm.title,
        description: editForm.description,
        tags: editForm.tags
      }
    })
    message.success('更新成功')
    editModalVisible.value = false
    fetchRecordings()
  } catch (error) {
    message.error('更新失败')
  }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
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
  console.log('RecordingList component mounted')
  fetchRecordings()
})
</script>

<style scoped>
.replay-container {
  width: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 确保 rrweb-player 的样式正确加载 */
:deep(.rr-player) {
  width: 100% !important;
}

:deep(.rr-player__frame) {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
</style>

