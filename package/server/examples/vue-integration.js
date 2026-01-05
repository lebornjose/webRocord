// 前端集成示例 - 在 Vue 组件中使用

import { ref } from 'vue';
import { record, getRecordConsolePlugin } from 'rrweb';

// Server API 地址
const SERVER_URL = 'http://localhost:3000';

export function useRecording() {
  const isRecording = ref(false);
  const events = ref([]);
  let stopFn = null;

  // 开始录制
  const startRecording = () => {
    events.value = [];
    isRecording.value = true;

    stopFn = record({
      checkoutEveryNth: 100,
      emit(event) {
        events.value.push(event);
      },
      plugins: [
        getRecordConsolePlugin({
          level: ["info", "log", "warn", "error"],
        })
      ]
    });

    console.log('🎬 开始录制...');
  };

  // 停止录制
  const stopRecording = () => {
    if (stopFn) {
      stopFn();
      isRecording.value = false;
      console.log('⏹️  停止录制, 共', events.value.length, '个事件');
    }
  };

  // 保存录制到服务器
  const saveRecording = async (metadata = {}) => {
    if (events.value.length === 0) {
      throw new Error('没有录制数据');
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/recording/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: events.value,
          metadata: {
            title: metadata.title || '用户操作录制',
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...metadata
          }
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || '保存失败');
      }

      console.log('✅ 保存成功:', data.recordingId);
      return data;

    } catch (error) {
      console.error('❌ 保存录制失败:', error);
      throw error;
    }
  };

  // 获取录制列表
  const getRecordingList = async (options = {}) => {
    const { page = 1, limit = 10 } = options;
    
    try {
      const response = await fetch(
        `${SERVER_URL}/api/recording/list?page=${page}&limit=${limit}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 获取列表失败:', error);
      throw error;
    }
  };

  // 获取指定录制
  const getRecording = async (recordingId) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/recording/${recordingId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 获取录制失败:', error);
      throw error;
    }
  };

  // 删除录制
  const deleteRecording = async (recordingId) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/recording/${recordingId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ 删除录制失败:', error);
      throw error;
    }
  };

  // 打开回放页面
  const openPlayback = (recordingId) => {
    const url = `${SERVER_URL}/api/playback/${recordingId}`;
    window.open(url, '_blank');
  };

  return {
    isRecording,
    events,
    startRecording,
    stopRecording,
    saveRecording,
    getRecordingList,
    getRecording,
    deleteRecording,
    openPlayback
  };
}


