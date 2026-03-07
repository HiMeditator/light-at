import * as vscode from 'vscode';
import { Ollama } from 'ollama';
import { l10n } from '../utils/langUtils';
import { SessionManager } from './SessionManager';
import { Configuration } from '../utils/Configuration';
import { MessageSender } from '../core/api/MessageSender';

export async function ollamaChat() {
    let ollama;
    if(SessionManager.model?.host){
        ollama = new Ollama({
            host: SessionManager.model.host
        });
    }
    else {
        ollama = new Ollama();
    }
    let responseContent = '';
    let reasoning = '';
    const continuousChat = Configuration.get<boolean>('continuousChat');
    let messages = SessionManager.chatMessages;
    if(!continuousChat) {
        messages = [];
        if(SessionManager.chatMessages[0].role === 'system'){
            messages.push(SessionManager.chatMessages[0]);
        }
        messages.push(SessionManager.chatMessages[SessionManager.chatMessages.length - 1]);
    }
    MessageSender.responseNew(SessionManager.messageID, 'ollama', SessionManager.name);
    try{
        const response = await ollama.chat({
            model: SessionManager.model?.model || '',
            messages: messages,
            stream: true
        });
        for await (const part of response) {
            responseContent += part.message.content;
            MessageSender.responseStream(part.message.content, SessionManager.messageID);
            if(SessionManager.stopSign){
                if(responseContent.startsWith('<think>') && responseContent.indexOf('</think>') >= 0){
                    const pos = responseContent.indexOf('</think>');
                    reasoning = responseContent.substring(0, pos + 8);
                    responseContent = responseContent.substring(pos + 8);
                }
                MessageSender.responseEnd(SessionManager.messageID);
                SessionManager.pushModelMessage(responseContent, reasoning);
                SessionManager.stopSign = false;
                SessionManager.isStreaming = false;
                return;
            }
        }
    } catch(error) {
        vscode.window.showErrorMessage(`${l10n.t('ts.requestFailed')} ${error}`);
        MessageSender.responseStream(`**${error}**`, SessionManager.messageID);
        MessageSender.responseEnd(SessionManager.messageID);
        SessionManager.pushModelMessage(`${error}`, reasoning);
        SessionManager.stopSign = false;
        SessionManager.isStreaming = false;
        return;
    }
    MessageSender.responseEnd(SessionManager.messageID);
    if(responseContent.startsWith('<think>') && responseContent.indexOf('</think>') >= 0){
        const pos = responseContent.indexOf('</think>');
        reasoning = responseContent.substring(0, pos + 8);
        responseContent = responseContent.substring(pos + 8);
    }
    SessionManager.pushModelMessage(responseContent, reasoning);
    SessionManager.stopSign = false;
    SessionManager.isStreaming = false;
}
