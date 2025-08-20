<template>
  <div class="markdown-block" ref="renderNode">
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { renderMarkdownContent } from "@/utils/renderMarkdownContent";
const props = defineProps<{ content: string }>()
let renderNode = ref<HTMLElement>()

onMounted(() => {
  if(renderNode.value){
    renderMarkdownContent(renderNode.value, props.content)
  }
})

watch(() => props.content, () => {
  if(renderNode.value){
    // console.log('Render new content @',props.content)
    renderMarkdownContent(renderNode.value, props.content)
  }
})
</script>

<style scoped>
:deep(h1) {
	font-size: 1.6em;
}

:deep(h2) {
	font-size: 1.4em;
}

:deep(pre) {
  position: relative;
}

:deep(code) {
  font-size: 13px;
  overflow-y: auto;
  border-radius: 5px;
}

:deep(.code-info-div svg) {
  height: 1em;
  width: 1em;
  fill: currentColor;
}

:deep(.code-info-div svg) {
  margin: auto 4px;
  cursor: pointer;
}

:deep(.code-info-div) {
  display: none;
  position: absolute;
  top: -10px;
  right: 10px;
  padding: 2px 5px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 5px;
}

:deep(pre:hover .code-info-div) {
  display: block;
}

:deep(ul) {
  padding-left: 20px;
}

:deep(ol) {
  padding-left: 20px;
}
</style>