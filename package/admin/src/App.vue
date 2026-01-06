<template>
  <a-config-provider :theme="{ token: { colorPrimary: '#1890ff' } }">
    <router-view />
  </a-config-provider>
</template>

<script setup>
// Main App Component
</script>

<style>
#app {
  min-height: 100vh;
  background: #f0f2f5;
}
</style>
