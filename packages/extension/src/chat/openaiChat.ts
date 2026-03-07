import * as vscode from 'vscode';
import OpenAI from 'openai';
import { l10n } from '../utils/langUtils';
import { SessionManager } from './SessionManager';
import { Configuration } from '../utils/Configuration';
import { MessageSender } from '../core/api/MessageSender';

export async function openaiChat(openrouter: boolean = false) { 
    let responseContent = '';
    let reasoning = '';
    let isReasoning = false;
    let prompt_tokens = 0;
    let completion_tokens = 0;
    const continuousChat = Configuration.get<boolean>('continuousChat');
    let messages = SessionManager.chatMessages;
    if(!continuousChat) {
        messages = [];
        if(SessionManager.chatMessages[0].role === 'system'){
            messages.push(SessionManager.chatMessages[0]);
        }
        messages.push(SessionManager.chatMessages[SessionManager.chatMessages.length - 1]);
    }
    MessageSender.responseNew(SessionManager.messageID, openrouter ? 'openrouter' : 'openai', SessionManager.name);
    try {
        let baseURL = '';
        if(openrouter) {
            baseURL = 'https://openrouter.ai/api/v1';
        }
        else {
            baseURL = SessionManager.model?.baseURL || '';
        }
        const openai = new OpenAI({
            apiKey: SessionManager.model?.apiKey || '',
            baseURL: baseURL
        });
        const completion = await openai.chat.completions.create({
            model: SessionManager.model?.model || '',
            messages: messages,
            stream: true,
            stream_options: {"include_usage": true}
        });
        for await (const chunk of completion) {
            if(chunk.usage?.prompt_tokens && chunk.usage?.completion_tokens){
                prompt_tokens = chunk.usage.prompt_tokens;
                completion_tokens = chunk.usage.completion_tokens;
            }
            if(!chunk.choices[0] || !chunk.choices[0].delta){
                continue;
            }
            let content = '';
            const delta = chunk['choices'][0]['delta'];
            if('reasoning_content' in delta && delta['reasoning_content']){
                if(!isReasoning){
                    content = '<think>\n';
                    isReasoning = true;
                }
                content += delta['reasoning_content'];
                reasoning += content;
            }
            if(delta['content']){
                if(isReasoning){
                    content += '\n</think>\n\n';
                    reasoning += '\n</think>\n\n';
                    isReasoning = false;
                }
                content += delta['content'];
                responseContent += delta['content'];
            }
            MessageSender.responseStream(content, SessionManager.messageID);
            if(SessionManager.stopSign){
                MessageSender.responseEnd(SessionManager.messageID);
                SessionManager.pushModelMessage(responseContent, reasoning);
                SessionManager.stopSign = false;
                SessionManager.isStreaming = false;
                return;
            }
        }
    } catch(error) {
        vscode.window.showErrorMessage(`${l10n.t('ts.requestFailed')} ${error}`);
        MessageSender.responseStream(` **${error}** `, SessionManager.messageID);
        MessageSender.responseEnd(SessionManager.messageID);
        SessionManager.pushModelMessage(`${error}`, reasoning);
        SessionManager.stopSign = false;
        SessionManager.isStreaming = false;
        return;
    }
    if( Configuration.get<boolean>('displayTokensUsage')){
        MessageSender.responseEnd(SessionManager.messageID, prompt_tokens, completion_tokens);
    }
    else{
        MessageSender.responseEnd(SessionManager.messageID);
    }
    SessionManager.pushModelMessage(responseContent, reasoning);
    SessionManager.stopSign = false;
    SessionManager.isStreaming = false;
}
