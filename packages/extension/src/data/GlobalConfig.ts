import * as vscode from 'vscode';
import * as os from 'os';

export class GlobalConfig {
    /** 数据保存路径 */
    static readonly storageDir = vscode.Uri.joinPath(vscode.Uri.file(os.homedir()),'/.light-at');
    
    /** 配置文件路径 */
    static readonly configUri = vscode.Uri.joinPath(this.storageDir, 'config.json');
    
    /** 聊天记录保存路径 */
    static readonly sessionDir = vscode.Uri.joinPath(this.storageDir, 'chat');
    
    /** 聊天记录清单文件路径 */
    static readonly manifestUri = vscode.Uri.joinPath(this.sessionDir, 'manifest.json');
}
