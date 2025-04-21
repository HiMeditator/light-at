<template>
  <div class="input-upper" @click.stop>
    <div class="dropup-box">
      <div class="dropup-option" v-if="displayContext">
        <ul class="dropup-list">
          <span v-for="(val, key) in contextMap" :key="key">
            <li
              v-show="!val.selected && (key as string).includes(search)"
              @click="val.selected = !val.selected"
              :class="{ selected: val.selected }"
            >
              <span>{{ val.name === '[selected]' ? $t('input.selected') : val.name }}</span>
              <sub>{{ key }}</sub>
            </li>
          </span>
          <li v-show="!Object.keys(contextMap).length">
            <sub>{{ $t('input.noContextInfo') }}</sub>
          </li>
        </ul>
        <div class="search-box">
          <input
            type="text"
            class="context-search"
            v-model="search"
            :placeholder="$t('input.searchConext')"
          >
        </div>
      </div>
      <div 
        class="stop-generation"
        v-show="sendDisable"
        @click="sendStore.responseStop()"
      >
        <FontAwesomeIcon :icon="faPause" />
        <span>{{ $t('input.stopGeneration') }}</span>
      </div>
      <div class="add-context" @click="getContext">
        <FontAwesomeIcon :icon="faPlus" />
        <span>{{ $t('input.addContext') }}</span>
      </div>
    </div>
    <div v-for="(val, path) in contextMap" :key="path">
      <div class="selected-context" v-show="val.selected">
        <span @click="val.selected = !val.selected">{{ val.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSenderStore } from '@/stores/sender'
import { useListenerStore } from '@/stores/listener'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPause, faPlus } from '@fortawesome/free-solid-svg-icons'

const displayContext = ref(false)
const listenerStore = useListenerStore()
const { sendDisable, contextMap } = storeToRefs(listenerStore)
const sendStore = useSenderStore()
const search = ref('')

// contextMap.value = {
//   'c:data/function.ts': { name: 'function.ts', selected: false },
//   'c:data/index.ts': { name: 'index.ts', selected: false },
//   'c:data/utils.ts': { name: 'utils.ts', selected: false },
//   'c:data/types.ts': { name: 'types.ts', selected: false },
//   'c:data/test/longlong/config.ts': { name: 'config.ts', selected: false }
// }

function getContext() {
  if (!displayContext.value) {
    sendStore.contextGet()
  }
  displayContext.value = !displayContext.value
}

document.addEventListener('click', (e) => {
  if (displayContext.value) {
    displayContext.value = false
  }
})
</script>

<style scoped>
@import '../../assets/css/dropup2.css';

.input-upper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  padding: 6px 12px;
  border-radius: 5px;
  border: 1px solid rgba(128, 128, 128, 0.4);
}

.search-box:focus-within {
  border: 1px solid var(--vscode-button-hoverBackground, #5a4579);
}

.context-search {
  border: none;
  width: 100%;
  color: var(--vscode-input-foreground, #616161);
  background-color: var(--vscode-input-background, #ffffff);
}

.context-search:focus {
  outline: none;
}

.add-context,
.stop-generation {
  user-select: none;
  display: inline-block;
  padding: 2px 4px;
  margin: 5px;
  border-radius: 5px;
  background-color: rgba(128, 128, 128, 0.1);
}

.stop-generation svg,
.add-context svg {
  margin-left: 2px;
  margin-right: 3px;
}

.stop-generation:hover,
.add-context:hover {
  background-color: rgba(128, 128, 128, 0.2);
}


/* .dropup-option {
  box-shadow: 0 0 4px 2px rgba(128, 128, 128, 0.4);
} */

.selected-context {
  user-select: none;
  border-radius: 5px;
  padding: 2px 4px;
  margin: 5px;
  box-sizing: border-box;
  color: var(--vscode-foreground, #616161);
  background-color: rgba(128, 128, 128, 0.1);
}

.selected-context:hover {
  cursor: pointer;
  background-color: rgba(128, 128, 128, 0.2);
}
</style>