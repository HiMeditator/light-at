import * as vscode from 'vscode';
import { GlobalConfig } from '../data';
import { loadSession } from '../../chat/loadSession';
import { ChatHistoryManager } from '../../storage/ChatHistoryManager';

export function registerCommands(context: vscode.ExtensionContext) {
    const gotoSettings = vscode.commands.registerCommand('light-at.goto.settings', () => {
        vscode.commands.executeCommand(
            'workbench.action.openSettings', 
            '@ext:himeditator.light-at'
        );
    });
    context.subscriptions.push(gotoSettings);

    const gotoConfig = vscode.commands.registerCommand('light-at.goto.config', () => {
        vscode.commands.executeCommand(
            'vscode.open',
            GlobalConfig.configUri
        );
    });
    context.subscriptions.push(gotoConfig);

    const sessionsLoad = vscode.commands.registerCommand('light-at.load.sessions', () => {
        loadSession();
    });
    context.subscriptions.push(sessionsLoad);

    const chatNew = vscode.commands.registerCommand('light-at.chat.new', () => {
        ChatHistoryManager.newChatSession();
    });
    context.subscriptions.push(chatNew);
}
