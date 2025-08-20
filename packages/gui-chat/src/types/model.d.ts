export interface Model {
    id: string;
    type: 'openai' | 'ollama';
    name: string;
}

export interface ModelConfig {
    type: 'openai' | 'ollama';
    model: string;
    title?: string;
    baseURL?: string;
    host?: string;
    apiKey?: string;
    system?: string;
}
