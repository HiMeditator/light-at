import * as vscode from 'vscode';
import * as fs from 'fs';
import { Ollama } from 'ollama';
import OpenAI from 'openai';
// import { l10n } from 'vscode';
import { l10n } from '../utils/LangDict';
import { nanoid } from '../utils/common';
import { Model } from '../types/ConfigTypes';
import { ChatMessage, SessionItem } from '../types/ChatTypes';
import { RepoContext } from './RepoContext';
import { Configuration } from '../utils/Configuration';
import { MessageSender } from '../utils/MessageSender';
import { ConfigModels } from '../storage/ConfigModels';

export class RequestModel {
    chatMessages: ChatMessage[] = [];
    chatSession: SessionItem[] = [];
    model: Model | undefined;
    name: string = '';
    messageID: string = '';
    isRequesting: boolean = false;
    stopSign: boolean = false;
    constructor(
        public configModels: ConfigModels,
        public repoContext: RepoContext
    ) { }

    public pushSystemMessage(content: string){
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

    public pushUserMessage(content: string, contextStr: string){
        const contextPrompt = this.repoContext.getContextPrompt(contextStr);
        this.chatMessages.push({
            role: 'user',
            content: content + contextPrompt
        });
        this.chatSession.push({
            role: 'user',
            id: this.messageID,
            content: content,
            context: contextPrompt,
            contextList: contextStr,
            time: new Date().toLocaleString()
        });
    }

    public pushModelMessage(content: string, reasoning: string){
        this.chatMessages.push({ 'role': 'assistant', 'content': content});
        this.chatSession.push({
            role: 'assistant',
            id: this.messageID,
            content: content,
            time: new Date().toLocaleString(),
            name: this.name,
            type: this.model?.type,
            reasoning: reasoning
        });
    }

    public loadChatSession(fileName: string){
        this.clearChatSession();
        try{
            const loadSession: SessionItem[] = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            for(const item of loadSession){
                this.chatMessages.push({
                    role: item.role,
                    content: item.content + (item.context ?? '')
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
                        (item.reasoning ?? '') + item.content
                    );
                }
            }     
        }
        catch(error) {
            vscode.window.showErrorMessage(`${l10n.t('ts.loadChatSessionError')} ${error}`);
        }
    }

    public handleStop(){
        if(!this.isRequesting) { return; }
        this.stopSign = true;
    }

    public async handleRequest(request: string, contextStr: string){
        if(!nanoid) {
            vscode.window.showErrorMessage('nanoid is not loaded');
            return;
        }
        if(this.isRequesting) { 
            vscode.window.showInformationMessage(l10n.t('ts.fetchingModelInfo'));
            return;
        }
        this.stopSign = false;
        this.model = this.configModels.getModel();
        if(!this.model){
            vscode.window.showInformationMessage(l10n.t('ts.modelNotSelected'));
            return;
        }
        this.name = this.model.title ? this.model.title : this.model.model;
        this.messageID = nanoid();
        MessageSender.requestLoad(this.messageID, request, contextStr);
        if(this.chatMessages.length === 0 && this.model.system){
            this.pushSystemMessage(this.model.system);
        }
        this.pushUserMessage(request, contextStr);
        this.isRequesting = true;
        if(this.model.type === 'ollama'){
            this.requestOllama();
        }
        else if(this.model.type === 'openai'){
            this.requestOpenAI();
        }
    }
    
    public async requestOllama(){
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
        // const messages = continuousChat ? this.chatMessages : [this.chatMessages[this.chatMessages.length - 1]];
        let messages = this.chatMessages;
        if(!continuousChat) {
            messages = [];
            if(this.chatMessages[0].role === 'system'){
                messages.push(this.chatMessages[0]);
            }
            messages.push(this.chatMessages[this.chatMessages.length - 1]);
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
                    this.isRequesting = false;
                    return;
                }
            }
        } catch(error) {
            vscode.window.showErrorMessage(`${l10n.t('ts.requestFailed')} ${error}`);
            // console.log(error);
            MessageSender.responseStream(` **${error}** `, this.messageID);
            MessageSender.responseEnd(this.messageID);
            this.pushModelMessage(`${error}`, reasoning);
            this.stopSign = false;
            this.isRequesting = false;
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
        this.isRequesting = false;
    }

    public async requestOpenAI() {
        let responseContent = '';
        let reasoning = '';
        let isReasoning = false;
        let prompt_tokens = 0;
        let completion_tokens = 0;
        const continuousChat = Configuration.get<boolean>('continuousChat');
        // const messages = continuousChat ? this.chatMessages : [this.chatMessages[this.chatMessages.length - 1]];
        let messages = this.chatMessages;
        if(!continuousChat) {
            messages = [];
            if(this.chatMessages[0].role === 'system'){
                messages.push(this.chatMessages[0]);
            }
            messages.push(this.chatMessages[this.chatMessages.length - 1]);
        }
        MessageSender.responseNew(this.messageID, 'openai', this.name);
        try {
            const openai = new OpenAI({
                apiKey: this.model?.apiKey || '',
                baseURL: this.model?.baseURL || ''
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
                // console.log(chunk['choices'][0]['delta'], content);
                if(this.stopSign){
                    MessageSender.responseEnd(this.messageID);
                    this.pushModelMessage(responseContent, reasoning);
                    this.stopSign = false;
                    this.isRequesting = false;
                    return;
                }
            }
        } catch(error) {
            vscode.window.showErrorMessage(`${l10n.t('ts.requestFailed')} ${error}`);
            MessageSender.responseStream(` **${error}** `, this.messageID);
            MessageSender.responseEnd(this.messageID);
            this.pushModelMessage(`${error}`, reasoning);
            this.stopSign = false;
            this.isRequesting = false;
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
        this.isRequesting = false;
    }
        
    public deleteDialog(requestID: string) {
        if(requestID === this.messageID && this.isRequesting) {
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

    public clearChatSession(){
        this.chatMessages = [];
        this.chatSession = [];
        MessageSender.chatNew();
    }
}
