# 🐛 Admin 调试指南

## 问题解决

### 问题 1: RecordingList 组件 onMounted 没有执行

**原因**: 组件通过懒加载导入 (`() => import()`)，debugger 可能在组件加载完成前触发。

**解决方案**:
1. ✅ 已将 `debugger` 替换为 `console.log`
2. ✅ 添加了详细的日志输出

**检查方法**:
```javascript
// 打开浏览器控制台，应该看到：
// "RecordingList component mounted"
// "fetchRecordings called"
// "Fetching with params: {...}"
// "API result: {...}"
// "Loaded recordings: 1"
```

### 问题 2: API 数据结构不匹配

**原因**: Server 端返回的简化数据结构与 Admin 前端期望的完整对象不一致。

**修复**:
- ✅ 修改了 `/api/recording/list` 接口
- ✅ 修改了 `/api/recording/search` 接口
- ✅ 现在返回完整的 Recording 对象（包含 `_id`, `metadata`, `stats` 等）

**API 返回结构**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "695b470bbdc40db9b232bdbd",
      "recordingId": "b8ccef97-420f-4148-994c-d8e9d661f1ed",
      "metadata": {
        "title": "表单操作录制...",
        "url": "http://localhost:5173/#/from",
        "tags": ["表单", "用户操作"],
        "recordedAt": "2026-01-05T05:07:23.831Z",
        "eventCount": 66,
        "duration": 3517
      },
      "stats": {
        "viewCount": 0
      },
      "status": "active",
      "createdAt": 1767589643
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 问题 3: 可选链缺失导致的错误

**原因**: 当数据为 undefined 时，访问嵌套属性会报错。

**修复**:
- ✅ 所有模板中的 `record.metadata.xxx` 改为 `record.metadata?.xxx`
- ✅ 所有 `record.stats.xxx` 改为 `record.stats?.xxx`
- ✅ 添加了默认值 `|| 0`、`|| []` 等

**修改位置**:
- `RecordingList.vue` 的所有插槽模板
- `Dashboard.vue` 的列表项
- `handleAction` 函数中的编辑和删除

## 调试技巧

### 1. 浏览器控制台

打开 Admin 页面后，按 `F12` 打开控制台，查看：

**Console 标签页**:
```
RecordingList component mounted
fetchRecordings called
Fetching with params: {page: 1, limit: 10}
API result: {success: true, data: Array(1), pagination: {...}}
Loaded recordings: 1
```

**Network 标签页**:
- 查看 `/api/recording/list` 请求
- 检查 Status Code (应该是 200)
- 检查 Response 数据结构

### 2. Vue DevTools

安装 Vue DevTools 扩展后：

1. 打开 DevTools
2. 选择 "Vue" 标签
3. 查看组件树
4. 检查 `RecordingList` 组件的 data:
   - `recordings` 数组
   - `loading` 状态
   - `pagination` 对象

### 3. 后端日志

查看后端终端输出：

```bash
# 应该看到这样的日志
GET /api/recording/list?page=1&limit=10 200 45ms
GET /api/recording/stats/summary 200 12ms
```

### 4. API 测试

使用 curl 直接测试 API：

```bash
# 测试列表接口
curl http://localhost:3000/api/recording/list?page=1&limit=10 | jq

# 测试统计接口
curl http://localhost:3000/api/recording/stats/summary | jq

# 测试搜索接口
curl "http://localhost:3000/api/recording/search?q=表单" | jq

# 测试健康检查
curl http://localhost:3000/health | jq
```

## 常见问题

### Q1: Admin 页面空白

**检查清单**:
1. ✅ 后端服务器是否运行？`curl http://localhost:3000/health`
2. ✅ MongoDB 是否运行？`mongosh --eval "db.adminCommand('ping')"`
3. ✅ 浏览器控制台是否有错误？
4. ✅ Network 请求是否成功？

**解决方案**:
```bash
# 重启后端
cd package/server
npm run dev

# 重启 Admin
cd package/admin
npm run dev
```

### Q2: 列表显示为空

**检查清单**:
1. ✅ 数据库是否有数据？
   ```bash
   mongosh
   use rrweb_recordings
   db.recordings.countDocuments()
   ```
2. ✅ API 是否返回数据？
   ```bash
   curl http://localhost:3000/api/recording/list | jq '.data | length'
   ```
3. ✅ 前端是否收到数据？（查看浏览器 Network 标签）

**解决方案**:
```bash
# 创建测试数据
# 1. 打开前端应用
open http://localhost:5173/#/from

# 2. 点击"录制"，操作表单，点击"保存到服务器"

# 3. 刷新 Admin 页面
```

### Q3: CORS 错误

**症状**: 浏览器控制台显示 CORS 错误

**原因**: 跨域请求被阻止

**解决方案**:
1. 确认 Vite 代理配置正确（已配置）
2. 确认后端 CORS 中间件已启用（已启用）
3. 重启前后端服务

### Q4: 404 错误

**症状**: API 请求返回 404

**可能原因**:
1. 后端路由未正确注册
2. URL 路径错误
3. 后端服务器未运行

**检查**:
```bash
# 检查后端路由
curl http://localhost:3000/api/recording/list
curl http://localhost:3000/api/recording/stats/summary

# 应该返回 JSON，不是 404
```

## 性能优化建议

### 1. 列表接口

当前实现已优化：
- ✅ 不返回 `events` 字段（大幅减少传输数据）
- ✅ 使用 `.lean()` 返回纯 JavaScript 对象
- ✅ 支持分页

### 2. 统计接口

当前实现已优化：
- ✅ 使用 MongoDB 聚合查询
- ✅ 只查询需要的字段
- ✅ 限制返回的最近记录数量

### 3. 前端渲染

建议优化：
```vue
<!-- 使用虚拟滚动（大量数据时） -->
<a-table :virtual="true" />

<!-- 懒加载图片 -->
<img loading="lazy" />
```

## 监控和日志

### 1. 添加请求日志

已在 `fetchRecordings` 中添加：
```javascript
console.log('fetchRecordings called')
console.log('Fetching with params:', params)
console.log('API result:', result)
console.log('Loaded recordings:', recordings.value.length)
```

### 2. 添加错误追踪

已在错误处理中添加：
```javascript
catch (error) {
  console.error('Failed to fetch recordings:', error)
  message.error('获取录制列表失败: ' + error.message)
}
```

### 3. 后端日志

使用 Morgan 中间件记录所有 HTTP 请求（已配置）

## 总结

✅ **已修复的问题**:
1. API 数据结构统一（返回完整 Recording 对象）
2. 添加可选链操作符，防止 undefined 错误
3. 添加详细的日志输出
4. 统一错误处理格式
5. 完善统计接口（添加今日录制和活跃录制统计）

✅ **当前状态**:
- 后端 API 正常工作
- 统计接口返回完整数据
- 列表接口返回完整对象
- 前端已添加详细日志

🔍 **下一步调试**:
1. 打开 Admin: http://localhost:5175
2. 打开浏览器控制台
3. 查看 Console 和 Network 标签
4. 检查是否有错误或警告

---

**更新时间**: 2026-01-05
**版本**: 1.1.0 (调试版)

