import * as vscode from 'vscode';

export class MessageSender{
    public static view: vscode.WebviewView | undefined;

    public static languageSet(){
        MessageSender.view?.webview.postMessage({
            command: 'language.set',
            lang: vscode.env.language
        });
    }

    public static settingsUpdate(settings: string){
        MessageSender.view?.webview.postMessage({
            command: 'settings.update',
            settings: settings
        });
    }

    public static modelsUpdate(models: string, modelID: string){
        MessageSender.view?.webview.postMessage({
            command: 'models.update',
            models: models,
            modelID: modelID
        });
    }

    public static modelIDUpdated(modelID: string){
        MessageSender.view?.webview.postMessage({
            command: 'modelID.updated',
            modelID: modelID
        });
    }

    public static requestLoad(requestID: string, content: string, context: string){
        MessageSender.view?.webview.postMessage({
            command: 'request.load',
            requestID: requestID,
            content: content,
            context: context
        });
    }

    public static responseNew(requestID: string, type: string, name: string){
        MessageSender.view?.webview.postMessage({
            command: 'response.new',
            requestID: requestID,
            type: type,
            name: name
        });
    }

    public static responseStream(content: string, requestID: string){
        MessageSender.view?.webview.postMessage({
            command: 'response.stream',
            data: content,
            requestID: requestID
        });
    }

    public static responseEnd(requestID: string, prompt_tokens?: number, completion_tokens?: number){
        if(prompt_tokens && completion_tokens){
            MessageSender.view?.webview.postMessage({
                command: 'response.end',
                requestID: requestID,
                prompt_tokens: prompt_tokens,
                completion_tokens: completion_tokens
            });
        }
        else{
            MessageSender.view?.webview.postMessage({
                command: 'response.end',
                requestID: requestID
            });
        }
    }

    public static responseLoad(requestID: string, type: string, name: string, content: string){
        MessageSender.view?.webview.postMessage({
            command: 'response.load',
            requestID: requestID,
            type: type,
            name: name,
            content: content
        });
    }

    public static chatNew(){
        MessageSender.view?.webview.postMessage({
            command: 'chat.new'
        });
    }

    public static dialogDeleted(requestID: string){
        MessageSender.view?.webview.postMessage({
            command: 'dialog.deleted',
            requestID: requestID
        });
    }

    public static contextSend(context: string){
        MessageSender.view?.webview.postMessage({
            command: 'context.send',
            context: context
        });
    }
}
