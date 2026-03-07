import * as vscode from 'vscode';
import { initModules } from './core/init/initModules';
import { registerViews } from './core/init/registerViews';
import { registerListeners } from './core/init/registerListeners';
import { registerCommands } from './core/init/registerCommands';
import { ChatHistoryManager } from './storage/ChatHistoryManager';


export function activate(context: vscode.ExtensionContext) {
    initModules(context);
    registerViews(context);
    registerListeners(context);
    registerCommands(context);
}

export function deactivate() {
    ChatHistoryManager.saveChatSession();
    ChatHistoryManager.syncManifestWithFiles();
    ChatHistoryManager.saveManifest();
}
