
# 基于 rrweb 的网页录制与回放系统

一个完整的网页操作录制、回放和视频导出系统。

## 🎯 功能特性

- ✅ **实时录制**: 记录用户在网页上的所有操作
- ✅ **可视化回放**: 完整重现用户操作过程
- ✅ **视频导出**: 将操作录制转换为 WebM 视频
- ✅ **错误追踪**: 记录控制台日志，帮助追踪错误
- ✅ **Apple Silicon 支持**: 完全支持 M1/M2/M3 Mac

## 🏗️ 项目结构（Monorepo）

```
webRocord/
├── package/
│   ├── application/      # 前端应用 (Vue 3 + Vite)
│   ├── rrweb/           # rrweb 封装包
│   └── rrwebToMp4/      # 视频转换服务 (Puppeteer + WebM)
```

## 🚀 快速开始

### 安装依赖

由于 pnpm 版本兼容性问题，建议为每个子包单独安装：

```bash
# 前端应用
cd package/application
npm install --cache /tmp/npm-cache-app --prefer-online

# rrweb 包
cd ../rrweb
npm install --cache /tmp/npm-cache-rrweb --prefer-online

# 视频转换服务
cd ../rrwebToMp4
npm install --cache /tmp/npm-cache-mp4 --prefer-online
```

### 启动开发服务器

```bash
# 在项目根目录
npm run dev

# 或直接启动前端应用
cd package/application
npm run dev
```

访问 http://localhost:5173/

## 📱 应用页面

- **首页**: `http://localhost:5173/#/`
- **表单演示页**: `http://localhost:5173/#/from`
  - 点击"录制"按钮开始录制
  - 操作表单（输入、点击等）
  - 点击"回放"查看录制内容

## 🎬 视频转换

```bash
cd package/rrwebToMp4
npm test
```

这将:
1. 启动 Puppeteer 无头浏览器
2. 回放 rrweb 录制数据
3. 生成 WebM 视频文件
4. 保存到 `public/upload/webm/`

## 🛠️ 技术架构

### 前端 (application)
- **Vue 3** - Composition API
- **Vite** - 构建工具
- **Ant Design Vue 4.x** - UI 组件库
- **rrweb ^1.1.0** - 录制库
- **rrweb-player** - 回放播放器
- **Vue Router** - 路由管理

### 视频转换 (rrwebToMp4)
- **Puppeteer 13.7.0** - 无头浏览器 (支持 ARM64)
- **Express** - Web 服务器
- **WebM Writer** - 视频编码
- **Multer** - 文件上传

## 📝 项目依赖

- rrweb: 网页录制回放库
- rrweb-player: rrweb 的播放器组件
- webm-writer-js: WebM 视频生成

## 🎯 应用场景

1. **用户行为分析**: 记录用户操作轨迹
2. **Bug 复现**: 录制用户操作，帮助开发者重现问题
3. **自动化测试回放**: 记录测试场景并回放
4. **操作演示**: 生成操作演示视频
5. **错误追踪**: 配合日志记录，追踪错误发生时的操作上下文

## ⚙️ 配置说明

### 录制配置 (application/src/views/from.vue)

```javascript
record({
  checkoutEveryNth: 100, // 每 100 个 event 重新制作快照
  plugins: [
    getRecordConsolePlugin({
      level: ["info", "log", "warn", "error"], // 记录的日志级别
      lengthThreshold: 10000,
      stringifyOptions: {
        stringLengthLimit: 1000,
        numOfKeysLimit: 100,
        depthOfLimit: 1
      }
    })
  ]
})
```

### 视频配置 (rrwebToMp4/replay.html)

```javascript
let config = {
  fps: 50  // 帧率 (30-60 推荐)
};
```

## 🐛 已解决的问题

### macOS (Apple Silicon) 兼容性
- ✅ Puppeteer 5.5.0 → 13.7.0
- ✅ 移除不兼容的 Chrome 启动参数
- ✅ 自动检测并使用系统 Chrome

### 依赖安装问题
- ✅ pnpm 6.35.1 兼容性 → 使用 npm
- ✅ npm 缓存权限 → 使用临时缓存目录

### 视频编码问题
- ✅ H264 WASM 不稳定 → 切换到 WebM Writer
- ✅ Canvas API 兼容性 → Image + Canvas 转换

## 📚 参考项目

- [rrweb](https://github.com/rrweb-io/rrweb)
- [rrweb-to-mp4](https://github.com/jianming1999/rrweb-to-mp4)

## 📄 License

ISC
