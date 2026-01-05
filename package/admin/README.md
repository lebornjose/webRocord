# Admin 管理后台

基于 Vue 3 + Ant Design Vue 的 rrweb 录制记录管理后台。

## ✨ 功能特性

### 📊 数据统计
- 总录制数统计
- 总观看次数
- 今日录制数
- 活跃录制统计
- 最近录制列表

### 📋 录制列表
- 分页展示所有录制
- 搜索功能（全文搜索）
- 标签筛选
- 多字段排序
- 批量操作

### 📝 录制详情
- 完整的录制信息展示
- 内嵌回放播放器
- 元数据编辑
- 统计信息查看
- 快速操作（复制链接、导出数据等）

### 🎬 回放管理
- 内嵌播放器预览
- 新窗口全屏回放
- 回放链接分享
- 观看次数统计

### ⚙️ 数据管理
- 编辑录制信息（标题、描述、标签）
- 软删除（可恢复）
- 永久删除
- 数据导出（JSON）

## 🚀 快速开始

### 1. 安装依赖

```bash
cd package/admin
npm install
```

或者在项目根目录：

```bash
npm run install:admin
```

### 2. 启动开发服务器

```bash
npm run dev
```

或者在项目根目录：

```bash
npm run dev:admin
```

访问: http://localhost:5174

### 3. 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
package/admin/
├── src/
│   ├── api/                  # API 接口
│   │   ├── request.js        # Axios 请求封装
│   │   └── recording.js      # 录制相关 API
│   ├── assets/               # 静态资源
│   │   └── styles.css        # 全局样式
│   ├── components/           # 公共组件
│   ├── router/               # 路由配置
│   │   └── index.js
│   ├── views/                # 页面组件
│   │   ├── Layout.vue        # 主布局
│   │   ├── Dashboard.vue     # 数据统计
│   │   ├── RecordingList.vue # 录制列表
│   │   └── RecordingDetail.vue # 录制详情
│   ├── App.vue               # 根组件
│   └── main.js               # 入口文件
├── index.html
├── vite.config.js            # Vite 配置
└── package.json
```

## 🎨 页面展示

### 1. 数据统计页面
- URL: `/#/dashboard`
- 功能: 显示录制数据统计和最近录制

### 2. 录制列表页面
- URL: `/#/recordings`
- 功能: 
  - 分页列表展示
  - 搜索和筛选
  - 批量操作
  - 快速回放

### 3. 录制详情页面
- URL: `/#/recordings/:id`
- 功能:
  - 完整信息展示
  - 内嵌播放器
  - 编辑和删除
  - 数据导出

## 🔌 API 配置

### 代理配置

Vite 配置中已设置代理，将 `/api` 请求转发到后端服务器：

```javascript
server: {
  port: 5174,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### API 端点

所有 API 请求通过 `/api` 前缀访问：

- `GET /api/recording/list` - 获取录制列表
- `GET /api/recording/search?q=keyword` - 搜索录制
- `GET /api/recording/:id` - 获取录制详情
- `PATCH /api/recording/:id` - 更新录制信息
- `DELETE /api/recording/:id` - 删除录制
- `GET /api/recording/stats/summary` - 获取统计信息
- `GET /api/playback/:id` - 回放页面

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - 官方路由管理器
- **Ant Design Vue 4** - 企业级 UI 组件库
- **Vite** - 下一代前端构建工具
- **Axios** - HTTP 客户端
- **rrweb-player** - 录制回放播放器
- **Day.js** - 日期处理库

## 📝 使用说明

### 查看录制列表

1. 访问 `/#/recordings`
2. 使用搜索框搜索关键词
3. 使用标签下拉框筛选
4. 点击"查看"查看详情
5. 点击"回放"打开回放页面

### 查看录制详情

1. 在列表中点击"查看"或标题
2. 查看完整的录制信息
3. 使用内嵌播放器预览回放
4. 点击"编辑"修改信息
5. 点击"回放录制"在新窗口查看

### 编辑录制信息

1. 在详情页或列表中点击"编辑"
2. 修改标题、描述或标签
3. 点击"确定"保存更改

### 删除录制

1. 在详情页或列表中点击"删除"
2. 确认删除操作
3. 默认为软删除（可恢复）
4. 可选择永久删除

### 导出录制数据

1. 在详情页点击"导出数据"
2. 自动下载 JSON 文件
3. 包含完整的录制事件和元数据

## 🔐 安全说明

目前 Admin 后台未添加身份认证，建议：

1. 仅在内网环境使用
2. 添加 IP 白名单
3. 或集成身份认证系统（JWT、OAuth 等）

## 🚧 开发计划

- [ ] 用户身份认证
- [ ] 角色权限管理
- [ ] 批量导出功能
- [ ] 录制分类管理
- [ ] 评论和标注功能
- [ ] 数据可视化图表
- [ ] 实时录制推送

## 🐛 故障排除

### 问题 1: 无法加载录制列表

**解决方案**:
1. 确认后端服务器运行在 3000 端口
2. 检查浏览器控制台网络请求
3. 确认 MongoDB 连接正常

### 问题 2: 回放播放器无法显示

**解决方案**:
1. 检查录制数据是否包含 events
2. 确认 rrweb-player 已正确安装
3. 查看浏览器控制台错误信息

### 问题 3: 代理不工作

**解决方案**:
1. 重启开发服务器
2. 清除浏览器缓存
3. 检查 vite.config.js 代理配置

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**创建时间**: 2026-01-05
**版本**: 1.0.0
