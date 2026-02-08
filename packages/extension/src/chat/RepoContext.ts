import * as vscode from 'vscode';
import * as fs from 'fs';
import path from 'path';

interface TextEditorMap {
    [key: string]: vscode.TextEditor;
}

export class RepoContext {
    selectedContent: string = '';
    activeEditor: vscode.TextEditor | undefined;
    includeTextEditors:TextEditorMap = {};
    contextItems: string[] = [];

    constructor() {
        const TextEditors = vscode.window.visibleTextEditors;
        for(const editor of TextEditors){
            this.includeTextEditors[editor.document.uri.fsPath] = editor;
        }
    }

    public getContextListAsString(): string {
        this.contextItems = [];
        this.activeEditor = vscode.window.activeTextEditor;
        if (this.activeEditor && this.activeEditor.selection) {
            const selection = this.activeEditor.selection;
            this.selectedContent = this.activeEditor.document.getText(selection);
        } else {
            this.selectedContent = '';
        }
        if(this.selectedContent){
            this.contextItems.push('[selected]');
        }
        for (const [key, editor] of Object.entries(this.includeTextEditors)) {
            const fileExists = fs.existsSync(editor.document.uri.fsPath);
            if (fileExists) {
                this.contextItems.push(key);
            } else {
                delete this.includeTextEditors[key];
            }
        }
        // console.log(this.contextItems);
        return JSON.stringify(this.contextItems);
    }

    public getContextPrompt(contextStr: string): string{
        const contextList: string[] = JSON.parse(contextStr);
        let contextPrompt = '';
        for(const context of contextList){
            if(context === '[selected]'){
                contextPrompt += `\n\n[SELECTION_START]\n${this.selectedContent}\n[SELECTION_END]`;
            }
            else if(this.includeTextEditors[context]){
                const fileName = path.basename(context);
                const extName = path.extname(context);
                const fileContent = this.includeTextEditors[context].document.getText();
                contextPrompt += `\n\n[FILE_START ${fileName}.${extName}]\n${fileContent}\n[FILE_END]`;
            }
        }
        return contextPrompt;
    }
}
