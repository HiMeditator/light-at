import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import type { ChatModel } from '../types';
import type { ChatMessage, SessionItem } from '../types';
import { l10n } from '../utils/langUtils';
import { nanoid } from '../utils/commonUtils';
import { RepoContext } from './RepoContext';
import { Configuration } from '../core/api/Configuration';
import { MessageSender } from '../core/api/MessageSender';
import { ConfigManager } from '../storage/ConfigManager';
import { ollamaChat } from './ollamaChat';
import { openaiChat } from './openaiChat';

const DEFAULT_SYSTEM_PROMPT = `
You are Light At, an intelligent chat assistant integrated within the IDE.

You are required to answer any questions posed by the user. The following information may assist you in providing better responses:

- Current IDE: ${vscode.env.appName}
- User's operating system type: ${os.type()}
- User's operating system version: ${os.release()}
- System architecture: ${os.arch()}
- User's IDE interface language code: ${vscode.env.language}

The language you use should prioritize the language the user communicates with you in, with the IDE's interface language as a fallback.

Note that after the user's request, they may attach selected text snippets or complete file content from within the IDE as contextual information, formatted as follows:

- For selected text snippets, it begins with [SELECTION_START] and ends with [SELECTION_END].
- For complete files, it begins with [FILE_START <file_path>] and ends with [FILE_END]. Here, <file_path> represents the absolute path of the file.
`.trim();


export class SessionManager {
    /** 模型是否正在输出回答内容 */
    static isStreaming: boolean = false;
    /** 聊天记录列表（用于传递给 LLM） */
    static chatMessages: ChatMessage[] = [];
    /** 会话记录数据（数据细节更多，用于存储） */
    static chatSession: SessionItem[] = [];
    /** 当前会话的模型 */
    static model: ChatModel | undefined;
    /** 当前模型的显示名称 */
    static name: string = '';
    /** 当前消息的 ID */
    static messageID: string = '';
    /** 要求中途停止标志 */
    static stopSign: boolean = false;

    static pushSystemMessage(content: string){
        this.chatMessages.push({
            role: 'system',
            content: content
        });
        this.chatSession.push({
            role: 'system',
            id: '',
            content: content,
            context: '',
            contextList: '[]',
            time: new Date().toLocaleString()
        });
    }

    static pushUserMessage(content: string, contextStr: string){
        const contextList: string[] = JSON.parse(contextStr);
        const contextPrompt = RepoContext.getContextPrompt(contextList);
        const imageList = RepoContext.getImageList(contextList);
        this.chatMessages.push({
            role: 'user',
            content: content + contextPrompt,
            ...(imageList.length > 0 && { images: imageList })
        });

        this.chatSession.push({
            role: 'user',
            id: this.messageID,
            content: content,
            context: contextPrompt,
            contextList: contextStr,
            ...(imageList.length > 0 && { images: imageList }),
            time: new Date().toLocaleString()
        });
    }

    static pushModelMessage(content: string, thinking: string){
        this.chatMessages.push({ 'role': 'assistant', 'content': content});
        this.chatSession.push({
            role: 'assistant',
            id: this.messageID,
            content: content,
            time: new Date().toLocaleString(),
            name: this.name,
            type: this.model?.type,
            thinking: thinking
        });
    }
    
    static clearAndNewChatSession() {
        this.chatMessages = [];
        this.chatSession = [];
        MessageSender.chatNew();
    }

    static loadChatSession(fileName: string){
        this.clearAndNewChatSession();
        try{
            const loadSession: SessionItem[] = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            for(const item of loadSession){
                this.chatMessages.push({
                    role: item.role,
                    content: item.content + (item.context ?? ''),
                    ...(item.images && { images: item.images }),
                });
                this.chatSession.push(item);
                if(item.role === 'user'){
                    MessageSender.requestLoad(
                        item.id,
                        item.content,
                        item.contextList ?? '[]'
                    );
                }
                else if(item.role === 'assistant'){
                    MessageSender.responseLoad(
                        item.id,
                        item.type as string,
                        item.name as string,
                        (item.thinking ?? (item.reasoning ?? '')) + item.content
                    );
                }
            }
        }
        catch(error) {
            vscode.window.showErrorMessage(`${l10n.t('ts.loadChatSessionError')} ${error}`);
        }
    }

    static stopStreaming(){
        if(!this.isStreaming) { return; }
        this.stopSign = true;
    }

    static async handleRequest(request: string, contextStr: string){
        if(!nanoid) {
            vscode.window.showErrorMessage('nanoid is not loaded');
            return;
        }
        if(this.isStreaming) {
            vscode.window.showInformationMessage(l10n.t('ts.fetchingModelInfo'));
            return;
        }
        this.stopSign = false;
        this.model = ConfigManager.getModel();
        if(!this.model){
            vscode.window.showInformationMessage(l10n.t('ts.modelNotSelected'));
            return;
        }
        this.name = this.model.title ? this.model.title : this.model.model;
        this.messageID = nanoid();
        MessageSender.requestLoad(this.messageID, request, contextStr);
        if(this.chatMessages.length === 0){
            if(this.model.system) {
                this.pushSystemMessage(this.model.system);
            }
            else if(Configuration.get<boolean>('useDefaultSystemPrompt')) {
                this.pushSystemMessage(DEFAULT_SYSTEM_PROMPT);
            }
        }
        this.pushUserMessage(request, contextStr);
        this.isStreaming = true;
        if(this.model.type === 'ollama'){
            ollamaChat();
        }
        else if(this.model.type === 'openai'){
            openaiChat();
        }
        else if(this.model.type === 'openrouter'){
            openaiChat(true);
        }
    }

    static deleteDialog(requestID: string) {
        if(requestID === this.messageID && this.isStreaming) {
            vscode.window.showInformationMessage(l10n.t('ts.fetchingModelInfo'));
            return;
        }
        for(let i= 0; i < this.chatSession.length; i++){
            if(this.chatSession[i].id === requestID){
                if(i+1 < this.chatSession.length && this.chatSession[i+1].id === requestID){
                    this.chatSession.splice(i, 2);
                    this.chatMessages.splice(i, 2);
                }
                else {
                    this.chatSession.splice(i, 1);
                    this.chatMessages.splice(i, 1);
                }
                break;
            }
        }
        MessageSender.dialogDeleted(requestID);
    }
}
