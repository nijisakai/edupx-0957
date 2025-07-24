
import { useState, useEffect, useCallback } from 'react';
import type { Message, User, Bot } from '../types';
import { sendMessageStream } from '../services/geminiService';

export const useGeminiChat = (user: User, bot: Bot) => {
  const storageKey = `chatHistory_${user.id}_${bot.id}`;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem(storageKey);
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        const messagesWithoutFiles = parsedHistory.messages.map((msg: Message) => {
            const { imageFile, ...rest } = msg;
            return rest;
        });
        setMessages(messagesWithoutFiles);
      } catch (e) {
        console.error("Failed to parse chat history:", e);
        setMessages([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const saveHistory = useCallback((currentMessages: Message[]) => {
      try {
          const serializableMessages = currentMessages.map(msg => {
              const { imageFile, ...rest } = msg;
              return rest;
          });
          const history = {
              messages: serializableMessages,
          };
          localStorage.setItem(storageKey, JSON.stringify(history));
      } catch (e) {
          console.error("Failed to save chat history to localStorage", e);
      }
  }, [storageKey]);

  const handleSendMessage = useCallback(async (text: string, imageFile?: File) => {
    setError(null);
    setIsLoading(true);

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text,
      sender: 'user',
      timestamp: Date.now(),
      ...(imageFile && { imageFile }),
    };
    
    const assistantMessageId = `msg_${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      text: '',
      sender: 'assistant',
      timestamp: Date.now() + 1,
    };
    
    const historyForAPI = [...messages]; 
    setMessages(prev => [...prev, userMessage, assistantMessage]);
    
    let fullResponse = '';
    
    const handleChunk = (chunk: string) => {
      fullResponse += chunk;
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId ? { ...msg, text: fullResponse } : msg
      ));
    };

    const handleError = (err: string) => {
        setError(err);
        setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId ? { ...msg, text: `Error: ${err}. Please check API key and network.` } : msg
        ));
    };

    try {
        await sendMessageStream(
            historyForAPI,
            userMessage,
            bot,
            handleChunk,
            handleError
        );
    } catch (e) {
        const message = e instanceof Error ? e.message : 'An unexpected error occurred.';
        handleError(message);
    } finally {
        setIsLoading(false);
        setMessages(currentMsgs => {
            saveHistory(currentMsgs);
            return currentMsgs;
        });
    }
  }, [messages, bot, saveHistory]);

  return { messages, isLoading, error, handleSendMessage };
};
