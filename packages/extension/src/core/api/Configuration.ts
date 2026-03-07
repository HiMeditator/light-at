import * as vscode from 'vscode';
import { MessageSender } from './MessageSender';

interface Settings {
    welcomeInfo: boolean;
    sendShortcut: string;
    codeTheme?: string;
}

export class Configuration {
    private constructor() {}

    static readonly sectionID = 'lightAt';

    static get<T>(key: string): T | undefined {
        const configuration = vscode.workspace.getConfiguration(Configuration.sectionID);
        return configuration.get<T>(key);
    }

    static sendSettings( isUpdate = false) {
        const settings: Settings = {
            welcomeInfo: Configuration.get<boolean>('displayInfoMessage') as boolean,
            sendShortcut: Configuration.get<string>('sendRequestShortcut') || 'Ctrl+Enter'
        };
        if(!isUpdate) {
            settings.codeTheme = Configuration.get<string>('codeHighlightTheme') || 'github';
        }
        MessageSender.settingsUpdate(JSON.stringify(settings));
    }

    static changeHandler(event: vscode.ConfigurationChangeEvent) {
        if(
            event.affectsConfiguration('lightAt.displayInfoMessage') ||
            event.affectsConfiguration('lightAt.sendRequestShortcut')
        ) {
            Configuration.sendSettings(true);
        }
    }
}
