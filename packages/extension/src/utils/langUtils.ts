import * as vscode from 'vscode';
import * as fs from 'fs';

const langRelPath: { [key: string]: string } = {
    "en": "l10n/bundle.l10n.json",
    "zh-cn": "l10n/bundle.l10n.zh-cn.json",
    "ja": "l10n/bundle.l10n.ja.json"
};

interface LangDictType {
    [key: string]: any;
}


export class LangDict {
    static lang?: string;
    static path?: vscode.Uri;
    static dict?: LangDictType;

    static init(basePath: vscode.Uri){
        this.lang = (vscode.env.language in langRelPath) ? vscode.env.language : "en";
        this.path = vscode.Uri.joinPath(basePath, langRelPath[this.lang]);
        this.dict = JSON.parse(fs.readFileSync(this.path.fsPath, 'utf8'));
        // console.log(this.dict);
    }

    static get(key: string): any {
        return this.dict?.[key] || key;
    }

    static getDict(): LangDictType {
        return this.dict || {};
    }
}

export namespace l10n {
    export function init(basePath: vscode.Uri) {
        LangDict.init(basePath);
    }

    export function t(key: string): string {
        return LangDict.get(key).toString();
    }

    export function get(key: string): any {
        return LangDict.get(key);
    }
}
