import * as vscode from 'vscode';
import { l10n } from '../utils/langUtils';
import { ChatHistoryManager } from '../storage/ChatHistoryManager';

export function loadSession() {
    const quickPick = vscode.window.createQuickPick();
    let sessionItems = [];
    for (let i = ChatHistoryManager.manifest.length - 1; i >= 0; i--){
        const session = ChatHistoryManager.manifest[i];
        sessionItems.push({
            label: session.overview,
            description: `$(clock) ${session.update}  $(folder) ${session.workspace}`,
            detail: session.name,
            buttons: [{iconPath: new vscode.ThemeIcon('trash'), tooltip: l10n.t('ts.deleteSession')}]
        });
    }
    quickPick.items = sessionItems;
    quickPick.onDidChangeSelection(selection => {
        if(selection[0]){
            ChatHistoryManager.loadChatSession(selection[0].detail || '');
            quickPick.dispose();
        }
    });
    quickPick.onDidTriggerItemButton((event) => {
        if (event.button.tooltip === l10n.t('ts.deleteSession')) {
            ChatHistoryManager.deleteChatSession(event.item.detail || '');
            sessionItems = [];
            for (let i = ChatHistoryManager.manifest.length - 1; i >= 0; i--){
                const session = ChatHistoryManager.manifest[i];
                sessionItems.push({
                    label: session.overview,
                    description: `$(clock) ${session.update}  $(folder) ${session.workspace}`,
                    detail: session.name,
                    buttons: [{iconPath: new vscode.ThemeIcon('trash'), tooltip: l10n.t('ts.deleteSession')}]
                });
            }
            quickPick.items = sessionItems;
        }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
}
