import * as vscode from 'vscode';
import * as fs from 'fs';
import { ConfigManager } from '../storage/ConfigManager';

interface TextEditorMap {
    [key: string]: vscode.TextEditor;
}

interface ImageFileMap {
    [key: string]: string;
}

export class RepoContext {
    static selectedContent: string = '';
    static activeEditor: vscode.TextEditor | undefined;
    static visitedTextEditors: TextEditorMap = {};
    static visitedImageFiles: ImageFileMap = {};
    static contextItems: string[] = [];

    static init() {
        const TextEditors = vscode.window.visibleTextEditors;
        for(const editor of TextEditors){
            this.visitedTextEditors[editor.document.uri.fsPath] = editor;
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
        for (const [key, _] of Object.entries(this.visitedTextEditors)) {
            const fileExists = fs.existsSync(key);
            if (fileExists) {
                this.contextItems.push(key);
            } else {
                delete this.visitedTextEditors[key];
            }
        }
        if(ConfigManager.getModel()?.type === 'ollama') {
            for (const [key, _] of Object.entries(this.visitedImageFiles)) {
                const fileExists = fs.existsSync(key);
                if (fileExists) {
                    this.contextItems.push(key);
                } else {
                    delete this.visitedTextEditors[key];
                }
            }
        }
        // console.log(this.contextItems);
        return this.contextItems;
    }

    /** 根据上下文列表获取对应的提示词 */
    static getContextPrompt(contextList: string[]): string {
        let contextPrompt = '';
        for(const context of contextList){
            if(context === '[selected]'){
                contextPrompt += `\n\n[SELECTION_START]\n${this.selectedContent}\n[SELECTION_END]`;
            }
            else if(this.visitedTextEditors[context]){
                const fileExists = fs.existsSync(this.visitedTextEditors[context].document.uri.fsPath);
                if(!fileExists){
                    delete this.visitedTextEditors[context];
                    continue;
                }
                const fileContent = this.visitedTextEditors[context].document.getText();
                contextPrompt += `\n\n[FILE_START ${context}]\n${fileContent}\n[FILE_END]`;
            }
        }
        return contextPrompt;
    }

    static getImageList(contextList: string[]): string[] {
        const imageList: string[] = [];
        for(const context of contextList) {
            if(!this.visitedImageFiles[context]) { continue; }
            const imageExists = fs.existsSync(context);
            if(imageExists) {
                imageList.push(context);
            }
            else {
                delete this.visitedImageFiles[context];
            }
        }
        return imageList;
    }
}
