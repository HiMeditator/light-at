import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { MessageSender} from '../utils/MessageSender';
import { RequestHandler } from '../utils/RequestHandler';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'light-at.chat';
    constructor(
        private readonly _extensionUri: vscode.Uri
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        MessageSender.view = webviewView;

        webviewView.webview.onDidReceiveMessage(
            RequestHandler.handleRequest
        );
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const guiSidebarPath = vscode.Uri.joinPath(this._extensionUri, '/out/gui-chat');
        const indexPath = vscode.Uri.joinPath(guiSidebarPath, '/index.html');
        let indexHtml = fs.readFileSync(indexPath.fsPath, 'utf-8');
        const matchLinks = /(href|src)="([^"]*)"/g;
        const toUri = (_: string, prefix: 'href' | 'src', link: string) => {
            if (link === '#') {
                return `${prefix}="${link}"`;
            }
            const _path = path.join(guiSidebarPath.fsPath, link);
            const uri = vscode.Uri.file(_path);
            return `${prefix}="${webview.asWebviewUri(uri)}"`;
        };
        indexHtml = indexHtml.replace(matchLinks, toUri);
        // console.log(indexHtml);
        return indexHtml;
    }
}