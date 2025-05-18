<template>
  <div class="user-dialog">
    <div class="user-info">
      <div class="user-head">
        <FontAwesomeIcon :icon="faUser" />
      </div>
      <div class="user-name">User</div>
    </div>
    <div class="user-content">
      <div class="dialog-content">{{ dialog.content.trim() }}</div>
      <div class="dialog-context-file" v-if="dialog.context.length">
        <span
          v-for="path in dialog.context"
          :key="path"
        >
          <span @click="senderStore.contextGoto(path)">
            {{
              path === '[selected]' ? $t('input.selected') :
                path.split('/').pop()?.split('\\').pop()
            }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { UserDialogItem } from '@/types';
import MarkdownContent from './MarkdownContent.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { useSenderStore } from '@/stores/sender';
const senderStore = useSenderStore()
defineProps<{ dialog: UserDialogItem }>();
</script>

<style scoped>
.user-dialog {
  margin: 10px;
  padding: 10px;
  color: var(--vscode-foreground, #616161);
  background-color: rgba(128, 128, 128, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(128, 128, 128, 0.1);
}

.user-dialog:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
}

.user-head {
  width: 24px;
  height: 24px;
  color: white;
  border-radius: 50%;
  margin: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: blueviolet;
}

.user-name {
  display: inline-block;
}

.user-content {
  line-height: 1.6em;
  margin: 5px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.dialog-content {
  white-space: pre-wrap;
}

.dialog-context-file{
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.dialog-context-file>span{
  display: inline-block;
  padding: 2px 4px;
  border-radius: 5px;
  margin: 2px 5px;
  background-color: rgba(128, 128, 128, 0.1);
}

.dialog-context-file>span:hover{
  cursor: pointer;
  background-color: rgba(128, 128, 128, 0.2);
}
</style>