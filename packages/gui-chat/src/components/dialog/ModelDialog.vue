<template>
  <div class="model-dialog">
    <div class="model-info">
      <div class="model-head">
        <Ollama v-if="props.dialog.type === 'ollama'"/>
        <OpenAI v-else-if="props.dialog.type === 'openai'"/>
        <OpenRouter v-else-if="props.dialog.type === 'openrouter'"/>
        <FontAwesomeIcon v-else :icon="faLightbulb" />
      </div>
      <div class="model-name">{{ dialog.name }}</div>
      <div class="dialog-control">
        <FontAwesomeIcon
          v-if="hasThinking"
          @click="clickChevron"
          :icon="showThinking ? faChevronUp : faChevronDown"
          :title="$t('dialog.thinking')"
        />
        <FontAwesomeIcon
          @click="copyDialog"
          :icon="isCopied ? faCheck : faClipboard"
          :title="$t('dialog.copy')"
        />
        <FontAwesomeIcon
          v-if="dialog.type"
          @click="deleteDialog"
          :icon="faXmark"
          :title="$t('dialog.delete')"
        />
      </div>
    </div>
    <div class="model-content">
      <div
        :class="[
          'thinking-content', 
          showThinking ? '' : 'thinking-content-collpase'
        ]"
        @dblclick="clickChevron"
        v-if="hasThinking"
      >
        <template v-if="showThinking">
          <MarkdownContent :content="thinking" />
        </template>
        <template v-else>
          {{ thinking }}
        </template>
      </div>
      <MarkdownContent :content="content" />
      <div class="div-tokens" v-if=" (dialog.prompt_tokens && dialog.completion_tokens)">
        <span :title="$t('dialog.prompt_tokens')">
          prompt_tokens: {{ dialog.prompt_tokens }}
        </span>
        <span :title="$t('dialog.completion_tokens')">
          completion_tokens: {{ dialog.completion_tokens }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Ollama from '@/assets/icons/ollama.svg?component'
import OpenAI from '@/assets/icons/openai.svg?component'
import OpenRouter from '@/assets/icons/openrouter.svg?component'

import { ref, watch } from 'vue'
import MarkdownContent from './MarkdownContent.vue'
import type { ModelDialogItem } from '@/types'
import { useSenderStore } from '@/stores/sender'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronUp, faChevronDown, faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { faClipboard, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons'
const props = defineProps<{ dialog: ModelDialogItem }>()
const isCopied = ref(false);

const hasThinking = ref(false)
const showThinking = ref(true)
const clickThinking = ref(false)
const thinking = ref('')
let content = ref('')

function clickChevron() {
  showThinking.value = !showThinking.value
  clickThinking.value = true
}

function updateContent() {
  if(props.dialog.content.startsWith('<think>')){
    hasThinking.value = true
    const pos = props.dialog.content.indexOf('</think>')
    if(pos < 0) {
      if(!clickThinking.value){
        showThinking.value = true
      }
      thinking.value = props.dialog.content.substring(7)
    }
    else{
      if(props.dialog.type && !clickThinking.value) {
        showThinking.value = false
      }
      thinking.value = props.dialog.content.substring(7, pos)
      content.value = props.dialog.content.substring(pos + 8)
    }
    if(!thinking.value.trim()) {
      hasThinking.value = false
    }
  }
  else {
    content.value = props.dialog.content
  }
}

updateContent()

watch(() => props.dialog.content, () => {
  updateContent()
})

function copyDialog() {
  navigator.clipboard.writeText(props.dialog.content)
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 500);
}

function deleteDialog() {
  useSenderStore().dialogDelete(props.dialog.id)
}
</script>

<style scoped>
.model-dialog {
  margin: 10px;
  padding: 10px;
  color: var(--vscode-foreground, #616161);
  background-color: rgba(128, 128, 128, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.model-dialog:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.model-info {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.model-head {
  width: 28px;
  height: 28px;
  color: white;
  border-radius: 50%;
  margin: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: cornflowerblue;
}

.model-head svg {
  width: 21px;
  height: 21px;
  fill: white;
}

.model-name {
  display: inline-block;
  max-width: calc(100vw - 150px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-control {
  display: none;
  position: absolute;
  padding: 5px 10px;
  border-radius: 5px;
  right: -5px;
  top: 0;
}

.model-dialog:hover .dialog-control {
  display: block;
}

.dialog-control svg{
  margin: auto 5px;
  cursor: pointer;
}

.dialog-control svg:active{
  transform: scale(1.25);
}

.model-content {
  line-height: 1.6em;
  margin: 5px;
}

.thinking-content {
  margin: 10px 5px;
  padding: 10px;
  border-radius: 10px;
  background-color: rgba(128, 128, 128, 0.05);
  border-left: 5px solid rgba(128, 128, 128, 0.5);
}

.thinking-content:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.thinking-content-collpase {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  display: block;
  min-height: 1.6em;
  max-width: 100%;
}

.div-tokens span {
  display: inline-block;
  padding: 2px 5px;
  margin-top: 10px;
  margin-right: 10px;
  border-radius: 5px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  background-color: rgba(128, 128, 128, 0.1);
}

.div-tokens span:hover {
  border: 1px solid var(--vscode-button-hoverBackground, #0258a8);
}
</style>
