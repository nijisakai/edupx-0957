import { DIFY_BASE_URL } from '../constants';
import type { DifyStreamResponse, User, Message, DifyHistoryResponse, DifyMessage } from '../types';

const USE_MOCK_API = false; // Set to false to use the real API

/**
 * Simulates a streaming API response for the mock implementation.
 * @param query The user's message.
 * @param onChunk Callback function to handle each received chunk.
 */
const mockStreamResponse = async (query: string, onChunk: (chunk: string) => void) => {
  const responses = [
    '你好！', ' 我是', '一个AI助手。', ` 我收到了你的消息：`, ` "${query}"。`, ' 我正在思考如何回复你...', ' 请稍等片刻。',
  ];
  for (const part of responses) {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    onChunk(part);
  }
};

/**
 * Fetches chat history for a conversation from the Dify API.
 * @param conversationId The ID of the conversation to fetch.
 * @param token The bot's API token.
 * @returns A promise that resolves to an array of Message objects.
 */
export const getHistory = async (conversationId: string, token: string): Promise<Message[]> => {
  const url = `${DIFY_BASE_URL}/messages?conversation_id=${conversationId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const historyResponse: DifyHistoryResponse = await response.json();
    
    // Dify returns messages in reverse chronological order. We need to reverse it back.
    const sortedDifyMessages = historyResponse.data.sort((a, b) => a.created_at - b.created_at);

    const messages: Message[] = [];
    sortedDifyMessages.forEach((difyMsg: DifyMessage) => {
      // Each Dify message object can contain both a query and an answer.
      // We split them into two separate messages for our app's data structure.
      if (difyMsg.query) {
        messages.push({
          id: `${difyMsg.id}-user`,
          text: difyMsg.query,
          sender: 'user',
          timestamp: difyMsg.created_at * 1000,
        });
      }
      if (difyMsg.answer) {
        messages.push({
          id: difyMsg.id,
          text: difyMsg.answer,
          sender: 'assistant',
          timestamp: (difyMsg.created_at * 1000) + 1, // ensure assistant message is after user
        });
      }
    });

    return messages;
  } catch (error) {
    console.error('Dify Get History Error:', error);
    return []; // Return empty array on error to not break the chat UI
  }
};


/**
 * Sends a message to the Dify chat API and handles the streaming response.
 */
export const sendMessageStream = async (
  query: string,
  conversationId: string | null,
  user: User,
  token: string,
  onChunk: (chunk: string) => void,
  onError: (error: string) => void
): Promise<string> => {
  if (USE_MOCK_API) {
    await mockStreamResponse(query, onChunk);
    return conversationId || `conv_${Date.now()}`;
  }

  const url = `${DIFY_BASE_URL}/chat-messages`;
  const body = {
    inputs: {},
    query,
    user: user.id,
    response_mode: 'streaming',
    ...(conversationId && { conversation_id: conversationId }),
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let finalConversationId = conversationId || '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const textChunk = decoder.decode(value, { stream: true });
      const lines = textChunk.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        try {
          const jsonString = line.substring(5).trim();
          if (jsonString) {
            const data: DifyStreamResponse = JSON.parse(jsonString);
            if (data.event === 'agent_message' && data.answer) {
              onChunk(data.answer);
            }
            if (data.conversation_id) {
              finalConversationId = data.conversation_id;
            }
          }
        } catch (e) {
          console.error("Failed to parse stream chunk:", line);
        }
      }
    }

    return finalConversationId;
  } catch (error) {
    console.error('Dify API Error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    onError(message);
    return conversationId || '';
  }
};

/**
 * NOTE: Dify file upload is a separate endpoint.
 * This is a placeholder demonstrating the flow.
 */
export const uploadFile = async (file: File, user: User, token: string): Promise<any> => {
  console.log("Simulating file upload for:", file.name);
  if (USE_MOCK_API) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ id: `file_${Date.now()}`, name: file.name, url: URL.createObjectURL(file) });
        }, 1000);
    });
  }
  
  alert("Real file upload not implemented in this demo.");
  return null;
};
