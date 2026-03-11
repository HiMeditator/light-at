import { ProviderType } from "./config";
export type Role = 'system' | 'user' | 'assistant'

export interface ChatMessage {
    role: Role;
    content: string;
}

export interface SessionItem {
    role: Role;
    id: string;
    content: string;
    context?: string;
    contextList?: string;
    time: string;
    name?: string;
    type?: ProviderType;
    thinking?: string;
    reasoning?: string; // deprecated
}

export interface MainifestItem {
    name: string;
    overview: string;
    workspace: string;
    update: string;
}
