<template>
  <div class="input-lower">
    <div class="dropup-box">
      <div class="dropup-option">
        <ul class="dropup-list">
          <li
            v-for="model in models"
            :key="model.id"
            :class="{selected: model.id === modelID}"
            @click="changeModelID(model.id)"
          >
            <FontAwesomeIcon :icon="getSvgIcon(model.type)" />
            <span>{{ model.name }}</span>
            <FontAwesomeIcon :icon="faXmark" @click="popupDeleteModel(model)" />
          </li>
        </ul>
        <div class="extra-option" @click="popupAddModel">
          <FontAwesomeIcon :icon="faPlus" />
          <span>{{ $t('input.addModel') }}</span>
        </div>
        <div class="extra-option" @click="updateConfig">
          <FontAwesomeIcon :icon="faRotateRight" />
          <span>{{ $t('input.loadConfig') }}</span>
        </div>
      </div>
      <div class="model-name">
        <span>{{ modelName }}</span>
        <FontAwesomeIcon :icon="faChevronDown" />
      </div>
    </div>
    <div class="send-prompt" @click="sendRequest">
      <span>{{ sendShortcut }}</span>
      <FontAwesomeIcon v-if="sendDisable" :icon="faSpinner" spin />
      <FontAwesomeIcon v-else :icon="faArrowRight" />
    </div>
  </div>
  <Teleport to="body">
    <AddModel
      v-if="addModelPopup"
      :popupAddModel="popupAddModel"
    />
  </Teleport>
  <Teleport to="body">
    <DeleteModel
      v-if="deleteModelPopup"
      :deleteModel="deleteModel"
      :popupDeleteModel="popupDeleteModel"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Model } from '@/types'
import { storeToRefs } from 'pinia'
import { useListenerStore } from '@/stores/listener'
import AddModel from '../popup/AddModel.vue'
import DeleteModel from '../popup/DeleteModel.vue' 

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faHexagonNodes, faCircleNodes } from '@fortawesome/free-solid-svg-icons'
import { faPlus, faRotateRight, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { faChevronDown, faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useSenderStore } from '@/stores/sender'

const listenerStore = useListenerStore()
const { models, modelID, sendDisable, sendShortcut } = storeToRefs(listenerStore)
const modelName = computed(() => {
  const findModel = models.value.find(model => model.id === modelID.value)
  if (findModel) {
    return findModel.name
  } else {
    return useI18n().t('input.selectModel')
  }
})

defineProps<{
  sendRequest: () => void
}>()

const addModelPopup = ref(false)
const deleteModelPopup = ref(false)
const deleteModel = ref<Model>()
const sendStore = useSenderStore()
function popupAddModel(){
  addModelPopup.value = !addModelPopup.value
}
function popupDeleteModel(model?: Model){
  deleteModelPopup.value = !deleteModelPopup.value
  if(model){
    deleteModel.value = model 
  }
}

function changeModelID(newID: string) {
  if(newID === modelID.value) return
  useSenderStore().modelIDUpdate(newID)
}
function updateConfig() {
  sendStore.configUpdate()
}

function getSvgIcon(modelType: string){
  if(modelType === 'ollama'){
    return faCircleNodes;
  }
  return faHexagonNodes;
}
</script>

<style scoped>
@import '../../assets/css/dropup.css';

.input-lower {
  display: flex;
  margin: auto 5px;
  color: var(--vscode-disabledForeground, rgba(97, 97, 97, 0.5));
  align-items: center;
  justify-content: space-between;
  /* border: 1px solid black; */
}

li svg, .extra-option svg {
  margin-right: 2px;
}

li svg:last-child {
  display: none;
  margin-left: auto;
}

li:hover svg:last-child {
  display: inline-block;
}

li:hover svg:last-child:hover {
  background-color: rgba(128, 128, 128, 0.2);
}

span+svg {
  margin-left: 3px;
}

.extra-option {
  width: auto;
  white-space: nowrap;
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}

.extra-option:hover {
  background-color: rgba(128, 128, 128, 0.15);
}

.model-name {
  user-select: none;
  display: inline-block;
  max-width: 60vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.send-prompt {
  user-select: none;
  cursor: pointer;
  max-width: 30vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.send-prompt:hover {
  color: var(--vscode-foreground, #616161);
}
</style>