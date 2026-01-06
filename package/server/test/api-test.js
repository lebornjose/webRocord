const fetch = require('node-fetch');

// 测试 API 的示例脚本
const BASE_URL = 'http://localhost:3000';

// 模拟 rrweb 事件数据
const mockEvents = [
  {
    type: 4,
    data: {
      href: 'http://localhost:5173',
      width: 1920,
      height: 1080
    },
    timestamp: Date.now()
  },
  {
    type: 2,
    data: {},
    timestamp: Date.now() + 100
  },
  {
    type: 3,
    data: {
      source: 2,
      type: 0,
      id: 10
    },
    timestamp: Date.now() + 200
  }
];

async function testAPI() {
  console.log('🧪 开始测试 Server API...\n');

  try {
    // 1. 测试健康检查
    console.log('1️⃣  测试健康检查...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ 健康检查:', healthData);
    console.log('');

    // 2. 测试保存录制
    console.log('2️⃣  测试保存录制...');
    const saveRes = await fetch(`${BASE_URL}/api/recording/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        events: mockEvents,
        metadata: {
          title: '测试录制',
          userAgent: 'Mozilla/5.0 (Test)',
          url: 'http://localhost:5173'
        }
      })
    });
    const saveData = await saveRes.json();
    console.log('✅ 保存成功:', saveData);
    const recordingId = saveData.recordingId;
    console.log('');

    // 3. 测试获取列表
    console.log('3️⃣  测试获取录制列表...');
    const listRes = await fetch(`${BASE_URL}/api/recording/list`);
    const listData = await listRes.json();
    console.log('✅ 录制列表:', listData);
    console.log('');

    // 4. 测试获取指定录制
    console.log('4️⃣  测试获取指定录制...');
    const getRes = await fetch(`${BASE_URL}/api/recording/${recordingId}`);
    const getData = await getRes.json();
    console.log('✅ 录制详情:', {
      id: getData.data.id,
      eventCount: getData.data.events.length,
      metadata: getData.data.metadata
    });
    console.log('');

    // 5. 测试回放页面
    console.log('5️⃣  测试回放页面...');
    console.log(`✅ 回放 URL: ${BASE_URL}/api/playback/${recordingId}`);
    console.log('');

    // 6. 测试删除录制
    console.log('6️⃣  测试删除录制...');
    const deleteRes = await fetch(`${BASE_URL}/api/recording/${recordingId}`, {
      method: 'DELETE'
    });
    const deleteData = await deleteRes.json();
    console.log('✅ 删除成功:', deleteData);
    console.log('');

    console.log('🎉 所有测试通过！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testAPI();



