import * as vscode from 'vscode';
import * as fs from 'fs';

const langRelPath: { [key: string]: string } = {
    "en": "l10n/bundle.l10n.json",
    "zh-cn": "l10n/bundle.l10n.zh-cn.json",
    "ja": "l10n/bundle.l10n.ja.json"
};

class LangDict{
    private static langDict: LangDict | undefined;
    lang: string;
    path: vscode.Uri;
    dict: any;

    private constructor(basePath: vscode.Uri){
        this.lang = (vscode.env.language in langRelPath)? vscode.env.language : "en";
        this.path = vscode.Uri.joinPath(basePath, langRelPath[this.lang]);
        this.dict = JSON.parse(fs.readFileSync(this.path.fsPath, 'utf8'));
        // console.log(this.dict);
    }

    public static instance(basePath: vscode.Uri): LangDict {
        if (!LangDict.langDict) {
            LangDict.langDict = new LangDict(basePath);
        }
        return LangDict.langDict;
    }

    public static get(key: string): string {
        if(!LangDict.langDict){
            vscode.window.showInformationMessage('LangDict not initialized.');
            return '';
        }
        return LangDict.langDict.dict[key] || key;
    }

    public static getDict(): any {
        if(!LangDict.langDict){
            vscode.window.showInformationMessage('LangDict not initialized.');
            return {};
        }
        return LangDict.langDict.dict;
    }

    public t(key: string){
        return this.dict[key] || key;
    }
}

export function init_l10n(basePath: vscode.Uri){
    l10n = LangDict.instance(basePath);
}

export let l10n: LangDict;