export type ProviderType = 'ollama' | 'openai' | 'openrouter';

export interface ChatModel {
    id: string;
    type: ProviderType;
    model: string;
    title?: string;
    baseURL?: string;
    host?: string;
    apiKey?: string;
    system?: string;
    customParams?: string;
}

export interface Config {
    models: ChatModel[];
}
