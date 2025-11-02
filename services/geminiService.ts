import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are LoreBot, a friendly and helpful assistant for Lore, a platform for preserving family and community history. Your goal is to answer questions about the Lore product based on its features: visual family trees for any community, an AI assistant, combined timeline/tree/storage, a social feed, and secure archiving. Be encouraging and keep your answers concise and clear. Do not go off-topic.',
        },
    });
};

export const continueChat = async (chat: Chat, message: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error in chat:", error);
        return "I'm having a little trouble connecting right now. Please try again in a moment.";
    }
};

// FIX: Add analyzeImage function to be used by ImageAnalyzer component.
export const analyzeImage = async (base64Image: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: "Analyze this photo from a family or community archive. Describe what you see, including people, setting, and potential time period. Suggest what stories or questions this photo might inspire someone to ask their relatives. Be descriptive and evocative."
        };
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "I'm sorry, I had trouble analyzing that image. It might be an unsupported format or there was a network issue. Please try another one.";
    }
};
