<template>
  <div class="popup-background" @click="popupDeleteModel"></div>
  <div class="div-popup">
    <div class="popup-title">{{ $t('popup.deleteModel') }}</div>
    <div class="popup-info">
      <p>
        {{ $t('popup.deleteNote') }}
        <b>{{ deleteModel?.name }}</b>
      </p>
    </div>
    <div class="div-sep"></div>
    <button @click="confirm">{{ $t('popup.yes') }}</button>
    <button @click="cnacel">{{ $t('popup.no') }}</button>
  </div>
</template>

<script setup lang="ts">
import type { Model } from '@/types'
import { useSenderStore } from '@/stores/sender'

const props = defineProps<{
  deleteModel: Model | undefined,
  popupDeleteModel: () => void
}>();

function confirm() {
  const modelID = props.deleteModel?.id || '';
  useSenderStore().modelDelete(modelID)
  props.popupDeleteModel()
}

function cnacel() {
  props.popupDeleteModel()
}
</script>

<style scoped>
@import '../../assets/css/popup.css';

.div-sep {
  height: 10px;
}

button {
  padding: 6px;
  width: 36%;
  margin: auto 5px;
}
</style>