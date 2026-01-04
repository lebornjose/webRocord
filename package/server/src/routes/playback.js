const express = require('express');
const router = express.Router();
const Recording = require('../models/Recording');

// 获取回放页面（HTML）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const recording = await Recording.findOne({ 
      recordingId: id, 
      status: 'active' 
    });

    if (!recording) {
      return res.status(404).send('<h1>Recording not found</h1>');
    }

    // 增加查看次数
    await recording.incrementViewCount();

    // 生成回放页面
    const html = generatePlaybackHTML(recording);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Error generating playback:', error);
    res.status(500).send('<h1>Error loading recording</h1>');
  }
});

// 生成回放 HTML
function generatePlaybackHTML(recording) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>回放 - ${recording.metadata.title || recording.recordingId}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css">
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .metadata {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      color: #666;
      font-size: 14px;
    }
    .metadata-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .tags {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }
    .tag {
      padding: 4px 12px;
      background: #e8f4f8;
      color: #1890ff;
      border-radius: 12px;
      font-size: 12px;
    }
    .stats {
      margin-top: 10px;
      color: #999;
      font-size: 13px;
    }
    .player-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .rr-player {
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${recording.metadata.title || '录制回放'}</h1>
      <div class="metadata">
        <div class="metadata-item">
          <strong>录制时间:</strong>
          <span>${new Date(recording.metadata.recordedAt).toLocaleString('zh-CN')}</span>
        </div>
        <div class="metadata-item">
          <strong>时长:</strong>
          <span>${(recording.metadata.duration / 1000).toFixed(2)}秒</span>
        </div>
        <div class="metadata-item">
          <strong>事件数:</strong>
          <span>${recording.metadata.eventCount}</span>
        </div>
        <div class="metadata-item">
          <strong>查看次数:</strong>
          <span>${recording.stats.viewCount}</span>
        </div>
      </div>
      ${recording.metadata.tags && recording.metadata.tags.length > 0 ? `
      <div class="tags">
        ${recording.metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      ` : ''}
      ${recording.metadata.description ? `
      <div class="stats">
        ${recording.metadata.description}
      </div>
      ` : ''}
    </div>
    
    <div class="player-container">
      <div id="player"></div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js"></script>
  <script>
    const events = ${JSON.stringify(recording.events)};
    
    new rrwebPlayer({
      target: document.getElementById('player'),
      props: {
        events,
        width: 1024,
        height: 768,
        autoPlay: true,
        showController: true,
        speedOption: [1, 2, 4, 8]
      }
    });
  </script>
</body>
</html>
  `;
}

module.exports = router;
