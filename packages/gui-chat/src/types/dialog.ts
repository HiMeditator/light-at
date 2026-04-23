export interface UserDialogItem {
    id: string;
    content: string;
    context: string[];
}

export interface ModelDialogItem {
    id: string;
    content: string;
    type: 'ollama' | 'openai' | 'openrouter' | undefined;
    name: string;
    prompt_tokens?: number;
    completion_tokens?: number;
}

export type DialogItem = UserDialogItem | ModelDialogItem;

export interface ContextMap {
    [key: string]: {
        name: string,
        selected: boolean
    }
}
