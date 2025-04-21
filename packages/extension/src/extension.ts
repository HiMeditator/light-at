import * as vscode from 'vscode';
import * as os from 'os';

import { loadSession } from './chat/loadSession';
import { RepoContext } from './chat/RepoContext';
import { RequestModel } from './chat/RequestModel';
import { init_l10n } from './utils/LangDict';
import { Configuration } from './utils/Configuration';
import { RequestHandler } from './utils/RequestHandler';
import { ConfigModels } from './storage/ConfigModels';
import { SessionManifest } from './storage/SessionManifest';
import { ChatViewProvider } from './views/ChatViewProvider';

let repoContext: RepoContext;
let configModels: ConfigModels;
let requestModel: RequestModel;
let sessionManifest: SessionManifest;

export function activate(context: vscode.ExtensionContext) {
    init_l10n(context.extensionUri);
    const storageDir = vscode.Uri.joinPath(vscode.Uri.file(os.homedir()),'/.light-at');
    const configUri = vscode.Uri.joinPath(storageDir, 'config.json');
    const sesseionDir = vscode.Uri.joinPath(storageDir, 'chat');
    const manifestUri = vscode.Uri.joinPath(sesseionDir, 'manifest.json');

    repoContext = new RepoContext();
    configModels = new ConfigModels(configUri, context);
    requestModel = new RequestModel(configModels, repoContext);
    sessionManifest = new SessionManifest(sesseionDir, manifestUri, requestModel);

    RequestHandler.repoContext = repoContext;
    RequestHandler.configModels = configModels;
    RequestHandler.requestModel = requestModel;
    RequestHandler.sessionManifest = sessionManifest;

    const chatViewProvider = new ChatViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ChatViewProvider.viewType,
            chatViewProvider,
            {webviewOptions: { retainContextWhenHidden: true }}
        )
    );

    const configurationChange = vscode.workspace.onDidChangeConfiguration(event => {
        if(event.affectsConfiguration(Configuration.sectionID)){
            Configuration.changeHandler(event);
        }
    });
    context.subscriptions.push(configurationChange);

    const addTextEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
        if(editor === undefined) { return; }
        repoContext.includeTextEditors[editor.document.uri.fsPath] = editor;
    });
    context.subscriptions.push(addTextEditor);

    const gotoSettings = vscode.commands.registerCommand('light-at.goto.settings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:himeditator.light-at');
    });
    context.subscriptions.push(gotoSettings);

    const gotoConfig = vscode.commands.registerCommand('light-at.goto.config', () => {
        vscode.commands.executeCommand('vscode.open', configUri);
    });
    context.subscriptions.push(gotoConfig);

    const sessionsLoad = vscode.commands.registerCommand('light-at.load.sessions', () => {
        loadSession(sessionManifest);
    });
    context.subscriptions.push(sessionsLoad);

    const chatNew = vscode.commands.registerCommand('light-at.chat.new', () => {
        sessionManifest.newChatSession();
    });
    context.subscriptions.push(chatNew);
}

export function deactivate() {
    sessionManifest.saveChatSession();
    sessionManifest.syncManifestWithFiles();
    sessionManifest.saveManifest();
}
