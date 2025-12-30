# rrweb-to-mp4

Convert rrweb recording data to MP4 video.

## Prerequisites

- Node.js 18+
- Puppeteer 13.7.0+ (已升级，支持 macOS ARM64)

## 重要说明

**Puppeteer 版本要求：**
- ✅ 使用 Puppeteer 13.7.0+ 版本（已配置）
- ❌ 不要使用 5.5 版本（不支持 Apple Silicon/ARM64 Mac，会报错无法打开浏览器）

Puppeteer 13.7.0+ 会自动下载适配的 Chromium 浏览器，无需手动安装 Chrome。

## Installation

```bash
npm install
```

安装时 Puppeteer 会自动下载适配你系统的 Chromium 浏览器。

## Usage

```bash
# 构建
npm run build

# 测试/运行
npm run test
```

## Troubleshooting

### 如果 Puppeteer 下载 Chromium 失败

可以手动设置使用系统已安装的 Chrome：

```javascript
// 在 src/index.js 中的 launch 方法添加：
this.browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ignoreHTTPSErrors: true,
  args: [...]
})
```

### 旧版本迁移说明

如果从旧版本（Puppeteer 5.5）升级过来：
1. 删除 `node_modules` 目录
2. 运行 `npm install` 重新安装依赖
3. Puppeteer 会自动下载正确的 Chromium 版本
