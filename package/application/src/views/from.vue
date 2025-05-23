<template>
<div class="form-container">
  <div class="interaction rr-block">
        <a-button type="primary" :disabled="isRecord" @click="recordPlay">{{ isRecord ? '录制中...' : '录制' }}</a-button>
        <a-button type="primary" success @click="replay">回放</a-button>
        <a-button type="primary" danger @click="reset">返回演示</a-button>
   </div>
  <a-form :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
    <a-form-item label="姓名">
      <a-input v-model:value="formState.name" />
    </a-form-item>
    <a-form-item label="性别">
      <a-switch v-model:checked="formState.delivery" />
    </a-form-item>
    <a-form-item label="爱好">
      <a-checkbox-group v-model:value="formState.type">
        <a-checkbox value="1" name="type">篮球</a-checkbox>
        <a-checkbox value="2" name="type">足球</a-checkbox>
        <a-checkbox value="3" name="type">围棋</a-checkbox>
      </a-checkbox-group>
    </a-form-item>
    <a-form-item label="介绍">
      <a-textarea v-model:value="formState.desc" aria-placeholder="输入简介"/>
    </a-form-item>
  </a-form>  
  
  <div class="bottom">
    <!-- <a-button type="primary" @click="onSubmit">打印表单数据</a-button> -->
    <a-button type="primary" danger @click="logError">手动抛错</a-button>
  </div>

  <div ref="replayer" class="replay-container"></div>
</div>
</template>

<script lang="js" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue';
import { record, getRecordConsolePlugin, getReplayConsolePlugin } from 'rrweb'
import rrwebPlayer from 'rrweb-player'

const isRecord = ref(false)
const eventsMatrix = ref([[]])  // 使用二维数组来存放多个 event 数组
const replayer = ref(null)
const wrapperCol = { span: 14 };
const labelCol = { style: { width: '150px' } };
const formState = ref({
  name: '',
  delivery: false,
  type: [],
  desc: ''
});
const stopFn = ref(null)

const recordPlay = () => {
  console.log('录制');
  isRecord.value = true
  stopFn.value = record({
    checkoutEveryNth: 100, // 每 100 个 event 重新制作快照
    emit(event, isCheckout) {
        // isCheckout 是一个标识，告诉你重新制作了快照
        if (isCheckout) {
            eventsMatrix.value.push([]);
        }
          // 将事件添加到最新的事件数组中
        const lastEvents = eventsMatrix.value[eventsMatrix.value.length - 1];
        lastEvents.push(event);
    },
    // 定制的选项
    plugins: [getRecordConsolePlugin({
            level: ["info", "log", "warn", "error"], // 记录这些级别的日志
            lengthThreshold: 10000,  // 日志长度阈值
            stringifyOptions: { // 日志序列化选项
            stringLengthLimit: 1000, // 字符串长度限制
            numOfKeysLimit: 100,   // 对象键数量限制
            depthOfLimit: 1   // 对象深度限制
        },
        logger: window.console, // 使用浏览器的console对象
    })],
  });
}
const replay = () => {
  isRecord.value = false
  console.log('最近的操作记录: ', JSON.stringify(eventsMatrix.value[eventsMatrix.value.length - 1]));
  if(eventsMatrix.value[eventsMatrix.value.length - 1].length<=0) {
    return message.error("请先点击录制按钮进行录制！");
  }
  stopFn.value()
  new rrwebPlayer({
        target: replayer.value, // 可以自定义 DOM 元素
        // 配置项
        props: {
          logConfig: true,
          events: eventsMatrix.value[eventsMatrix.value.length - 1],
          plugins: [
            getReplayConsolePlugin({
                level: ['info', 'log', 'warn', 'error'],
            }),
          ],
        },
    });
  console.log('回放');
}

const logError = () => {
  throw new Error('手动抛错')
}
const reset = () => {
  console.log('返回演示');
  isRecord.value = false
  location.reload
}

</script>
<style lang="less" scope>
.form-container{
  width: 660px;
  margin: 0 auto;
  .interaction{
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    gap: 12px
  }
  .bottom{
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }
}
:deep(.ant-form-item) {
  display: flex;
}
:deep(.ant-form-item-control-input-content) {
  text-align: left;
}
.ant-form-item-control-input-content{
  text-align: left;
}

.replay-container{
  position: absolute;
  top: 0;
  left: 0;
  .rr-player{
    position: absolute;
    top: 50%;
    left: 50%;
  }
}
</style>
