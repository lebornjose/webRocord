// Vue 3 Composable - 录制功能
import { ref, computed } from 'vue';
import { record, getRecordConsolePlugin } from 'rrweb';
import { message } from 'ant-design-vue';
import RecordingAPI from '../api/recording';

export function useRecording() {
  const isRecording = ref(false);
  const events = ref([]);
  const eventsMatrix = ref([[]]);
  const currentRecordingId = ref(null);
  const isSaving = ref(false);
  
  let stopFn = null;

  // 开始录制
  const startRecording = () => {
    events.value = [];
    eventsMatrix.value = [[]];
    isRecording.value = true;

    stopFn = record({
      checkoutEveryNth: 100, // 每 100 个 event 重新制作快照
      emit(event, isCheckout) {
        // isCheckout 是一个标识，告诉你重新制作了快照
        if (isCheckout) {
          eventsMatrix.value.push([]);
        }
        // 将事件添加到最新的事件数组中
        const lastEvents = eventsMatrix.value[eventsMatrix.value.length - 1];
        lastEvents.push(event);
        events.value.push(event);
      },
      plugins: [
        getRecordConsolePlugin({
          level: ["info", "log", "warn", "error"],
          lengthThreshold: 10000,
          stringifyOptions: {
            stringLengthLimit: 1000,
            numOfKeysLimit: 100,
            depthOfLimit: 1
          },
          logger: window.console,
        })
      ],
    });

    console.log('🎬 开始录制...');
    message.success('开始录制');
  };

  // 停止录制
  const stopRecording = () => {
    if (stopFn) {
      stopFn();
      isRecording.value = false;
      console.log('⏹️ 停止录制, 共', events.value.length, '个事件');
      message.info(`停止录制，共 ${events.value.length} 个事件`);
    }
  };

  // 保存录制到服务器
  const saveRecording = async (metadata = {}) => {
    if (events.value.length === 0) {
      message.error('没有录制数据');
      throw new Error('没有录制数据');
    }

    isSaving.value = true;

    try {
      const result = await RecordingAPI.saveRecording(events.value, metadata);
      
      if (result.success) {
        currentRecordingId.value = result.recordingId;
        message.success('保存成功！');
        console.log('✅ 保存成功:', result);
        return result;
      } else {
        throw new Error(result.error || '保存失败');
      }
    } catch (error) {
      console.error('❌ 保存录制失败:', error);
      message.error('保存失败: ' + error.message);
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  // 获取最新事件（用于回放）
  const getLatestEvents = computed(() => {
    return eventsMatrix.value[eventsMatrix.value.length - 1];
  });

  // 打开回放页面
  const openPlayback = (recordingId) => {
    const id = recordingId || currentRecordingId.value;
    if (!id) {
      message.warning('没有可回放的录制');
      return;
    }
    RecordingAPI.openPlayback(id);
  };

  // 获取回放 URL
  const getPlaybackUrl = (recordingId) => {
    const id = recordingId || currentRecordingId.value;
    if (!id) return '';
    return RecordingAPI.getPlaybackUrl(id);
  };

  return {
    // 状态
    isRecording,
    events,
    eventsMatrix,
    currentRecordingId,
    isSaving,
    getLatestEvents,

    // 方法
    startRecording,
    stopRecording,
    saveRecording,
    openPlayback,
    getPlaybackUrl
  };
}


