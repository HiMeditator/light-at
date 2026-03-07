import * as vscode from 'vscode';
import * as fs from 'fs';
import type { MainifestItem } from '../types';
import { l10n } from '../utils/langUtils';
import { getTimeStr } from '../utils/commonUtils';
import { GlobalConfig } from '../data';
import { Configuration } from '../core/api/Configuration';
import { SessionManager } from '../chat/SessionManager';

export class ChatHistoryManager {
    static manifest: MainifestItem[] = [];
    static sessionName: string;
    
    static init(){
        if(!fs.existsSync(GlobalConfig.sessionDir.fsPath)){
            fs.mkdirSync(GlobalConfig.sessionDir.fsPath, {recursive: true});
        }
        if(!fs.existsSync(GlobalConfig.manifestUri.fsPath)){
            fs.writeFileSync(GlobalConfig.manifestUri.fsPath, `[]`);
        }
        try{
            this.manifest = JSON.parse(fs.readFileSync(GlobalConfig.manifestUri.fsPath, 'utf8'));
        }
        catch (error) {
            this.manifest = [];
        }
        this.sessionName = `${getTimeStr()}.json`;
        // console.log(this.manifest);
    }

    static newChatSession(saveSesion = true){
        if(SessionManager.isStreaming){
            vscode.window.showInformationMessage(l10n.t('ts.fetchingModelInfo'));
            return;
        }
        if(saveSesion){
            this.saveChatSession();
        }
        SessionManager.clearAndNewChatSession();
        this.sessionName = `${getTimeStr()}.json`;
    }

    static deleteChatSession(fileName: string){
        const filePath = vscode.Uri.joinPath(GlobalConfig.sessionDir, fileName);
        try{
            fs.unlinkSync(filePath.fsPath);
        }
        catch (error) {}
        for(let i = 0; i < this.manifest.length; i++){
            if(this.manifest[i].name === fileName){
                this.manifest.splice(i, 1);
                this.saveManifest();
                break;
            }
        }
        if(this.sessionName === fileName){
            this.newChatSession(false);
        }
    }

    static saveManifest(){
        fs.writeFileSync(
            GlobalConfig.manifestUri.fsPath,
            JSON.stringify(this.manifest, null, 2)
        );
    }
    
    static saveChatSession(){
        if(SessionManager.chatMessages.length > 0) {
            const lastMessage = SessionManager.chatMessages[SessionManager.chatMessages.length - 1];
            if(lastMessage.role === 'user'){
                SessionManager.chatMessages.pop();
                SessionManager.chatSession.pop();
            }
        }
        if(SessionManager.chatSession.length <= 1) {
            this.deleteChatSession(this.sessionName);
            return;
        }

        const filePath = vscode.Uri.joinPath(GlobalConfig.sessionDir, this.sessionName);
        fs.writeFileSync(
            filePath.fsPath,
            JSON.stringify(SessionManager.chatSession, null, 2)
        );

        let inManifest = false;
        for(let i = 0; i < this.manifest.length; i++){
            if(this.sessionName === this.manifest[i].name){
                this.manifest[i].workspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
                this.manifest[i].update = new Date().toLocaleString();
                let content = SessionManager.chatSession[0].content;
                if(SessionManager.chatSession[0].role === 'system'){
                    content = SessionManager.chatSession[1].content;
                }
                if(content.length > 64){
                    content = content.substring(0, 64) + '...';
                }
                this.manifest[i].overview = content;
                inManifest = true;
                break;
            }
        }
        if(!inManifest){
            let content = SessionManager.chatSession[0].content;
            if(SessionManager.chatSession[0].role === 'system'){
                content = SessionManager.chatSession[1].content;
            }
            if(content.length > 64){
                content = content.substring(0, 64) + '...';
            }
            this.manifest.push({
                name: this.sessionName,
                overview: content,
                workspace: vscode.workspace.workspaceFolders?.[0].uri.fsPath || '',
                update: new Date().toLocaleString()
            });
        }
        this.saveManifest();
        this.sessionName = `${getTimeStr()}.json`;
    }

    static loadLastChatSession(){
        if(this.manifest.length === 0) {
            return;
        }
        this.loadChatSession(this.manifest[this.manifest.length - 1].name, true);
    }

    static loadChatSession(fileName: string, newLoad = false){
        if(SessionManager.isStreaming){
            vscode.window.showInformationMessage(l10n.t('ts.fetchingModelInfo'));
            return;
        }
        if(!newLoad){
            this.saveChatSession();
        }
        for(let i = 0; i < this.manifest.length; i++){
            if(this.manifest[i].name === fileName){
                const mainifestItem = this.manifest[i];
                this.manifest.push(mainifestItem);
                this.manifest.splice(i, 1);
                break;
            }
        }
        this.sessionName = fileName;
        const filePath = vscode.Uri.joinPath(GlobalConfig.sessionDir, fileName);
        SessionManager.loadChatSession(filePath.fsPath);
    }

    static syncManifestWithFiles(){
        const sessionFiles: string[] = [];
        try {
            const entries = fs.readdirSync(GlobalConfig.sessionDir.fsPath);
            for(const entry of entries){
                if(entry.endsWith('.json') && entry !== 'manifest.json'){
                    sessionFiles.push(entry);
                }
            };
        } catch (err) {}

        for(let i = 0; i < this.manifest.length; i++){
            if(!sessionFiles.includes(this.manifest[i].name)){
                this.manifest.splice(i, 1);
                i--;
            }
        }

        for(const file of sessionFiles){
            if(!this.manifest.find(item => item.name === file)){
                const filePath = vscode.Uri.joinPath(GlobalConfig.sessionDir, file);
                let content = '';
                try {
                    content = JSON.parse(fs.readFileSync(filePath.fsPath, 'utf8'))[0]['content'];
                }
                catch (error) { continue; }
                if(content.length > 64){
                    content = content.substring(0, 64) + '...';
                }
                this.manifest.push({
                    name: file,
                    overview: content,
                    workspace: vscode.workspace.workspaceFolders?.[0].uri.fsPath || '',
                    update: new Date().toLocaleString()
                });
            }
        }
        const maxNum = Configuration.get<number>('maxChatHistory') || 128;
        if(maxNum < 0) { return; }
        while(this.manifest.length > maxNum){
            const delPath = vscode.Uri.joinPath(GlobalConfig.sessionDir, this.manifest[0].name);
            fs.unlinkSync(delPath.fsPath);
            this.manifest.shift();
        }
        // console.log(this.manifest);
    }
}
