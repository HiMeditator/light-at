<template>
  <div class="markdown-block" ref="renderNode">
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { renderMarkdownContent, finalizeRendering } from "@/utils/renderMarkdownContent"
const props = defineProps<{ content: string; isStreaming?: boolean }>()
let renderNode = ref<HTMLElement>()
let pendingContent: string | null = null
let rafId: number | null = null

function scheduleRender(content: string) {
  pendingContent = content
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    if (renderNode.value && pendingContent !== null) {
      renderMarkdownContent(renderNode.value, pendingContent, props.isStreaming ?? false)
      pendingContent = null
    }
  })
}

watch(() => props.isStreaming, (newVal, oldVal) => {
  if (oldVal === true && newVal === false && renderNode.value) {
    finalizeRendering(renderNode.value)
  }
})

onMounted(() => {
  if(renderNode.value){
    renderMarkdownContent(renderNode.value, props.content, props.isStreaming ?? false)
  }
})

watch(() => props.content, (newContent) => {
  scheduleRender(newContent)
})

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
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