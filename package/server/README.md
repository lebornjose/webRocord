# rrweb Recording Server

基于 Express 的 rrweb 录制数据存储服务端。

## 🎯 功能特性

- ✅ 保存前端录制的 rrweb 数据
- ✅ 录制数据管理（列表、查询、删除）
- ✅ 自动生成回放页面
- ✅ 支持大数据量（50MB 限制）
- ✅ RESTful API 设计
- ✅ 完整的错误处理
- ✅ 请求日志记录

## 📦 安装

```bash
npm install --cache /tmp/npm-cache-server --prefer-online
```

## 🚀 启动

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将在 http://localhost:3000 启动

## 📡 API 接口

### 1. 保存录制数据

**POST** `/api/recording/save`

```json
{
  "events": [...],  // rrweb 事件数组
  "metadata": {     // 可选元数据
    "title": "用户操作录制",
    "userAgent": "...",
    "url": "https://example.com",
    "userId": "user123"
  }
}
```

**响应:**
```json
{
  "success": true,
  "recordingId": "uuid",
  "message": "Recording saved successfully",
  "metadata": {
    "recordedAt": "2025-12-31T...",
    "eventCount": 100,
    "duration": 5000
  }
}
```

### 2. 获取录制列表

**GET** `/api/recording/list?page=1&limit=10&sortBy=recordedAt&order=desc`

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "...",
      "recordedAt": "...",
      "eventCount": 100,
      "duration": 5000
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### 3. 获取指定录制

**GET** `/api/recording/:id`

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "events": [...],
    "metadata": {...}
  }
}
```

### 4. 删除录制

**DELETE** `/api/recording/:id`

**响应:**
```json
{
  "success": true,
  "message": "Recording deleted successfully"
}
```

### 5. 回放页面

**GET** `/api/playback/:id`

返回 HTML 回放页面，可直接在浏览器中打开。

### 6. 健康检查

**GET** `/health`

**响应:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-31T...",
  "uptime": 12345
}
```

## 📂 数据存储

录制数据存储在 `data/recordings/` 目录：

```
data/
└── recordings/
    ├── index.json              # 录制索引
    ├── uuid-1.json            # 录制数据 1
    ├── uuid-2.json            # 录制数据 2
    └── ...
```

## 🔧 配置

### 环境变量

在 `.env` 文件中配置（可选）:

```env
PORT=3000
DATA_DIR=./data
```

### 自定义配置

修改 `src/index.js` 中的配置：

```javascript
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, '../data');
```

## 🌐 与前端集成

### 前端保存录制

```javascript
// 在 Vue 组件中
import { record } from 'rrweb';

const events = [];
const stopFn = record({
  emit(event) {
    events.push(event);
  }
});

// 停止录制并保存
function saveRecording() {
  stopFn();
  
  fetch('http://localhost:3000/api/recording/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      events,
      metadata: {
        title: '用户操作录制',
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('保存成功:', data.recordingId);
    // 可以跳转到回放页面
    window.open(`http://localhost:3000/api/playback/${data.recordingId}`);
  });
}
```

### 获取录制列表

```javascript
fetch('http://localhost:3000/api/recording/list')
  .then(res => res.json())
  .then(data => {
    console.log('录制列表:', data.data);
  });
```

## 🔒 安全建议

### 生产环境配置

1. **启用 HTTPS**
2. **添加认证中间件**
3. **限制请求频率**
4. **输入验证和清理**
5. **使用环境变量管理敏感信息**

示例认证中间件：

```javascript
// src/middleware/auth.js
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // 验证 token
  // ...
  
  next();
}

module.exports = { authenticateToken };
```

## 📊 性能优化

1. **使用数据库**: 对于大量录制，建议使用 MongoDB 或 PostgreSQL
2. **添加缓存**: 使用 Redis 缓存常访问的数据
3. **压缩响应**: 已启用 gzip 压缩
4. **定期清理**: 实现数据清理策略

## 🗄️ 数据库集成（可选）

### MongoDB 示例

```javascript
const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  events: [mongoose.Schema.Types.Mixed],
  metadata: {
    title: String,
    recordedAt: Date,
    eventCount: Number,
    duration: Number,
    userAgent: String,
    url: String
  }
});

const Recording = mongoose.model('Recording', recordingSchema);
```

## 🧪 测试

```bash
# 测试保存录制
curl -X POST http://localhost:3000/api/recording/save \
  -H "Content-Type: application/json" \
  -d '{"events": [{"type": 2, "data": {}}], "metadata": {"title": "测试"}}'

# 测试获取列表
curl http://localhost:3000/api/recording/list

# 测试健康检查
curl http://localhost:3000/health
```

## 📝 待办事项

- [ ] 添加用户认证
- [ ] 集成数据库
- [ ] 添加搜索功能
- [ ] 实现数据导出
- [ ] 添加 WebSocket 实时推送
- [ ] 实现录制分享功能
- [ ] 添加录制统计分析

## 🐛 故障排除

### 端口被占用

修改 PORT 环境变量：
```bash
PORT=3001 npm start
```

### 数据目录权限错误

确保应用有写入权限：
```bash
chmod 755 data/
```

## 📚 相关文档

- [Express 文档](https://expressjs.com/)
- [rrweb 文档](https://www.rrweb.io/)
- [RESTful API 设计指南](https://restfulapi.net/)

## 📄 License

ISC


