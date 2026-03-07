import * as vscode from 'vscode';
import { Configuration } from '../../utils/Configuration';
import { RepoContext } from '../../chat/RepoContext';

export function registerListeners(context: vscode.ExtensionContext) {
    const configurationChange = vscode.workspace.onDidChangeConfiguration(event => {
        if(event.affectsConfiguration(Configuration.sectionID)){
            Configuration.changeHandler(event);
        }
    });
    context.subscriptions.push(configurationChange);

    const addTextEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
        if(editor === undefined) { return; }
        RepoContext.includeTextEditors[editor.document.uri.fsPath] = editor;
    });
    context.subscriptions.push(addTextEditor);
}
