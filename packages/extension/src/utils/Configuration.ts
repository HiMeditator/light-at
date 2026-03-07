import * as vscode from 'vscode';
import { MessageSender } from '../core/api/MessageSender';

interface Settings {
    welcomeInfo: boolean;
    sendShortcut: string;
    codeTheme?: string;
}

export class Configuration {
    private constructor() {}

    public static readonly sectionID = 'lightAt';

    public static get<T>(key: string): T | undefined {
        const configuration = vscode.workspace.getConfiguration(Configuration.sectionID);
        return configuration.get<T>(key);
    }

    public static sendSettings( isUpdate = false) {
        const settings: Settings = {
            welcomeInfo: Configuration.get<boolean>('displayInfoMessage') as boolean,
            sendShortcut: Configuration.get<string>('sendRequestShortcut') || 'Ctrl+Enter'
        };
        if(!isUpdate) {
            settings.codeTheme = Configuration.get<string>('codeHighlightTheme') || 'github';
        }
        MessageSender.settingsUpdate(JSON.stringify(settings));
    }

    public static changeHandler(event: vscode.ConfigurationChangeEvent) {
        if(
            event.affectsConfiguration('lightAt.displayInfoMessage') ||
            event.affectsConfiguration('lightAt.sendRequestShortcut')
        ) {
            Configuration.sendSettings(true);
        }
    }
}
