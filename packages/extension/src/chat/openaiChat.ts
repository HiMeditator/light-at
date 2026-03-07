import * as vscode from 'vscode';
import OpenAI from 'openai';
import { l10n } from '../utils/langUtils';
import { SessionManager } from './SessionManager';
import { Configuration } from '../core/api/Configuration';
import { MessageSender } from '../core/api/MessageSender';

export async function openaiChat(openrouter: boolean = false) { 
    let openai: OpenAI;
    let inThinking = false;
    let content = '';
    let thinking = '';
    let prompt_tokens = 0;
    let completion_tokens = 0;
    let messages = SessionManager.chatMessages;
    let baseURL = SessionManager.model?.baseURL || '';
    
    if(openrouter) {
        baseURL = 'https://openrouter.ai/api/v1';
    }
    openai = new OpenAI({
        apiKey: SessionManager.model?.apiKey || '',
        baseURL: baseURL
    });

    if(!Configuration.get<boolean>('continuousChat')) {
        messages = [];
        if(SessionManager.chatMessages[0].role === 'system'){
            messages.push(SessionManager.chatMessages[0]);
        }
        messages.push(SessionManager.chatMessages[SessionManager.chatMessages.length - 1]);
    }

    MessageSender.responseNew(
        SessionManager.messageID, openrouter ? 'openrouter' : 'openai', 
        SessionManager.name
    );
    
    try {
        const stream = await openai.chat.completions.create({
            model: SessionManager.model?.model || '',
            messages: messages,
            stream: true,
            stream_options: {"include_usage": Configuration.get<boolean>('displayTokensUsage')}
        });
        for await (const chunk of stream) {
            // console.log(chunk);
            if(chunk.usage?.prompt_tokens && chunk.usage?.completion_tokens){
                prompt_tokens = chunk.usage.prompt_tokens;
                completion_tokens = chunk.usage.completion_tokens;
            }
            if(!chunk.choices[0] || !chunk.choices[0].delta){
                continue;
            }
            const delta = chunk['choices'][0]['delta'];
            if('reasoning_content' in delta && delta['reasoning_content']){
                if(!inThinking){
                    inThinking = true;
                    content += '<think>';
                    MessageSender.responseStream('<think>', SessionManager.messageID);
                }
                content += delta['reasoning_content'];
                MessageSender.responseStream('' + delta['reasoning_content'], SessionManager.messageID);
            }
            if(delta['content']){
                if(inThinking){
                    inThinking = false;
                    content += '</think>';
                    MessageSender.responseStream('</think>', SessionManager.messageID);
                }
                content += delta['content'];
                MessageSender.responseStream(delta['content'], SessionManager.messageID);
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
        MessageSender.responseStream(` **${error}** `, SessionManager.messageID);
        MessageSender.responseEnd(SessionManager.messageID);
        SessionManager.pushModelMessage(`${error}`, thinking);
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
    if(content.startsWith('<think>') && content.indexOf('</think>') >= 0){
        const pos = content.indexOf('</think>');
        thinking = content.substring(0, pos + 8);
        content = content.substring(pos + 8);
    }
    SessionManager.pushModelMessage(content, thinking);
    SessionManager.stopSign = false;
    SessionManager.isStreaming = false;
}
