import * as vscode from 'vscode';

export class GlobalContext {
    static context: vscode.ExtensionContext;

    static init(context: vscode.ExtensionContext) {
        GlobalContext.context = context;
    }
}
