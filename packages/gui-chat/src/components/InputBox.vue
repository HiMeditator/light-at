<template>
  <div class="input-box">
    <InputUpper />
    <textarea
      rows="1" :placeholder="$t('input.textarea')"
      ref="taInput" @keydown="handleKeydown"
    ></textarea>
    <InputLower :sendRequest = "sendRequest"/>
  </div>
</template>

<script setup lang="ts">
import autosize from 'autosize'
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useListenerStore } from '@/stores/listener'
import { useSenderStore } from '@/stores/sender'
import InputUpper from './input/InputUpper.vue'
import InputLower from './input/InputLower.vue'

const listenerStore = useListenerStore()
const { sendDisable, sendShortcut, contextMap } = storeToRefs(listenerStore)
const taInput = ref<HTMLTextAreaElement>()

function handleKeydown(e: KeyboardEvent) {
  if(sendShortcut.value === 'Ctrl+Enter' && e.ctrlKey && e.key === 'Enter'){
    sendRequest()
  }
  else if(sendShortcut.value === 'Enter' && !e.ctrlKey && e.key === 'Enter'){
    sendRequest()
    e.preventDefault()
  }
}

function processContext(): string {
  const contextList = []
  for (const [key, value] of Object.entries(contextMap.value)) {
    if (value.selected) {
      contextList.push(key)
    }
  }
  contextMap.value = {}
  return JSON.stringify(contextList)
}

function sendRequest() {
  if(sendDisable.value){
    return
  }
  if(!sendDisable.value && taInput.value) {
    const request = taInput.value.value;
    if (request.trim()) {
      useSenderStore().requestSend(
        taInput.value.value,
        processContext()
      )
      taInput.value.value = '';
      taInput.value.style.height = 'auto';
    } 
  }
}

onMounted(() => {
  if (taInput.value) {
    autosize(taInput.value);
  }
})
</script>

<style scoped>
.input-box {
  margin: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  background-color: var(--vscode-input-background, #ffffff);
}

.input-box:focus-within {
  border: 1px solid var(--vscode-button-hoverBackground, #0258a8);
}

textarea {
  width: 100%;
  max-height: 40vh;
  font-size: 13px;
  line-height: 1.5em;
  overflow-x: auto !important;
  scrollbar-width: thin;
  padding: 5px;
  box-sizing: border-box;
  color: var(--vscode-input-foreground, #616161);
  background-color: var(--vscode-input-background, #ffffff);
  resize: none;
  border: none;
}

textarea:focus {
  outline: none;
}
</style>
