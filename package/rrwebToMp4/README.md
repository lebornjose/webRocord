# rrweb-to-mp4

Convert rrweb recording data to MP4 video.

## Prerequisites

- Node.js
- Chrome or Chromium-based browser (Google Chrome, Microsoft Edge, Brave, etc.)

## Installation

```bash
npm install
```

## Usage

### Standard Usage

```bash
npm run build
npm test
```

### For macOS Users (especially Apple Silicon/M1/M2/M3)

If you're encountering the following error:

```
Error: Failed to launch the browser process! spawn /usr/bin/chromium-browser ENOENT
```

This is due to Puppeteer not finding the expected Chrome executable on your system. macOS users (especially on Apple Silicon) should use the following command to run the application:

```bash
npm run macos
```

This script will:
1. Find an installed Chromium-based browser on your system
2. Configure Puppeteer to use that browser
3. Launch the application with the correct settings

## Troubleshooting

### Chrome/Chromium Not Found

Make sure you have one of the following browsers installed:
- Google Chrome
- Google Chrome Canary
- Chromium
- Microsoft Edge
- Brave Browser

### Manual Configuration

If needed, you can manually set the Puppeteer executable path:

```bash
PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node index.js
``` 

### puppteer 需要 13 以上版本， 5.5 版本会报错，无法打开浏览器
