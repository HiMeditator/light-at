import { useAgentStore } from "@/stores/useAgentStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useDialogStore } from "@/stores/useDialogStore";

export function onMessage(event: any) {
    const message = event.data;
    // console.log('FRONTEND:', JSON.stringify(message));
    switch (message.command) {
        case 'language.set':
            useConfigStore().setLanguage(message.lang);
            break;
        case 'settings.update':
            useConfigStore().updateSettings(message.settings);
            break;
        case 'models.update':
            useAgentStore().models = JSON.parse(message.models);
            useAgentStore().modelID = message.modelID;
            break;
        case 'modelID.updated':
            useAgentStore().modelID = message.modelID;
            break;
        case 'request.load':
            useDialogStore().dialogs.push({
                id: 'u_' + message.requestID,
                content: message.content,
                context: JSON.parse(message.context)
            });
            break
        case 'response.new':
            useDialogStore().responseNew(message);
            break;
        case 'response.stream':
            useDialogStore().responseStream(message);
            break;
        case 'response.end':
            useDialogStore().responseEnd(message);
            break;
        case 'response.load':
            useDialogStore().dialogs.push({
                id: message.requestID, content: message.content,
                type: message.type, name: message.name
            });
            break;
        case 'chat.new':
            useDialogStore().dialogs = [];
            break;
        case 'dialog.deleted':
            useDialogStore().dialogs = useDialogStore().dialogs.filter(item => {
                return item.id !== message.requestID && item.id !== 'u_' + message.requestID;
            });
            break;
        case 'context.send':
            useAgentStore().contextSend(message.context);
            break;
    }
}
