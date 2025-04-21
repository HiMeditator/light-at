import * as vscode from 'vscode';
// import { l10n } from 'vscode';
import { l10n } from '../utils/LangDict';
import { SessionManifest } from '../storage/SessionManifest';

export function loadSession(sessionManifest: SessionManifest) {
    const quickPick = vscode.window.createQuickPick();
    let sessionItems = [];
    for (let i = sessionManifest.manifest.length - 1; i >= 0; i--){
        const session = sessionManifest.manifest[i];
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
            sessionManifest.loadChatSession(selection[0].detail || '');
            quickPick.dispose();
        }
    });
    quickPick.onDidTriggerItemButton((event) => {
        if (event.button.tooltip === l10n.t('ts.deleteSession')) {
            sessionManifest.deleteChatSession(event.item.detail || '');
            sessionItems = [];
            for (let i = sessionManifest.manifest.length - 1; i >= 0; i--){
                const session = sessionManifest.manifest[i];
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