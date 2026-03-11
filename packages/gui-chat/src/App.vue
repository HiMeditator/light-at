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
import { useSenderStore } from './stores/sender'
import { onMounted } from 'vue'

onMounted(() => {
  useSenderStore().initReady()
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
