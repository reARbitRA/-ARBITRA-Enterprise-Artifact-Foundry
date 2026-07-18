import { GoogleGenAI, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat | null = null;

export function startChat(): Chat {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
    });
    return chat;
}

export function getChat(): Chat {
    if (!chat) {
        return startChat();
    }
    return chat;
}

export async function sendMessage(message: string) {
    const chat = getChat();
    const result = await chat.sendMessageStream({ message });
    return result;
}
