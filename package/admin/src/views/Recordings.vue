<template>
  <div class="recordings-page">
    <!-- 操作栏 -->
    <div class="toolbar">
      <a-space>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索标题、描述..."
          style="width: 300px"
          @search="handleSearch"
          allow-clear
        >
          <template #enterButton>
            <a-button type="primary">
              <template #icon><search-outlined /></template>
              搜索
            </a-button>
          </template>
        </a-input-search>

        <a-select
          v-model:value="filterTag"
          placeholder="按标签筛选"
          style="width: 150px"
          allow-clear
          @change="handleTagFilter"
        >
          <a-select-option value="">全部标签</a-select-option>
          <a-select-option value="表单">表单</a-select-option>
          <a-select-option value="用户操作">用户操作</a-select-option>
          <a-select-option value="bug">Bug</a-select-option>
          <a-select-option value="测试">测试</a-select-option>
        </a-select>

        <a-button @click="handleRefresh">
          <template #icon><reload-outlined /></template>
          刷新
        </a-button>
      </a-space>

      <a-space>
        <a-button
          type="primary"
          danger
          :disabled="!hasSelected"
          @click="handleBatchDelete"
        >
          <template #icon><delete-outlined /></template>
          批量删除
        </a-button>
        <a-dropdown>
          <a-button>
            导出 <down-outlined />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="1">导出为 JSON</a-menu-item>
              <a-menu-item key="2">导出为 CSV</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
    </div>

    <!-- 统计信息 -->
    <a-alert
      v-if="hasSelected"
      :message="`已选择 ${selectedRowKeys.length} 项`"
      type="info"
      show-icon
      closable
      style="margin-bottom: 16px"
    />

    <!-- 数据表格 -->
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      :scroll="{ x: 1200 }"
      @change="handleTableChange"
      row-key="recordingId"
    >
      <!-- 标题列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'title'">
          <a @click="viewDetail(record)">
            {{ record.metadata?.title || '未命名录制' }}
          </a>
        </template>

        <!-- 标签列 -->
        <template v-else-if="column.key === 'tags'">
          <a-tag
            v-for="tag in record.metadata?.tags"
            :key="tag"
            :color="getTagColor(tag)"
          >
            {{ tag }}
          </a-tag>
        </template>

        <!-- 时长列 -->
        <template v-else-if="column.key === 'duration'">
          {{ formatDuration(record.metadata?.duration) }}
        </template>

        <!-- 事件数列 -->
        <template v-else-if="column.key === 'eventCount'">
          <a-badge
            :count="record.metadata?.eventCount || 0"
            :number-style="{ backgroundColor: '#52c41a' }"
          />
        </template>

        <!-- 创建时间列 -->
        <template v-else-if="column.key === 'createdAt'">
          <a-tooltip :title="formatFullTime(record.createdAt)">
            {{ formatRelativeTime(record.createdAt) }}
          </a-tooltip>
        </template>

        <!-- 查看次数列 -->
        <template v-else-if="column.key === 'viewCount'">
          <a-statistic
            :value="record.stats?.viewCount || 0"
            :value-style="{ fontSize: '14px' }"
          >
            <template #prefix>
              <eye-outlined />
            </template>
          </a-statistic>
        </template>

        <!-- 操作列 -->
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="viewPlayback(record)">
              <play-circle-outlined /> 回放
            </a-button>
            <a-button type="link" size="small" @click="editRecord(record)">
              <edit-outlined /> 编辑
            </a-button>
            <a-popconfirm
              title="确定要删除这条录制吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="deleteRecord(record)"
            >
              <a-button type="link" size="small" danger>
                <delete-outlined /> 删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 编辑对话框 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑录制信息"
      @ok="handleEditSubmit"
      @cancel="handleEditCancel"
      width="600px"
    >
      <a-form
        :model="editForm"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
      >
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
            style="width: 100%"
            placeholder="输入标签后按回车"
          >
            <a-select-option value="表单">表单</a-select-option>
            <a-select-option value="用户操作">用户操作</a-select-option>
            <a-select-option value="bug">Bug</a-select-option>
            <a-select-option value="测试">测试</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  DownOutlined,
  PlayCircleOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'
import {
  getRecordingList,
  searchRecordings,
  updateRecording,
  deleteRecording,
  batchDelete
} from '@/api/recording'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()

// 数据
const loading = ref(false)
const dataSource = ref([])
const searchKeyword = ref('')
const filterTag = ref(undefined)
const selectedRowKeys = ref([])

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
})

// 编辑
const editModalVisible = ref(false)
const editForm = ref({
  recordingId: '',
  title: '',
  description: '',
  tags: []
})

// 表格列定义
const columns = [
  {
    title: '标题',
    key: 'title',
    dataIndex: ['metadata', 'title'],
    width: 250,
    ellipsis: true
  },
  {
    title: '标签',
    key: 'tags',
    dataIndex: ['metadata', 'tags'],
    width: 200
  },
  {
    title: '事件数',
    key: 'eventCount',
    dataIndex: ['metadata', 'eventCount'],
    width: 100,
    align: 'center',
    sorter: true
  },
  {
    title: '时长',
    key: 'duration',
    dataIndex: ['metadata', 'duration'],
    width: 100,
    sorter: true
  },
  {
    title: '查看次数',
    key: 'viewCount',
    dataIndex: ['stats', 'viewCount'],
    width: 120,
    align: 'center',
    sorter: true
  },
  {
    title: '创建时间',
    key: 'createdAt',
    dataIndex: 'createdAt',
    width: 150,
    sorter: true
  },
  {
    title: '操作',
    key: 'actions',
    fixed: 'right',
    width: 220
  }
]

// 计算属性
const hasSelected = computed(() => selectedRowKeys.value.length > 0)

const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  }
}))

// 方法
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      sortBy: 'metadata.recordedAt',
      order: 'desc'
    }

    if (filterTag.value) {
      params.tag = filterTag.value
    }

    let result
    if (searchKeyword.value) {
      result = await searchRecordings({
        q: searchKeyword.value,
        ...params
      })
    } else {
      result = await getRecordingList(params)
    }

    if (result.success) {
      dataSource.value = result.data
      pagination.value.total = result.pagination?.total || result.data.length
    }
  } catch (error) {
    message.error('获取数据失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1
  fetchData()
}

const handleTagFilter = () => {
  pagination.value.current = 1
  fetchData()
}

const handleRefresh = () => {
  searchKeyword.value = ''
  filterTag.value = undefined
  selectedRowKeys.value = []
  pagination.value.current = 1
  fetchData()
}

const handleTableChange = (pag, filters, sorter) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  fetchData()
}

const viewDetail = (record) => {
  router.push(`/recordings/${record.recordingId}`)
}

const viewPlayback = (record) => {
  const url = `/api/playback/${record.recordingId}`
  window.open(url, '_blank')
}

const editRecord = (record) => {
  editForm.value = {
    recordingId: record.recordingId,
    title: record.metadata?.title || '',
    description: record.metadata?.description || '',
    tags: record.metadata?.tags || []
  }
  editModalVisible.value = true
}

const handleEditSubmit = async () => {
  try {
    await updateRecording(editForm.value.recordingId, {
      metadata: {
        title: editForm.value.title,
        description: editForm.value.description,
        tags: editForm.value.tags
      }
    })
    message.success('更新成功')
    editModalVisible.value = false
    fetchData()
  } catch (error) {
    message.error('更新失败: ' + error.message)
  }
}

const handleEditCancel = () => {
  editModalVisible.value = false
}

const deleteRecord = async (record) => {
  try {
    await deleteRecording(record.recordingId, { permanent: false })
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败: ' + error.message)
  }
}

const handleBatchDelete = async () => {
  try {
    await batchDelete(selectedRowKeys.value)
    message.success(`成功删除 ${selectedRowKeys.value.length} 条记录`)
    selectedRowKeys.value = []
    fetchData()
  } catch (error) {
    message.error('批量删除失败: ' + error.message)
  }
}

// 工具函数
const getTagColor = (tag) => {
  const colorMap = {
    '表单': 'blue',
    '用户操作': 'green',
    'bug': 'red',
    '测试': 'orange'
  }
  return colorMap[tag] || 'default'
}

const formatDuration = (ms) => {
  if (!ms) return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return minutes > 0 ? `${minutes}分${remainingSeconds}秒` : `${remainingSeconds}秒`
}

const formatRelativeTime = (date) => {
  return dayjs(date).fromNow()
}

const formatFullTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.recordings-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}
</style>

