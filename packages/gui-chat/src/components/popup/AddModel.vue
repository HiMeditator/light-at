<template>
  <div class="popup-background" @click="popupAddModel"></div>
  <div class="div-popup">
    <div class="popup-title">{{ $t('popup.addModel') }}</div>
    <div class="popup-info">
      <p v-show="modelConfig.type === 'openai'" v-html="openaiNote"></p>
      <p v-show="modelConfig.type === 'ollama'" v-html="ollamaNote"></p>
      <p v-show="modelConfig.type === 'openrouter'" v-html="openrouterNote"></p>
    </div>
    <form ref="modelForm">
      <div class="form-radio">
        <div
          @click="modelConfig.type = 'openai'"
          :class="{ checked: modelConfig.type === 'openai' }"
        >
          <OpenAI/>
          <span>openai</span>
        </div>
        <div
          @click="modelConfig.type = 'ollama'"
          :class="{ checked: modelConfig.type === 'ollama' }"
        >
          <Ollama/>
          <span>ollama</span>
        </div>
        <div
          @click="modelConfig.type = 'openrouter'"
          :class="{ checked: modelConfig.type === 'openrouter' }"
        >
          <OpenRouter/>
          <span>openrouter</span>
        </div>
      </div>
      <div class="form-entry">
        <label for="i-model">*model</label>
        <input type="text" id="i-model" name="model" required
          v-model="modelConfig.model"
          :placeholder="$t('popup.i_model')"
        >
      </div>
      <div class="form-entry">
        <label for="i-title">title</label>
        <input type="text" id="i-title" name="title"
          v-model="modelConfig.title"
          :placeholder="$t('popup.i_title')"
        >
      </div>
      <div class="form-entry" v-if="modelConfig.type === 'openai'">
        <label for="i-base_url">*baseURL</label>
        <input type="text" id="i-base_url" name="base_url" required
          v-model="modelConfig.baseURL"
          :placeholder="$t('popup.i_baseURL')"
        >
      </div>
      <div class="form-entry" v-if="modelConfig.type === 'ollama'">
        <label for="i-host">host</label>
        <input type="text" id="i-host" name="host"
          v-model="modelConfig.host"
          pattern="^((http:\/\/)?[\w\/.\-]+:)?[\d]+$"
          :placeholder="$t('popup.i_host')"
        >
      </div>
      <div class="form-entry" v-if="modelConfig.type === 'openai' || modelConfig.type === 'openrouter'">
        <label for="i-api_key">*apiKey</label>
        <input :type="apiKeyType" id="i-api_key" name="api_key" required
          v-model="modelConfig.apiKey"
          :placeholder="$t('popup.i_apiKey') + 'env@OPENAI_API_KEY or sk-xxx'"
        >
      </div>
      <div class="form-entry">
        <label for="i-system">prompt</label>
        <textarea id="i-system" name="system" rows="2"
          v-model="modelConfig.system"
          :placeholder="$t('popup.i_system')"
        ></textarea>
      </div>
      <div class="form-entry">
        <label for="i-params">params</label>
        <textarea id="i-params" name="params" rows="3"
          :class="{ code: true, 'red-border': !isParamsValid, shake: shakeParams }"
          v-model="modelConfig.customParams"
          :placeholder="$t('popup.i_params') + getParmsExample()"
          @animationend="shakeParams = false"
        ></textarea>
      </div>
      <button @click="submit">{{ $t('popup.submit') }}</button>
      <button @click.prevent="cancel">{{ $t('popup.cancel') }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import Ollama from '@/assets/icons/ollama.svg?component'
import OpenAI from '@/assets/icons/openai.svg?component'
import OpenRouter from '@/assets/icons/openrouter.svg?component'

import { ref, toRaw, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { modelAdd } from '@/api/sender'
import type { ModelConfig } from '@/types'

const props = defineProps<{popupAddModel: () => void}>()
const modelForm = ref<HTMLFormElement>()

const modelConfig = ref<ModelConfig>({
  type: 'openai',
  model: '',
  title: '',
  baseURL: '',
  host: '',
  apiKey: '',
  system: '',
  customParams: ''
})

const isParamsValid = ref(true)
const shakeParams = ref(false)

watch(() => modelConfig.value.customParams, (params) => {
  if (!params?.trim()) {
    isParamsValid.value = true
    return
  }
  try {
    const parsed = JSON.parse(params)
    isParamsValid.value = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
  } catch (error) {
    isParamsValid.value = false
  }
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
const openrouterNote = ref(
  t('popup.openrouterNote', {
    a: '<a href="https://openrouter.ai/">',
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

function getParmsExample() {
  if(modelConfig.value.type === 'ollama'){
    return '{"think": false}'
  }
  else{
    return '{"temperature": 0.8, "enable_thinking": false}'
  }
}

function submit(e: Event) {
  if(!modelForm.value?.checkValidity()) return
  e.preventDefault()
  if(!isParamsValid.value) {
    shakeParams.value = true
    return
  }
  let rawModelConfig: ModelConfig = toRaw(modelConfig.value)
  if(rawModelConfig.type === 'ollama'){
    delete rawModelConfig.baseURL
    delete rawModelConfig.apiKey
    if(rawModelConfig.host?.trim() === ''){
      delete rawModelConfig.host
    }
    else {
      if(rawModelConfig.host && rawModelConfig.host.match(/^[\d]+$/)) {
        rawModelConfig.host = `http://localhost:${rawModelConfig.host}`
      }
    }
  }
  if(rawModelConfig.type === 'openrouter'){
    delete rawModelConfig.baseURL
    delete rawModelConfig.host
  }
  if(rawModelConfig.type === 'openai'){
    delete rawModelConfig.host
  }
  if(rawModelConfig.title?.trim() === ''){
    delete rawModelConfig.title
  }
  if(rawModelConfig.system?.trim() === ''){
    delete rawModelConfig.system
  }
  if(rawModelConfig.customParams?.trim() === '') {
    delete rawModelConfig.customParams
  }
  modelAdd(JSON.stringify(rawModelConfig))
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
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 5px;
  border: 1px solid transparent;
  cursor: pointer;
  margin: auto 10px;
  padding: 4px 8px;
}

.form-radio svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.form-radio .checked svg {
  fill: var(--vscode-button-foreground, #ffffff);
}

.form-radio div:hover {
  color: var(--vscode-button-foreground, #ffffff);
  background-color: var(--vscode-button-hoverBackground, #0258a8);
}

.form-radio .checked {
  color: var(--vscode-button-foreground, #ffffff);
  background-color: var(--vscode-button-background, #005fb8);
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
  line-height: 1.6;
  width: calc(90% - min(30%, 60px));
  color: var(--vscode-input-foreground, #616161);
  border-radius: 2px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  background-color: var(--vscode-input-background, #ffffff);
}

form input:focus,
form textarea:focus {
  outline: none;
  border: 1px solid var(--vscode-button-hoverBackground, #0258a8);
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

.code {
	font-family: var(--vscode-editor-font-family, Consolas, 'Courier New', monospace);
}

.red-border {
  border-color: red !important;
}

.shake {
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(6px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}
</style>
