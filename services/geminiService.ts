import { GoogleGenAI, Content, Part } from "@google/genai";
import { KNOWLEDGE_BASE } from "../constants";
import { Message, Role } from "../types";

// Initialize the client strictly as per instructions
// Note: process.env.API_KEY is assumed to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Transforms the chat history into the format expected by the Gemini SDK.
 */
const formatHistory = (messages: Message[]): Content[] => {
  return messages.map((msg) => ({
    role: msg.role === Role.USER ? 'user' : 'model',
    parts: [{ text: msg.text } as Part],
  }));
};

/**
 * Sends a message to the Gemini model and returns a stream of the response.
 */
export const streamGeminiResponse = async (
  currentMessage: string,
  history: Message[]
) => {
  try {
    const model = 'gemini-2.5-flash';
    
    // We create the contents array manually to include the system instruction context 
    // effectively by pre-pending it or using the systemInstruction config if we were using a Chat session.
    // For single turn generation that simulates chat, we can just pass the history.
    // However, keeping the "system instruction" persistent is key. 
    // The SDK supports `systemInstruction` in the config.

    const contents: Content[] = [
      ...formatHistory(history),
      {
        role: 'user',
        parts: [{ text: currentMessage }],
      },
    ];

    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      config: {
        systemInstruction: KNOWLEDGE_BASE,
        temperature: 0.3, // Keep it factual
        maxOutputTokens: 1000,
      },
    });

    return responseStream;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};