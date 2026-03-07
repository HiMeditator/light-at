import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import type { Config, Model } from '../types';
import { l10n } from '../utils/langUtils';
import { nanoid } from '../utils/commonUtils';
import { MessageSender } from '../core/api/MessageSender';
import { GlobalConfig, GlobalContext } from '../core/data';

export class ConfigManager {
    static modelList: Model[] = [];

    static init() {
        const folderPath = path.dirname(GlobalConfig.configUri.fsPath);
        if(!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath, {recursive: true});
        }
        if(!fs.existsSync(GlobalConfig.configUri.fsPath)){
            fs.writeFileSync(GlobalConfig.configUri.fsPath, `{\n  "models": []\n}`);
            vscode.window.showInformationMessage(
                `${l10n.t('ts.createdConfig')} ${GlobalConfig.configUri.fsPath}`
            );
        }
    }

    /** 
     * 基于模型 ID （保存在 `context.globalState` 中），获取当前选择的模型。
     * 如果没有选择或找不到对应 ID 的模型，则返回 undefined。
     */
    static getModel(): Model | undefined {
        const modelID = GlobalContext.context.globalState.get<string>('modelID');
        const model = this.modelList.find((model: Model) => {
            return model.id === modelID;
        });
        if (!model) { return undefined; }
        const realModel: Model = { ...model };
        if (realModel.apiKey?.startsWith('env@')) {
            realModel.apiKey = process.env[realModel.apiKey.substring(4)]?.trim() || '';
            if(realModel.apiKey === ''){
                vscode.window.showErrorMessage(`${l10n.t('ts.envKeyNotFound')} ${model.apiKey}`);
            }
        }
        return realModel;
    }

    /** 获取插件配置对象 */
    static getConfigObject(): Config {
        try{
            const configContent = fs.readFileSync(GlobalConfig.configUri.fsPath, 'utf8');
            const config: Config = JSON.parse(configContent);
            return config;
        }
        catch (error) {
            vscode.window.showErrorMessage(`${l10n.t('ts.parsingConfigError')} ${error}`);
            return { models: [] };
        }
    }

    /** 基于插件配置文件更新模型列表 */
    static updateModelsFromConfig(){
        const modelList = this.getConfigObject().models;
        this.modelList = modelList;
        const models = modelList.map((model: Model) => {
            return {
                id: model.id,
                type: model.type,
                name: model.title?  model.title : model.model,
            };
        });
        const modelID = GlobalContext.context.globalState.get<string>('modelID');
        MessageSender.modelsUpdate(
            JSON.stringify(models),
            modelID ?? ''
        );
    }

    /** 添加模型到插件配置文件 */
    static addModelToConfig(modelData: string) {
        if(!nanoid) {
            vscode.window.showErrorMessage('nanoid is not loaded.');
            return;
        }
        try{
            let configObj: Config = this.getConfigObject();
            let modelDataObj = JSON.parse(modelData);
            modelDataObj['id'] = nanoid();
            configObj.models.push(modelDataObj);
            fs.writeFileSync(GlobalConfig.configUri.fsPath, JSON.stringify(configObj, null, 2));
        } catch (error) {
            vscode.window.showErrorMessage(`${l10n.t('ts.parsingConfigError')} ${error}`);
        }
        this.updateModelsFromConfig();
    }

    /** 删除对应 ID 的模型并更新配置文件 */
    static deleteModelFromConfig(modelID: string) {
        let configObj = this.getConfigObject();
        configObj['models'] = configObj['models'].filter( (model: any) => {
            return model.id !== modelID;
        });
        fs.writeFileSync(GlobalConfig.configUri.fsPath, JSON.stringify(configObj, null, 2));
        this.updateModelsFromConfig();
    }

     /** 更新当前选择的模型 ID */
    static updatemodelID(modelID: string){
        GlobalContext.context.globalState.update('modelID', modelID);
        MessageSender.modelIDUpdated(modelID);
    }
}
