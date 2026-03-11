<template>
  <div class="dialog-box">
    <ModelDialog
      v-show="!dialogs.length && welcomeInfo"
      :dialog="welcomeDialog"
    />
    <div v-for="dialog in dialogs" :key="dialog.id" class="dialog-item">
      <ModelDialog v-if="'name' in dialog" :dialog="dialog" />
      <UserDialog v-else :dialog="dialog" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref,watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import type { ModelDialogItem} from '@/types'
import { useDialogStore } from '@/stores/useDialogStore'
import { useConfigStore } from '@/stores/useConfigStore'
import UserDialog from './dialog/UserDialog.vue'
import ModelDialog from './dialog/ModelDialog.vue'

const configStore = useConfigStore()
const dialogStore = useDialogStore()
const { welcomeInfo } = storeToRefs(configStore)
const { dialogs } = storeToRefs(dialogStore)

const { t, locale } = useI18n()
const welcomeDialog = ref<ModelDialogItem>({
  id: 'welcome',
  content: t('dialog.welcomeMessage', {
    think: '<think>',
    _think: '</think>',
    manual: 'https://github.com/HiMeditator/light-at/tree/main/docs',
    github: 'https://github.com/HiMeditator/light-at'
  }),
  type: undefined,
  name: t('dialog.pluginName')
})
watch(locale, () => {
  welcomeDialog.value = {
    id: 'welcome',
    content: t('dialog.welcomeMessage', {
      think: '<think>',
      _think: '</think>',
      manual: 'https://github.com/HiMeditator/light-at/tree/main/docs',
      github: 'https://github.com/HiMeditator/light-at'
    }),
    type: undefined,
    name: t('dialog.pluginName')
  }
  // console.log(welcomeDialog.value.content)
})
</script>

<style scoped>
.dialog-box {
  flex: 1;
  overflow: auto;
  scrollbar-width: thin;
}
</style>
