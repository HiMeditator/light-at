export interface ChatModel {
    id: string;
    type: 'openai' | 'ollama' | 'openrouter';
    model: string;
    title?: string;
    baseURL?: string;
    host?: string;
    apiKey?: string;
    system?: string;
}

export interface Config {
    models: ChatModel[];
}
