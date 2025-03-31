<template>
<div class="form-container">
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
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

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
</script>
<style lang="less" scope>
.form-container{
  width: 660px;
  margin: 0 auto;
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
