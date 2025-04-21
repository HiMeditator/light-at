import * as vscode from 'vscode';
// import { l10n } from 'vscode';
import { l10n } from '../utils/LangDict';
import { MessageSender } from '../utils/MessageSender';
import { Configuration } from '../utils/Configuration';
import { ConfigModels } from '../storage/ConfigModels';
import { RepoContext } from '../chat/RepoContext';
import { RequestModel } from '../chat/RequestModel';
import { SessionManifest } from '../storage/SessionManifest';

export class RequestHandler {
    public static view: vscode.WebviewView | undefined;
    public static configModels: ConfigModels | undefined;
    public static repoContext: RepoContext | undefined;
    public static requestModel: RequestModel | undefined;
    public static sessionManifest: SessionManifest | undefined;

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
            RequestHandler.sessionManifest?.loadLastChatSession();
        }
        Configuration.sendSettings();
        RequestHandler.configModels?.updateModelsFromConfig();
    }

    private static updateModelID(modelID: string){
        RequestHandler.configModels?.updatemodelID(modelID);
    }

    private static updateConfig(){
        RequestHandler.configModels?.updateModelsFromConfig();
        vscode.commands.executeCommand('light-at.goto.config');
    }

    private static addModel(model: string){
       RequestHandler.configModels?.addModelToConfig(model);
    }

    private static deleteModel(modelID: string){
        RequestHandler.configModels?.deleteModelFromConfig(modelID);
    }

    private static handelRequest(request: string, context: string){
        RequestHandler.requestModel?.handleRequest(request, context);
    }

    private static deleteDialog(requestID: string){
        RequestHandler.requestModel?.deleteDialog(requestID);
    }

    private static responseStop(){
        RequestHandler.requestModel?.handleStop();
    }

    private static contextGet(){
        const context = RequestHandler.repoContext?.getContextListAsString();
        MessageSender.contextSend(context ?? '');
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