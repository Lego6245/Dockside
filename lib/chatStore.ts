import { observable } from 'mobx';

export interface ChatLine {
    text: string;
    user?: string;
    channel: string;
    timestamp: string
}

class ChatStore {
    @observable chatMessages: ChatLine[] = [];

    public addChatLine(chatLine: ChatLine) {
        this.chatMessages.push(chatLine);
    }
}

export const chatMessageStore = new ChatStore();