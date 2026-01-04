# MongoDB 集成完成！

## ✅ 已完成的更新

### 1. 新增文件

- ✅ `src/models/Recording.js` - Mongoose 数据模型
- ✅ `src/config/database.js` - 数据库连接配置
- ✅ `.env.example` - 环境变量示例（已更新）

### 2. 更新文件

- ✅ `package.json` - 添加 mongoose 和 dotenv
- ✅ `src/index.js` - 集成数据库连接和健康检查
- ✅ `src/routes/recording.js` - 使用 MongoDB 存储
- ✅ `src/routes/playback.js` - 从 MongoDB 读取数据

### 3. 新增 API 功能

- ✅ `PATCH /api/recording/:id` - 更新录制元数据
- ✅ `GET /api/recording/search` - 全文搜索
- ✅ `GET /api/recording/stats/summary` - 统计信息
- ✅ 支持标签过滤
- ✅ 支持软删除
- ✅ 自动统计查看次数

## 🗄️ MongoDB Schema

```javascript
{
  recordingId: String (唯一索引),
  events: Array,      // rrweb 事件
  metadata: {
    title: String,
    url: String,
    userAgent: String,
    userId: String,
    recordedAt: Date (索引),
    eventCount: Number,
    duration: Number,
    tags: [String] (索引),
    description: String
  },
  stats: {
    viewCount: Number,
    lastViewedAt: Date
  },
  status: String,     // active, archived, deleted
  createdAt: Date,    // 自动
  updatedAt: Date     // 自动
}
```

## 🚀 快速开始

### 1. 安装 MongoDB

**macOS (使用 Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**或使用 Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. 配置环境变量

创建 `.env` 文件：
```bash
cd package/server
cp .env.example .env
```

编辑 `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/rrweb_recordings
PORT=3000
NODE_ENV=development
```

### 3. 启动服务器

```bash
npm run dev
```

输出应显示：
```
🔌 正在连接 MongoDB...
✅ MongoDB 连接成功!
   数据库: rrweb_recordings
   主机: localhost
```

## 📡 新增 API 端点

### 1. 更新录制元数据
```bash
PATCH /api/recording/:id
Content-Type: application/json

{
  "metadata": {
    "title": "新标题",
    "description": "描述",
    "tags": ["bug", "urgent"]
  }
}
```

### 2. 搜索录制
```bash
GET /api/recording/search?q=关键词&page=1&limit=10
```

### 3. 获取统计信息
```bash
GET /api/recording/stats/summary
```

响应：
```json
{
  "success": true,
  "data": {
    "totalRecordings": 100,
    "totalViews": 1250,
    "recentRecordings": [...]
  }
}
```

### 4. 标签筛选
```bash
GET /api/recording/list?tag=bug
```

### 5. 软删除（可恢复）
```bash
DELETE /api/recording/:id
```

### 6. 永久删除
```bash
DELETE /api/recording/:id?permanent=true
```

## 🔍 高级功能

### 全文搜索

MongoDB 会自动为 `metadata.title` 创建文本索引：

```bash
GET /api/recording/search?q=用户登录问题
```

### 统计查看次数

每次访问回放页面，查看次数自动 +1：

```bash
GET /api/playback/:id  # viewCount++
```

### 标签系统

保存时添加标签：

```javascript
{
  "events": [...],
  "metadata": {
    "title": "登录错误",
    "tags": ["bug", "login", "urgent"]
  }
}
```

按标签筛选：

```bash
GET /api/recording/list?tag=bug
```

## 💾 数据迁移

### 从文件系统迁移到 MongoDB

```javascript
// migration.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Recording = require('./src/models/Recording');

async function migrate() {
  await mongoose.connect('mongodb://localhost:27017/rrweb_recordings');
  
  const dataDir = './data/recordings';
  const files = fs.readdirSync(dataDir);
  
  for (const file of files) {
    if (file.endsWith('.json') && file !== 'index.json') {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, file)));
      
      const recording = new Recording({
        recordingId: data.id,
        events: data.events,
        metadata: data.metadata
      });
      
      await recording.save();
      console.log(`✅ Migrated: ${data.id}`);
    }
  }
  
  console.log('🎉 Migration complete!');
  process.exit(0);
}

migrate();
```

## 🌐 MongoDB Atlas (云端数据库)

### 1. 创建免费集群

访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### 2. 获取连接字符串

```
mongodb+srv://username:password@cluster.mongodb.net/rrweb_recordings?retryWrites=true&w=majority
```

### 3. 更新 .env

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rrweb_recordings
```

## 📊 性能优化

### 索引已配置

- `recordingId` (unique)
- `metadata.recordedAt` (desc)
- `metadata.title` (text) - 支持全文搜索
- `metadata.tags`
- `status`

### 查询优化

1. **列表查询不返回 events**：
```javascript
.select('-events')  // 排除 events 字段
```

2. **条件查询使用 includeEvents**：
```bash
GET /api/recording/:id?includeEvents=false
```

3. **分页限制**：
```javascript
.skip(skip).limit(limit)
```

## 🔒 安全建议

### 1. 添加用户认证

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}
```

### 2. 数据验证

```javascript
const { body, validationResult } = require('express-validator');

router.post('/save', [
  body('events').isArray().notEmpty(),
  body('metadata.title').optional().isString().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ...
});
```

## 🧪 测试

```bash
# 确保 MongoDB 正在运行
mongosh

# 启动服务器
npm run dev

# 在另一个终端测试
curl http://localhost:3000/health
```

## 📝 待办事项

- [ ] 添加数据备份脚本
- [ ] 实现数据导出功能
- [ ] 添加录制分类功能
- [ ] 实现用户系统
- [ ] 添加录制分享功能
- [ ] 实现评论系统

## 🎓 参考资料

- [Mongoose 文档](https://mongoosejs.com/)
- [MongoDB 文档](https://docs.mongodb.com/)
- [MongoDB Atlas 教程](https://www.mongodb.com/docs/atlas/)

---

**更新时间**: 2026-01-04
**版本**: 2.0.0 (MongoDB)

