import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import { Ollama } from 'ollama';
import OpenAI from 'openai';
import { l10n } from '../utils/langUtils';
import { nanoid } from '../utils/commonUtils';
import { Model } from '../types/ConfigTypes';
import { GlobalData } from '../core/data';
import { SessionItem } from '../types';
import { RepoContext } from './RepoContext';
import { Configuration } from '../utils/Configuration';
import { MessageSender } from '../core/api/MessageSender';
import { ConfigManager } from '../storage/ConfigManager';


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


export class RequestModel {
    static model: Model | undefined;
    static name: string = '';
    static messageID: string = '';
    static stopSign: boolean = false;

    static pushSystemMessage(content: string){
        GlobalData.chatMessages.push({
            role: 'system',
            content: content
        });
        GlobalData.chatSession.push({
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
        GlobalData.chatMessages.push({
            role: 'user',
            content: content + contextPrompt
        });
        GlobalData.chatSession.push({
            role: 'user',
            id: this.messageID,
            content: content,
            context: contextPrompt,
            contextList: contextStr,
            time: new Date().toLocaleString()
        });
    }

    static pushModelMessage(content: string, reasoning: string){
        GlobalData.chatMessages.push({ 'role': 'assistant', 'content': content});
        GlobalData.chatSession.push({
            role: 'assistant',
            id: this.messageID,
            content: content,
            time: new Date().toLocaleString(),
            name: this.name,
            type: this.model?.type,
            reasoning: reasoning
        });
    }

    static loadChatSession(fileName: string){
        GlobalData.loadChatSession(fileName);
    }

    static handleStop(){
        if(!GlobalData.isStreaming) { return; }
        this.stopSign = true;
    }

    static async handleRequest(request: string, contextStr: string){
        if(!nanoid) {
            vscode.window.showErrorMessage('nanoid is not loaded');
            return;
        }
        if(GlobalData.isStreaming) {
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
        if(GlobalData.chatMessages.length === 0){
            if(this.model.system) {
                this.pushSystemMessage(this.model.system);
            }
            else if(Configuration.get<boolean>('useDefaultSystemPrompt')) {
                this.pushSystemMessage(DEFAULT_SYSTEM_PROMPT);
            }
        }
        this.pushUserMessage(request, contextStr);
        GlobalData.isStreaming = true;
        if(this.model.type === 'ollama'){
            this.requestOllama();
        }
        else if(this.model.type === 'openai'){
            this.requestOpenAI();
        }
        else if(this.model.type === 'openrouter'){
            this.requestOpenAI(true);
        }
    }

    static async requestOllama(){
        let ollama;
        if(this.model?.host){
            ollama = new Ollama({
                host: this.model.host
            });
        }
        else {
            ollama = new Ollama();
        }
        let responseContent = '';
        let reasoning = '';
        const continuousChat = Configuration.get<boolean>('continuousChat');
        let messages = GlobalData.chatMessages;
        if(!continuousChat) {
            messages = [];
            if(GlobalData.chatMessages[0].role === 'system'){
                messages.push(GlobalData.chatMessages[0]);
            }
            messages.push(GlobalData.chatMessages[GlobalData.chatMessages.length - 1]);
        }
        MessageSender.responseNew(this.messageID, 'ollama', this.name);
        try{
            const response = await ollama.chat({
                model: this.model?.model || '',
                messages: messages,
                stream: true
            });
            for await (const part of response) {
                responseContent += part.message.content;
                MessageSender.responseStream(part.message.content, this.messageID);
                if(this.stopSign){
                    if(responseContent.startsWith('<think>') && responseContent.indexOf('</think>') >= 0){
                        const pos = responseContent.indexOf('</think>');
                        reasoning = responseContent.substring(0, pos + 8);
                        responseContent = responseContent.substring(pos + 8);
                    }
                    MessageSender.responseEnd(this.messageID);
                    this.pushModelMessage(responseContent, reasoning);
                    this.stopSign = false;
                    GlobalData.isStreaming = false;
                    return;
                }
            }
        } catch(error) {
            vscode.window.showErrorMessage(`${l10n.t('ts.requestFailed')} ${error}`);
            MessageSender.responseStream(` **${error}** `, this.messageID);
            MessageSender.responseEnd(this.messageID);
            this.pushModelMessage(`${error}`, reasoning);
            this.stopSign = false;
            GlobalData.isStreaming = false;
            return;
        }
        MessageSender.responseEnd(this.messageID);
        if(responseContent.startsWith('<think>') && responseContent.indexOf('</think>') >= 0){
            const pos = responseContent.indexOf('</think>');
            reasoning = responseContent.substring(0, pos + 8);
            responseContent = responseContent.substring(pos + 8);
        }
        this.pushModelMessage(responseContent, reasoning);
        this.stopSign = false;
        GlobalData.isStreaming = false;
    }

    static async requestOpenAI(openrouter: boolean = false) {
        let responseContent = '';
        let reasoning = '';
        let isReasoning = false;
        let prompt_tokens = 0;
        let completion_tokens = 0;
        const continuousChat = Configuration.get<boolean>('continuousChat');
        let messages = GlobalData.chatMessages;
        if(!continuousChat) {
            messages = [];
            if(GlobalData.chatMessages[0].role === 'system'){
                messages.push(GlobalData.chatMessages[0]);
            }
            messages.push(GlobalData.chatMessages[GlobalData.chatMessages.length - 1]);
        }
        MessageSender.responseNew(this.messageID, openrouter ? 'openrouter' : 'openai', this.name);
        try {
            let baseURL = '';
            if(openrouter) {
                baseURL = 'https://openrouter.ai/api/v1';
            }
            else {
                baseURL = this.model?.baseURL || '';
            }
            const openai = new OpenAI({
                apiKey: this.model?.apiKey || '',
                baseURL: baseURL
            });
            const completion = await openai.chat.completions.create({
                model: this.model?.model || '',
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
                MessageSender.responseStream(content, this.messageID);
                if(this.stopSign){
                    MessageSender.responseEnd(this.messageID);
                    this.pushModelMessage(responseContent, reasoning);
                    this.stopSign = false;
                    GlobalData.isStreaming = false;
                    return;
                }
            }
        } catch(error) {
            vscode.window.showErrorMessage(`${l10n.t('ts.requestFailed')} ${error}`);
            MessageSender.responseStream(` **${error}** `, this.messageID);
            MessageSender.responseEnd(this.messageID);
            this.pushModelMessage(`${error}`, reasoning);
            this.stopSign = false;
            GlobalData.isStreaming = false;
            return;
        }
        if( Configuration.get<boolean>('displayTokensUsage')){
            MessageSender.responseEnd(this.messageID, prompt_tokens, completion_tokens);
        }
        else{
            MessageSender.responseEnd(this.messageID);
        }
        this.pushModelMessage(responseContent, reasoning);
        this.stopSign = false;
        GlobalData.isStreaming = false;
    }

    static deleteDialog(requestID: string) {
        if(requestID === this.messageID && GlobalData.isStreaming) {
            vscode.window.showInformationMessage(l10n.t('ts.fetchingModelInfo'));
            return;
        }
        for(let i= 0; i < GlobalData.chatSession.length; i++){
            if(GlobalData.chatSession[i].id === requestID){
                if(i+1 < GlobalData.chatSession.length && GlobalData.chatSession[i+1].id === requestID){
                    GlobalData.chatSession.splice(i, 2);
                    GlobalData.chatMessages.splice(i, 2);
                }
                else {
                    GlobalData.chatSession.splice(i, 1);
                    GlobalData.chatMessages.splice(i, 1);
                }
                break;
            }
        }
        MessageSender.dialogDeleted(requestID);
    }

    static clearAndNewChatSession(){
        GlobalData.clearAndNewChatSession();
    }
}
