
<template>
  <div>
    <h2 class="title">首页</h2>
    <p>操作报错录制工具</p>
    <a-button type="primary" @click="toFrom">跳转到表单页面</a-button>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const toFrom = () => {
  router.push('/from');
}
</script>
<style scoped>
.title {
  font-size: 20px;
  font-weight: bold;
  color: #000;
}
.button {
  margin-top: 20px;
}
</style>
