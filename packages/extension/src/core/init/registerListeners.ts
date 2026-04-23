import * as vscode from 'vscode';
import { Configuration } from '../api/Configuration';
import { RepoContext } from '../../chat/RepoContext';
import { isImageFileByExtName } from '../../utils/fileUtils';

export function registerListeners(context: vscode.ExtensionContext) {
    const configurationChange = vscode.workspace.onDidChangeConfiguration(event => {
        if(event.affectsConfiguration(Configuration.sectionID)){
            Configuration.changeHandler(event);
        }
    });
    context.subscriptions.push(configurationChange);

    const addTextEditor = vscode.window.onDidChangeActiveTextEditor(editor => {
        if(editor === undefined) { return; }
        RepoContext.visitedTextEditors[editor.document.uri.fsPath] = editor;
    });
    context.subscriptions.push(addTextEditor);

    const addImageFile = vscode.window.tabGroups.onDidChangeTabs((event) => {
        const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
        if (activeTab) {
            const input = activeTab.input;
            if (input instanceof vscode.TabInputCustom) {
                const fsPath = input.uri.fsPath;
                if(isImageFileByExtName(fsPath)) {
                    // console.log(`Added image file: ${fsPath}`);
                    RepoContext.visitedImageFiles[input.uri.fsPath] = fsPath;
                }
            }
        }
    });
    context.subscriptions.push(addImageFile);
}
