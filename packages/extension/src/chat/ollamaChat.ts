import * as vscode from 'vscode';
import { Ollama } from 'ollama';
import { l10n } from '../utils/langUtils';
import { SessionManager } from './SessionManager';
import { Configuration } from '../core/api/Configuration';
import { MessageSender } from '../core/api/MessageSender';

export async function ollamaChat() {
    let ollama: Ollama;
    let inThinking = false;
    let content = '';
    let thinking = '';
    let messages = SessionManager.chatMessages;

    if(SessionManager.model?.host){
        ollama = new Ollama({
            host: SessionManager.model.host
        });
    }
    else {
        ollama = new Ollama();
    }

    let customParams = {};
    if (SessionManager.model?.customParams) {
        try {
            customParams = JSON.parse(SessionManager.model.customParams);
            let isObject = typeof customParams === 'object' && customParams !== null && !Array.isArray(customParams);
            if(!isObject) {
                throw new Error('Custom params must be an object.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`${l10n.t('ts.invalidCustomParams')} ${error}`);
            MessageSender.responseNew(SessionManager.messageID, 'ollama', SessionManager.name);
            MessageSender.responseStream(`**${error}**`, SessionManager.messageID);
            MessageSender.responseEnd(SessionManager.messageID);
            SessionManager.pushModelMessage(`**${error}**`, thinking);
            SessionManager.stopSign = false;
            SessionManager.isStreaming = false;
            return;
        }
    }

    if(!Configuration.get<boolean>('continuousChat')) {
        messages = [];
        if(SessionManager.chatMessages[0].role === 'system'){
            messages.push(SessionManager.chatMessages[0]);
        }
        messages.push(SessionManager.chatMessages[SessionManager.chatMessages.length - 1]);
    }
    
    MessageSender.responseNew(SessionManager.messageID, 'ollama', SessionManager.name);
    
    try{
        const stream = await ollama.chat({
            ...customParams,
            model: SessionManager.model?.model || '',
            messages: messages,
            stream: true
        });
        for await (const chunk of stream) {
            // console.log(chunk);
            if(chunk.message.thinking) {
                if(!inThinking){
                    inThinking = true;
                    content += '<think>';
                    MessageSender.responseStream('<think>', SessionManager.messageID);
                }
                content += chunk.message.thinking;
                MessageSender.responseStream(chunk.message.thinking, SessionManager.messageID);
            }
            else if(chunk.message.content) {
                if(inThinking){
                    inThinking = false;
                    content += '</think>';
                    MessageSender.responseStream('</think>', SessionManager.messageID);
                }
                content += chunk.message.content;
                MessageSender.responseStream(chunk.message.content, SessionManager.messageID);
            }
            
            if(SessionManager.stopSign){
                MessageSender.responseEnd(SessionManager.messageID);
                if(content.startsWith('<think>') && content.indexOf('</think>') >= 0){
                    const pos = content.indexOf('</think>');
                    thinking = content.substring(0, pos + 8);
                    content = content.substring(pos + 8);
                }
                SessionManager.pushModelMessage(content, thinking);
                SessionManager.stopSign = false;
                SessionManager.isStreaming = false;
                return;
            }
        }
    } catch(error) {
        vscode.window.showErrorMessage(`${l10n.t('ts.requestFailed')} ${error}`);
        MessageSender.responseStream(`**${error}**`, SessionManager.messageID);
        MessageSender.responseEnd(SessionManager.messageID);
        SessionManager.pushModelMessage(`**${error}**`, thinking);
        SessionManager.stopSign = false;
        SessionManager.isStreaming = false;
        return;
    }

    MessageSender.responseEnd(SessionManager.messageID);
    if(content.startsWith('<think>') && content.indexOf('</think>') >= 0){
        const pos = content.indexOf('</think>');
        thinking = content.substring(0, pos + 8);
        content = content.substring(pos + 8);
    }
    SessionManager.pushModelMessage(content, thinking);
    SessionManager.stopSign = false;
    SessionManager.isStreaming = false;
}
