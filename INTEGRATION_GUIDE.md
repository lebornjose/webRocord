# 前后端集成完成 ✅

## 🎯 完成的集成

### 1. Vite 代理配置

**文件**: `package/application/vite.config.js`

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

现在前端的 `/api` 请求会自动代理到 `http://localhost:3000`

### 2. API 工具类

**文件**: `package/application/src/api/recording.js`

提供完整的 API 方法：
- `saveRecording(events, metadata)` - 保存录制
- `getRecordingList(options)` - 获取列表
- `searchRecordings(keyword, options)` - 搜索
- `getRecording(recordingId, includeEvents)` - 获取指定录制
- `updateRecording(recordingId, metadata)` - 更新元数据
- `deleteRecording(recordingId, permanent)` - 删除
- `getStatistics()` - 获取统计
- `openPlayback(recordingId)` - 打开回放页面

### 3. Vue Composable

**文件**: `package/application/src/composables/useRecording.js`

提供 Vue 3 可组合函数：
- 录制状态管理
- 自动保存到服务器
- 集成 rrweb 和 API

### 4. 更新表单页面

**文件**: `package/application/src/views/from.vue`

新增功能：
- ✅ "保存到服务器" 按钮
- ✅ "查看服务器回放" 按钮
- ✅ 自动生成标题和标签
- ✅ Loading 状态显示

## 🚀 使用流程

### 完整工作流程

```
1. 用户在前端操作表单
   ↓
2. 点击"录制"按钮，rrweb 开始记录
   ↓
3. 用户进行各种操作（输入、点击等）
   ↓
4. 点击"保存到服务器"
   ↓
5. 前端调用 /api/recording/save
   ↓
6. Vite 代理转发到 http://localhost:3000
   ↓
7. Express 服务器接收请求
   ↓
8. 保存到 MongoDB 数据库
   ↓
9. 返回 recordingId
   ↓
10. 点击"查看服务器回放" → 新标签页打开回放
```

## 📝 启动步骤

### 1. 启动 MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community@7.0

# 或使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 验证
mongosh
```

### 2. 启动后端服务器

```bash
cd package/server
npm run dev
```

输出应显示：
```
🔌 正在连接 MongoDB...
✅ MongoDB 连接成功!
   数据库: rrweb_recordings
   主机: localhost

╔══════════════════════════════════════════╗
║   rrweb Recording Server (MongoDB)       ║
║   http://localhost:3000                  ║
╚══════════════════════════════════════════╝
```

### 3. 启动前端应用

```bash
cd package/application
npm run dev
```

输出应显示：
```
VITE v6.4.1  ready in 367 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 4. 测试

1. 打开浏览器访问 http://localhost:5173/#/from
2. 点击"录制"按钮
3. 填写表单，进行各种操作
4. 点击"保存到服务器"
5. 成功后会显示录制 ID
6. 点击"查看服务器回放"查看保存的录制

## 🧪 API 测试

### 测试健康检查

```bash
curl http://localhost:3000/health
```

### 测试前端代理

在浏览器控制台：
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
```

应该成功返回健康检查数据。

## 📊 数据流示意图

```
┌─────────────────────────────────────────┐
│  前端 (localhost:5173)                   │
│                                         │
│  [录制] → [保存到服务器]                │
│     ↓                                    │
│  fetch('/api/recording/save')           │
│     ↓                                    │
│  Vite 代理                               │
└──────────────┬──────────────────────────┘
               │ 转发到
               ↓
┌─────────────────────────────────────────┐
│  后端 (localhost:3000)                   │
│                                         │
│  Express → MongoDB                      │
│     ↓                                    │
│  保存录制数据                            │
│     ↓                                    │
│  返回 { success: true, recordingId }    │
└─────────────────────────────────────────┘
```

## 🔧 故障排除

### 问题 1: 代理不工作

**症状**: 前端请求 `/api` 返回 404

**解决**:
1. 确认后端运行在 3000 端口
2. 重启前端开发服务器
3. 检查浏览器控制台是否有 CORS 错误

### 问题 2: MongoDB 连接失败

**症状**: 后端启动时显示连接错误

**解决**:
```bash
# 检查 MongoDB 是否运行
brew services list | grep mongodb

# 或
docker ps | grep mongo

# 启动 MongoDB
brew services start mongodb-community@7.0
```

### 问题 3: 保存失败

**症状**: 点击"保存到服务器"报错

**解决**:
1. 打开浏览器控制台查看错误
2. 检查后端日志
3. 确认 MongoDB 连接正常
4. 检查网络请求是否正常

## 📈 下一步功能

可以继续添加的功能：

### 1. 录制列表页面

创建 `package/application/src/views/recordings.vue`：

```vue
<template>
  <div>
    <a-table :dataSource="recordings" :columns="columns">
      <template #action="{ record }">
        <a-button @click="viewPlayback(record.id)">查看</a-button>
        <a-button @click="deleteRecording(record.id)">删除</a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import RecordingAPI from '../api/recording';

const recordings = ref([]);

onMounted(async () => {
  const result = await RecordingAPI.getRecordingList();
  recordings.value = result.data;
});
</script>
```

### 2. 搜索功能

### 3. 统计仪表板

### 4. 用户认证

## 📚 相关文件

- `package/application/vite.config.js` - Vite 配置
- `package/application/src/api/recording.js` - API 工具类
- `package/application/src/composables/useRecording.js` - Vue Composable
- `package/application/src/views/from.vue` - 表单演示页（已更新）
- `package/server/src/index.js` - 后端主文件
- `package/server/.env` - 环境配置

---

**集成完成时间**: 2026-01-04
**版本**: 3.0.0 (前后端集成)


