require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const database = require('./config/database');
const recordingRoutes = require('./routes/recording');
const playbackRoutes = require('./routes/playback');

const app = express();
const PORT = process.env.PORT || 3000;

// 连接数据库
database.connect().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

// 中间件配置
app.use(morgan('dev')); // 日志
app.use(cors()); // 跨域支持
app.use(compression()); // 压缩响应
app.use(bodyParser.json({ limit: '50mb' })); // 支持大型录制数据
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 数据库状态检查中间件
app.use((req, res, next) => {
  if (!database.isConnected()) {
    return res.status(503).json({
      error: 'Database not connected',
      message: 'Service temporarily unavailable'
    });
  }
  next();
});

// API 路由
app.use('/api/recording', recordingRoutes);
app.use('/api/playback', playbackRoutes);

// 健康检查
app.get('/health', async (req, res) => {
  const dbStatus = database.isConnected();
  res.json({
    status: dbStatus ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbStatus,
      name: dbStatus ? require('mongoose').connection.name : 'N/A'
    }
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'rrweb Recording Server',
    version: '1.0.0',
    endpoints: {
      'POST /api/recording/save': '保存录制数据',
      'GET /api/recording/list': '获取录制列表',
      'GET /api/recording/:id': '获取指定录制',
      'PATCH /api/recording/:id': '更新录制元数据',
      'DELETE /api/recording/:id': '删除录制',
      'GET /api/recording/search': '搜索录制',
      'GET /api/recording/stats/summary': '获取统计信息',
      'GET /api/playback/:id': '获取回放页面',
      'GET /health': '健康检查'
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      status: 404,
      path: req.path
    }
  });
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  await database.disconnect();
  process.exit(0);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   rrweb Recording Server (MongoDB)       ║
║                                          ║
║   Server running on:                     ║
║   http://localhost:${PORT}                   ║
║                                          ║
║   Database: MongoDB                      ║
║   Status: ${database.isConnected() ? '✅ Connected' : '❌ Not Connected'}                   ║
║                                          ║
║   API Documentation:                     ║
║   http://localhost:${PORT}/                  ║
╚══════════════════════════════════════════╝
  `);
});

module.exports = app;

