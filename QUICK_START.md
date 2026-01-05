# 🚀 快速参考

## 一键启动

```bash
./start.sh
```

## 手动启动

```bash
# 1. MongoDB
brew services start mongodb-community@7.0

# 2. 后端服务器 (终端 1)
cd package/server && npm run dev

# 3. Admin 后台 (终端 2)
cd package/admin && npm run dev

# 4. 前端应用 (终端 3 - 可选)
cd package/application && npm run dev
```

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| **Admin 管理后台** | http://localhost:5175 | 查看和管理录制 |
| 前端应用 | http://localhost:5173 | 用户录制界面 |
| API 服务器 | http://localhost:3000 | 后端 API |
| 健康检查 | http://localhost:3000/health | 服务器状态 |

## 常用操作

### 在前端录制

1. 访问 http://localhost:5173/#/from
2. 点击"录制"
3. 操作表单
4. 点击"保存到服务器"

### 在 Admin 查看

1. 访问 http://localhost:5175
2. 查看 Dashboard 统计
3. 进入"录制列表"
4. 点击"查看"查看详情
5. 点击"回放"观看录制

## API 测试

```bash
# 健康检查
curl http://localhost:3000/health

# 获取录制列表
curl http://localhost:3000/api/recording/list

# 获取统计信息
curl http://localhost:3000/api/recording/stats/summary

# 搜索录制
curl "http://localhost:3000/api/recording/search?q=表单"
```

## 停止服务

```bash
# 在各个终端按 Ctrl+C

# 停止 MongoDB
brew services stop mongodb-community@7.0
```

## 重要端口

- **5175** - Admin 管理后台 ⭐
- **5173** - 前端应用
- **3000** - 后端 API
- **27017** - MongoDB

## 故障排除

### Admin 无法访问

```bash
# 检查端口
lsof -i :5175

# 查看日志
cat ~/.cursor/projects/.../terminals/4.txt

# 重启
cd package/admin && npm run dev
```

### 无法连接后端

```bash
# 检查后端
curl http://localhost:3000/health

# 检查 MongoDB
mongosh --eval "db.adminCommand('ping')"
```

## 文档索引

- [完整总结](PROJECT_COMPLETE.md)
- [Admin 设置指南](ADMIN_SETUP.md)
- [集成指南](INTEGRATION_GUIDE.md)
- [MongoDB 指南](package/server/MONGODB_GUIDE.md)
- [Server README](package/server/README.md)
- [Admin README](package/admin/README.md)

---

**提示**: Admin 后台当前运行在端口 **5175**（因为 5174 被占用）

