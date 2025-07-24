
import { GoogleGenAI, Content, Part } from "@google/genai";
import type { Bot, Message } from '../types';

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const buildHistory = async (messages: Message[]): Promise<Content[]> => {
    const history: Content[] = [];
    for (const msg of messages) {
        const role = msg.sender === 'user' ? 'user' : 'model';
        const parts: Part[] = [{ text: msg.text }];
        if (msg.imageFile) {
            try {
                const imagePart = await fileToGenerativePart(msg.imageFile);
                parts.push(imagePart);
            } catch (e) {
                console.error("Error processing image file for history:", e);
                // Gracefully continue without the image if conversion fails
            }
        }
        history.push({ role, parts });
    }
    return history;
}

export const sendMessageStream = async (
  history: Message[],
  newMessage: Message,
  bot: Bot,
  onChunk: (chunk: string) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    const chatHistory = await buildHistory(history);
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: bot.systemInstruction,
      },
      history: chatHistory
    });

    const messageParts: Part[] = [{ text: newMessage.text }];
    if (newMessage.imageFile) {
        const imagePart = await fileToGenerativePart(newMessage.imageFile);
        messageParts.push(imagePart);
    }
    
    const result = await chat.sendMessageStream({ message: messageParts });

    for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
            onChunk(chunkText);
        }
    }

  } catch (error) {
    console.error('Gemini API Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    onError(message);
  }
};
