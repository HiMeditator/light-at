import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ModelItem, ContextMap } from '@/types';

export const useAgentStore = defineStore('agent', () => {
    const models = ref<ModelItem[]>([]);
    const modelID = ref<string>('');
    const contextMap = ref<ContextMap>({});

    function contextSend(contextStr: string){
        contextMap.value = {};
        const context = JSON.parse(contextStr);
        for(let item of context){
            const isSelected = contextMap.value[item]?.selected;
            contextMap.value[item] = {
                name: item.split('/').pop().split('\\').pop(),
                selected: isSelected ?? false
            }
        }
    }

    return {
        models,
        modelID,
        contextMap,
        contextSend
    };
})
