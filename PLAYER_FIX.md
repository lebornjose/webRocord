# 🎬 rrweb 播放器沙箱问题解决方案

## 问题描述

当在 RecordingList 页面中尝试回放录制时，出现错误：

```
Blocked script execution in 'http://localhost:5174/' because the document's frame is sandboxed and the 'allow-scripts' permission is not set.
```

## 问题原因

`rrweb-player` 使用 iframe 来回放录制内容。默认情况下，iframe 的沙箱模式会阻止脚本执行，这是浏览器的安全机制。

## 解决方案

### ✅ 方案 1: 使用模态框（已实施）

将播放器放在模态框中，这样可以：
1. 更好地控制播放器的显示和隐藏
2. 提供更好的用户体验
3. 避免页面布局问题
4. 正确管理播放器实例的生命周期

**实现要点**：

```vue
<!-- 回放模态框 -->
<a-modal
  v-model:open="playbackModalVisible"
  title="录制回放"
  width="90%"
  :footer="null"
  @cancel="handleClosePlayback"
>
  <div ref="replayer" class="replay-container"></div>
</a-modal>
```

```javascript
// 播放录制
const viewDetail = async (recordingId) => {
  const res = await recordingApi.getRecording(recordingId, true)
  playbackModalVisible.value = true
  
  // 等待 DOM 更新
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 创建播放器实例
  playerInstance = new rrwebPlayer({
    target: replayer.value,
    props: {
      events: res.data.events,
      width: 800,
      height: 600,
      autoPlay: false,
      showController: true
    }
  })
}

// 关闭时清理
const handleClosePlayback = () => {
  if (playerInstance) {
    playerInstance.$destroy()
    playerInstance = null
  }
  playbackModalVisible.value = false
}
```

### 📋 方案 2: 跳转到详情页（备选）

如果不想在列表页回放，可以跳转到详情页：

```javascript
const viewDetail = (recordingId) => {
  router.push(`/recordings/${recordingId}`)
}
```

详情页 (`RecordingDetail.vue`) 已经有完整的播放器实现。

### 🔧 方案 3: 新窗口打开（备选）

使用服务器端的回放页面：

```javascript
const playRecording = (recordingId) => {
  const url = `/api/playback/${recordingId}`
  window.open(url, '_blank')
}
```

## 功能改进

### 1. 按钮布局优化

```vue
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
        <a-menu>
          <a-menu-item key="edit">编辑</a-menu-item>
          <a-menu-item key="download">导出</a-menu-item>
          <a-menu-item key="delete" danger>删除</a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-space>
</template>
```

### 2. 播放器实例管理

```javascript
let playerInstance = null

// 创建新播放器前清理旧实例
if (playerInstance) {
  try {
    playerInstance.$destroy()
  } catch (e) {
    console.log('清理播放器实例失败', e)
  }
}

// 创建新实例
playerInstance = new rrwebPlayer({...})
```

### 3. 错误处理

```javascript
try {
  const res = await recordingApi.getRecording(recordingId, true)
  
  if (!res.success || !res.data || !res.data.events) {
    message.error('无法获取录制数据')
    return
  }
  
  // ... 创建播放器
} catch (error) {
  console.error('播放录制失败:', error)
  message.error('播放失败: ' + error.message)
}
```

### 4. 样式优化

```css
.replay-container {
  width: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 确保 rrweb-player 的样式正确 */
:deep(.rr-player) {
  width: 100% !important;
}

:deep(.rr-player__frame) {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
```

## 使用方法

### 1. 在列表页快速回放

1. 点击列表中的"回放"按钮
2. 模态框弹出，显示播放器
3. 使用播放器控制条控制回放
4. 点击关闭按钮或按 ESC 键关闭

### 2. 查看完整详情

1. 点击"详情"按钮
2. 跳转到详情页
3. 查看完整的录制信息和统计数据
4. 使用内嵌播放器回放

### 3. 新窗口回放（可选）

在详情页：
1. 点击"回放录制"按钮
2. 在新标签页打开全屏回放
3. 使用 `/api/playback/:id` 端点

## 播放器配置

```javascript
new rrwebPlayer({
  target: replayer.value,        // DOM 容器
  props: {
    events: res.data.events,     // 录制事件数据
    width: 800,                  // 播放器宽度
    height: 600,                 // 播放器高度
    autoPlay: false,             // 不自动播放
    showController: true,        // 显示控制器
    skipInactive: true,          // 跳过不活跃时间
    plugins: [                   // 插件配置
      getReplayConsolePlugin({
        level: ['info', 'log', 'warn', 'error']
      })
    ]
  }
})
```

## 常见问题

### Q1: 模态框中播放器显示不正常

**解决方案**：
```javascript
// 等待 DOM 更新后再创建播放器
playbackModalVisible.value = true
await new Promise(resolve => setTimeout(resolve, 100))
playerInstance = new rrwebPlayer({...})
```

### Q2: 关闭模态框后再次打开失败

**解决方案**：
```javascript
// 关闭时清理播放器实例
const handleClosePlayback = () => {
  if (playerInstance) {
    playerInstance.$destroy()
    playerInstance = null
  }
  playbackModalVisible.value = false
}
```

### Q3: 播放器样式不正确

**解决方案**：
```javascript
// 在 main.js 中导入样式
import 'rrweb-player/dist/style.css'
```

## 性能优化

### 1. 懒加载录制数据

```javascript
// 不带 events 查询列表（快速）
const recordings = await recordingApi.getRecordingList(params)

// 只在需要回放时加载 events（按需）
const detail = await recordingApi.getRecording(id, true)
```

### 2. 清理不用的实例

```javascript
// 组件卸载时清理
onUnmounted(() => {
  if (playerInstance) {
    playerInstance.$destroy()
  }
})
```

## 技术细节

### rrweb-player 工作原理

1. **创建 iframe**: 播放器在 iframe 中重建页面
2. **应用事件**: 按时间顺序应用录制的事件
3. **同步状态**: 保持 DOM 和样式的同步
4. **控制回放**: 提供播放、暂停、跳转等控制

### 沙箱限制

浏览器的 iframe 沙箱会限制：
- 脚本执行
- 表单提交
- 弹窗
- 导航

解决方法是确保播放器在非沙箱的 iframe 中运行，或使用 `sandbox="allow-scripts allow-same-origin"`。

## 总结

✅ **已实现**:
1. 模态框中显示播放器
2. 正确的实例管理（创建和清理）
3. 完整的错误处理
4. 样式优化
5. 按钮布局优化

✅ **功能完整**:
- 列表页快速回放（模态框）
- 详情页完整查看（内嵌播放器）
- 新窗口全屏回放（可选）

🎉 现在可以在列表页直接回放录制了！

---

**更新时间**: 2026-01-05
**版本**: 1.2.0 (播放器修复版)



