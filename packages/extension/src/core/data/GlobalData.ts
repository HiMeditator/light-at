import * as vscode from 'vscode';
import * as fs from 'fs';
import { l10n } from '../../utils/langUtils';
import { ChatMessage, SessionItem } from '../../types';
import { MessageSender } from '../api/MessageSender';

export class GlobalData {
    /** 模型是否正在输出回答内容 */
    static isStreaming: boolean = false;
    
    /** 聊天记录列表（用于传递给 LLM） */
    static chatMessages: ChatMessage[] = [];
    
    /** 会话记录数据（数据细节更多，用于存储） */
    static chatSession: SessionItem[] = [];

    static clearAndNewChatSession() {
        GlobalData.chatMessages = [];
        GlobalData.chatSession = [];
        MessageSender.chatNew();
    }

    static loadChatSession(fileName: string){
        this.clearAndNewChatSession();
        try{
            const loadSession: SessionItem[] = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            for(const item of loadSession){
                GlobalData.chatMessages.push({
                    role: item.role,
                    content: item.content + (item.context ?? '')
                });
                GlobalData.chatSession.push(item);
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
                        (item.reasoning ?? '') + item.content
                    );
                }
            }
        }
        catch(error) {
            vscode.window.showErrorMessage(`${l10n.t('ts.loadChatSessionError')} ${error}`);
        }
    }
}
