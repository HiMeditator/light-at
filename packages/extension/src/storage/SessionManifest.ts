import * as vscode from 'vscode';
import * as fs from 'fs';
// import { l10n } from 'vscode';
import { l10n } from '../utils/LangDict';
import { Configuration } from '../utils/Configuration';
import { getTimeStr } from '../utils/common';
import { MainifestItem } from '../types/ChatTypes';
import { RequestModel } from '../chat/RequestModel';

export class SessionManifest {
    manifest: MainifestItem[] = [];
    sessionName: string;
    constructor(
        public sessionDir: vscode.Uri,
        public manifestUri: vscode.Uri,
        public requestModel: RequestModel
    ){
        if(!fs.existsSync(this.sessionDir.fsPath)){
            fs.mkdirSync(this.sessionDir.fsPath, {recursive: true});
        }
        if(!fs.existsSync(this.manifestUri.fsPath)){
            fs.writeFileSync(this.manifestUri.fsPath, `[]`);
        }
        try{
            this.manifest = JSON.parse(fs.readFileSync(manifestUri.fsPath, 'utf8'));
        }
        catch (error) {
            this.manifest = [];
        }
        this.sessionName = `${getTimeStr()}.json`;
        // console.log(this.manifest);
    }

    public newChatSession(saveSesion = true){
        if(this.requestModel.isRequesting){
            vscode.window.showInformationMessage(l10n.t('ts.fetchingModelInfo'));
            return;
        }
        if(saveSesion){
            this.saveChatSession();
        }
        this.sessionName = `${getTimeStr()}.json`;
        this.requestModel.clearChatSession();
    }

    public deleteChatSession(fileName: string){
        const filePath = vscode.Uri.joinPath(this.sessionDir, fileName);
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

    public saveManifest(){
        fs.writeFileSync(
            this.manifestUri.fsPath,
            JSON.stringify(this.manifest, null, 2)
        );
    }
    
    public saveChatSession(){
        if(this.requestModel.chatMessages.length > 0) {
            const lastMessage = this.requestModel.chatMessages[this.requestModel.chatMessages.length - 1];
            if(lastMessage.role === 'user'){
                this.requestModel.chatMessages.pop();
                this.requestModel.chatSession.pop();
            }
        }
        if(this.requestModel.chatSession.length <= 1) {
            this.deleteChatSession(this.sessionName);
            return;
        }

        const filePath = vscode.Uri.joinPath(this.sessionDir, this.sessionName);
        fs.writeFileSync(
            filePath.fsPath,
            JSON.stringify(this.requestModel.chatSession, null, 2)
        );

        let inManifest = false;
        for(let i = 0; i < this.manifest.length; i++){
            if(this.sessionName === this.manifest[i].name){
                this.manifest[i].workspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
                this.manifest[i].update = new Date().toLocaleString();
                let content = this.requestModel.chatSession[0].content;
                if(this.requestModel.chatSession[0].role === 'system'){
                    content = this.requestModel.chatSession[1].content;
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
            let content = this.requestModel.chatSession[0].content;
            if(this.requestModel.chatSession[0].role === 'system'){
                content = this.requestModel.chatSession[1].content;
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

    public loadLastChatSession(){
        if(this.manifest.length === 0) {
            return;
        }
        this.loadChatSession(this.manifest[this.manifest.length - 1].name, true);
    }

    public loadChatSession(fileName: string, newLoad = false){
        if(this.requestModel.isRequesting){
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
        const filePath = vscode.Uri.joinPath(this.sessionDir, fileName);
        this.requestModel.loadChatSession(filePath.fsPath);
    }

    public syncManifestWithFiles(){
        const sessionFiles: string[] = [];
        try {
            const entries = fs.readdirSync(this.sessionDir.fsPath);
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
                const filePath = vscode.Uri.joinPath(this.sessionDir, file);
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
            const delPath = vscode.Uri.joinPath(this.sessionDir, this.manifest[0].name);
            fs.unlinkSync(delPath.fsPath);
            this.manifest.shift();
        }
        // console.log(this.manifest);
    }
}