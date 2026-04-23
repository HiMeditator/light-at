<template>
  <div class="root">
    <DialogBox />
    <div class="sep-line"></div>
    <InputBox />
  </div>
</template>

<script setup lang="ts">
import DialogBox from './components/DialogBox.vue'
import InputBox from './components/InputBox.vue'
import { onMessage } from './api/listener'
import { initReady } from './api/sender'
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('message', onMessage)
  initReady()
})

onUnmounted(() => {
  window.removeEventListener('message', onMessage)
})
</script>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sep-line {
  border-top: 1px solid #9995;
}
</style>
