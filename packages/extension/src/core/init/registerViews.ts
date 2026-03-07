import * as vscode from "vscode";
import { ChatViewProvider } from "../views/ChatViewProvider";

export function registerViews(context: vscode.ExtensionContext) {
    const chatViewProvider = new ChatViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ChatViewProvider.viewType,
            chatViewProvider,
            {webviewOptions: { retainContextWhenHidden: true }}
        )
    );
}
