import * as vscode from 'vscode';
import * as fs from 'fs';

interface TextEditorMap {
    [key: string]: vscode.TextEditor;
}

export class RepoContext {
    static selectedContent: string = '';
    static activeEditor: vscode.TextEditor | undefined;
    static includeTextEditors:TextEditorMap = {};
    static contextItems: string[] = [];

    static init() {
        const TextEditors = vscode.window.visibleTextEditors;
        for(const editor of TextEditors){
            this.includeTextEditors[editor.document.uri.fsPath] = editor;
        }
    }

    /** 获取上下文列表 */
    static getContextList(): string[] {
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
        return this.contextItems;
    }

    /** 根据上下文列表获取对应的提示词 */
    static getContextPrompt(contextList: string[]): string{
        let contextPrompt = '';
        for(const context of contextList){
            if(context === '[selected]'){
                contextPrompt += `\n\n[SELECTION_START]\n${this.selectedContent}\n[SELECTION_END]`;
            }
            else if(this.includeTextEditors[context]){
                const fileContent = this.includeTextEditors[context].document.getText();
                contextPrompt += `\n\n[FILE_START ${context}]\n${fileContent}\n[FILE_END]`;
            }
        }
        return contextPrompt;
    }
}
