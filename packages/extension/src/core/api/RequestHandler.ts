import * as vscode from 'vscode';
import { l10n } from '../../utils/langUtils';
import { MessageSender } from './MessageSender';
import { Configuration } from '../../utils/Configuration';
import { ConfigManager } from '../../storage/ConfigManager';
import { RepoContext } from '../../chat/RepoContext';
import { SessionManager } from '../../chat/SessionManager';
import { ChatHistoryManager } from '../../storage/ChatHistoryManager';

export class RequestHandler {

    public static handleRequest(message: any) {
        // console.log('Plugin receive:', JSON.stringify(message));
        switch (message.command) {
            case 'init.ready':
                RequestHandler.prepareInit();
                break;
            case 'modelID.update':
                RequestHandler.updateModelID(message.modelID);
                break;
            case 'config.update':
                RequestHandler.updateConfig();
                break;
            case 'model.add':
                RequestHandler.addModel(message.model);
                break;
            case 'model.delete':
                RequestHandler.deleteModel(message.modelID);
                break;
            case 'request.send':
                RequestHandler.handelRequest(message.request, message.context);
                break;
            case 'dialog.delete':
                RequestHandler.deleteDialog(message.requestID);
                break;
            case 'response.stop':
                RequestHandler.responseStop();
                break;
            case 'context.get':
                RequestHandler.contextGet();
                break;
            case 'context.goto':
                RequestHandler.contextGoto(message.path);
                break;
        }
    }

    private static prepareInit(){
        MessageSender.languageSet();
        if(Configuration.get<boolean>('loadLastChatSession')){
            ChatHistoryManager.loadLastChatSession();
        }
        Configuration.sendSettings();
        ConfigManager.updateModelsFromConfig();
    }

    private static updateModelID(modelID: string){
        ConfigManager.updatemodelID(modelID);
    }

    private static updateConfig(){
        ConfigManager.updateModelsFromConfig();
        vscode.commands.executeCommand('light-at.goto.config');
    }

    private static addModel(model: string){
       ConfigManager.addModelToConfig(model);
    }

    private static deleteModel(modelID: string){
        ConfigManager.deleteModelFromConfig(modelID);
    }

    private static handelRequest(request: string, context: string){
        SessionManager.handleRequest(request, context);
    }

    private static deleteDialog(requestID: string){
        SessionManager.deleteDialog(requestID);
    }

    private static responseStop(){
        SessionManager.stopStreaming();
    }

    private static contextGet(){
        const contextList = RepoContext.getContextList();
        MessageSender.contextSend(JSON.stringify(contextList));
    }

    private static async contextGoto(contextPath: string){
        if(contextPath === '[selected]') { return; }
        try{
            const context = vscode.Uri.file(contextPath);
            const document = await vscode.workspace.openTextDocument(context);
            await vscode.window.showTextDocument(document);
        }
        catch(error){
            vscode.window.showErrorMessage(`${l10n.t('ts.contextGotoError')} ${contextPath}`);
        }
    }
}
