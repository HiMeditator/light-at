import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DialogItem } from '@/types';

export const useDialogStore = defineStore('dialog', () => {
    const canSendRequest = ref(true);
    const dialogs = ref<DialogItem[]>([]);

    function responseNew(message: any){
        canSendRequest.value = false;
        dialogs.value.push({
            id: message.requestID,
            content: '',
            type: message.type,
            name: message.name
        });
    }

    function responseStream(message: any){
        if(
            dialogs.value.length && 
            dialogs.value[dialogs.value.length - 1].id === message.requestID
        ) {
            dialogs.value[dialogs.value.length - 1].content += message.data;
        }
    }

    function responseEnd(message: any){
        canSendRequest.value = true;
        if(
            dialogs.value.length && 
            dialogs.value[dialogs.value.length - 1].id === message.requestID
        ) {
            const lastDialog = dialogs.value[dialogs.value.length - 1];
            if('name' in lastDialog){
                lastDialog.prompt_tokens = message.prompt_tokens;
                lastDialog.completion_tokens = message.completion_tokens;
            }
        }
    }


    return {
        canSendRequest,
        dialogs,
        responseNew,
        responseStream,
        responseEnd
    };
})
