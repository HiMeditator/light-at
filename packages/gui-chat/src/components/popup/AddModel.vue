<template>
  <div class="popup-background" @click="popupAddModel"></div>
  <div class="div-popup">
    <div class="popup-title">{{ $t('popup.addModel') }}</div>
    <div class="popup-info">
      <p v-show="modelConfig.type === 'openai'" v-html="openaiNote"></p>
      <p v-show="modelConfig.type === 'ollama'" v-html="ollamaNote"></p>
    </div>
    <form ref="modelForm">
      <div class="form-radio">
        <div 
          @click="modelConfig.type = 'openai'"
          :class="{ checked: modelConfig.type === 'openai' }"
        >
          <FontAwesomeIcon :icon="faHexagonNodes" />
          <span>openai</span>
        </div>
        <div
          @click="modelConfig.type = 'ollama'"
          :class="{ checked: modelConfig.type === 'ollama' }"
        >
          <FontAwesomeIcon :icon="faCircleNodes" />
          <span>ollama</span>
        </div>
      </div>
      <div class="form-entry">
        <label for="i-model">*model</label>
        <input type="text" id="i-model" name="model" required
          v-model="modelConfig.model"
        >
      </div>
      <div class="form-entry">
        <label for="i-title">title</label>
        <input type="text" id="i-title" name="title"
          v-model="modelConfig.title"
        >
      </div>
      <div class="form-entry" v-if="modelConfig.type === 'openai'">
        <label for="i-base_url">*baseURL</label>
        <input type="text" id="i-base_url" name="base_url" required
          v-model="modelConfig.baseURL"
        >
      </div>
      <div class="form-entry" v-if="modelConfig.type === 'openai'">
        <label for="i-api_key">*apiKey</label>
        <input :type="apiKeyType" id="i-api_key" name="api_key" required
          v-model="modelConfig.apiKey"
        >
      </div>
      <div class="form-entry">
        <label for="i-system">system</label>
        <textarea id="i-system" name="system" rows="2" placeholder="system prompt"
          v-model="modelConfig.system"
        ></textarea>
      </div>
      <button @click.prevent="submit">{{ $t('popup.submit') }}</button>
      <button @click.prevent="cancel">{{ $t('popup.cancel') }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw, defineProps, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ModelConfig } from '@/types'
import { useSenderStore } from '@/stores/sender'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faHexagonNodes, faCircleNodes } from '@fortawesome/free-solid-svg-icons'

const props = defineProps<{popupAddModel: () => void}>()
const modelForm = ref<HTMLFormElement>()

const modelConfig = ref<ModelConfig>({
  type: 'openai',
  model: '',
  title: '',
  baseURL: '',
  apiKey: '',
  system: ''
})

const { t } = useI18n()
const openaiNote = ref(
  t('popup.openaiNote', {
    a: '<a href="https://github.com/openai/openai-node">',
    _a: '</a>'
  })
)
const ollamaNote = ref(
  t('popup.ollamaNote', {
    a: '<a href="https://ollama.com/">',
    _a: '</a>'
  })
)

const prefix = ['e', 'en', 'env', 'env@']
let apiKeyType = computed( () => {
  let index = modelConfig.value.apiKey?.length || 1
  index = index > 4 ? 4 : index
  if(modelConfig.value.apiKey?.startsWith(prefix[index-1])){
    return 'text'
  }
  else{
    return 'password'
  }
})

function submit() {
  if(!modelForm.value?.checkValidity()) return
  let rawModelConfig: ModelConfig = toRaw(modelConfig.value)
  if(rawModelConfig.type === 'ollama'){
    delete rawModelConfig.baseURL
    delete rawModelConfig.apiKey
  }
  if(rawModelConfig.title?.trim() === ''){
    delete rawModelConfig.title
  }
  if(rawModelConfig.system?.trim() === ''){
    delete rawModelConfig.system
  }
  useSenderStore().modelAdd(JSON.stringify(rawModelConfig))
  modelForm.value?.reset()
  props.popupAddModel()
}

function cancel() {
  modelForm.value?.reset()
  props.popupAddModel()
}
</script>

<style scoped>
@import '../../assets/css/popup.css';

.form-radio {
  display: flex;
  justify-content: center;
}

.form-radio div {
  display: inline-block;
  border-radius: 5px;
  border: 1px solid transparent;
  line-height: 24px;
  cursor: pointer;
  margin: auto 10px;
  padding: 2px 4px;
}

.form-radio svg {
  padding-right: 2px;
}

.form-radio div:hover {
  color: var(--vscode-button-foreground, #ffffff);
  background-color: var(--vscode-button-hoverBackground, #5a4579);
}

.form-radio .checked {
  color: var(--vscode-button-foreground, #ffffff);
  background-color: var(--vscode-button-background, #705697);
}

.form-entry {
  margin: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

form label {
  display: inline-block;
  width: min(30%, 65px);
  margin-right: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

form input,
form textarea {
  display: inline-block;
  width: calc(90% - min(30%, 60px));
  color: var(--vscode-input-foreground, #616161);
  border-radius: 2px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  background-color: var(--vscode-input-background, #ffffff);
}

form input:focus,
form textarea:focus {
  outline: none;
  border: 1px solid var(--vscode-button-hoverBackground, #5a4579);
}

form textarea {
  overflow: auto;
  scrollbar-width: thin;
  resize: vertical;
  max-height: 30vh;
}

form button {
  padding: 6px;
  width: 36%;
  margin: auto 5px;
}
</style>