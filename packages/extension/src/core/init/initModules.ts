import * as vscode from 'vscode';
import { RepoContext } from '../../chat/RepoContext';
import { ConfigManager } from '../../storage/ConfigManager';
import { ChatHistoryManager } from '../../storage/ChatHistoryManager';
import { LangDict } from "../../utils/langUtils";
import { GlobalContext } from '../../data';

export function initModules(context: vscode.ExtensionContext) {
    GlobalContext.init(context);
    RepoContext.init();
    ConfigManager.init();
    ChatHistoryManager.init();
    LangDict.init(context.extensionUri);
}
