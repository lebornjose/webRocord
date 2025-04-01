<template>
<div class="form-container">
  <div class="interaction rr-block">
        <a-button type="primary" @click="record">录制</a-button>
        <a-button type="success" @click="replay">回放</a-button>
        <a-button type="warning" @click="reset">返回演示</a-button>
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
    <a-button type="primary">确定</a-button>
    <a-button>取消</a-button>
  </div>

  <div ref="replayer"></div>
</div>
</template>

<script lang="js" setup>
import { ref } from 'vue'
import { record, getRecordConsolePlugin } from 'rrweb'
import rrwebPlayer from 'rrweb-player'

const eventsMatrix = ref([[]])  // 使用二维数组来存放多个 event 数组
const replayer = ref(null)
const wrapperCol = { span: 14 };
const labelCol = { style: { width: '150px' } };
const formState = ref<{
  name: string;
  delivery: boolean;
  type: string[];
  desc: string;
}>({
  name: '',
  delivery: false,
  type: [],
  desc: ''
});
const stopFn = ref(null)

const record = () => {
  console.log('录制');
  stopFn.value = record({
    checkoutEveryNth: 100, // 每 100 个 event 重新制作快照
    emit(event, isCheckout) {
        // isCheckout 是一个标识，告诉你重新制作了快照
        if (isCheckout) {
            eventsMatrix.value.push([]);
        }
        const lastEvents = eventsMatrix.value[eventsMatrix.value.length - 1];
        lastEvents.push(event);
    },
    // 定制的选项
    plugins: [getRecordConsolePlugin({
            level: ["info", "log", "warn", "error"],
            lengthThreshold: 10000,
            stringifyOptions: {
            stringLengthLimit: 1000,
            numOfKeysLimit: 100,
            depthOfLimit: 1
        },
        logger: window.console,
    })],
  });
}
const replay = () => {
  console.log('最近的操作记录: ', JSON.stringify(eventsMatrix.value[eventsMatrix.value.length - 1]));
  if(eventsMatrix.value[eventsMatrix.value.length - 1].length<=0) {
    return this.$message.error("请先点击录制按钮进行录制！");
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
const reset = () => {
  console.log('返回演示');
}

</script>
<style lang="less" scope>
.form-container{
  width: 660px;
  margin: 0 auto;
  .interaction{
    margin-bottom: 20px;
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
</style>
