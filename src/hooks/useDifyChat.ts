import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message, User, AppInfo } from '../types';
import { sendMessageStream, getHistory } from '../services/difyService';

export const useDifyChat = (user: User, app: AppInfo) => {
  const convIdStorageKey = `conversationId_${user.id}_${app.id}`;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(() => localStorage.getItem(convIdStorageKey));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationIdRef = useRef(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
    if (conversationId) {
        localStorage.setItem(convIdStorageKey, conversationId);
    } else {
        localStorage.removeItem(convIdStorageKey);
    }
  }, [conversationId, convIdStorageKey]);


  useEffect(() => {
    // Load chat history from API if a conversationId exists
    const loadHistory = async () => {
        if (conversationId) {
            setIsLoading(true);
            setError(null);
            const historyMessages = await getHistory(conversationId, app.token);
            setMessages(historyMessages);
            setIsLoading(false);
        } else {
            // No conversation yet, ensure messages are cleared
            setMessages([]);
        }
    };
    loadHistory();
  }, [conversationId, app.token]);

  const handleSendMessage = useCallback(async (text: string, imageFile?: File) => {
    setError(null);
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text,
      sender: 'user',
      timestamp: Date.now(),
      imageFile,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessageId = `msg_${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      text: '',
      sender: 'assistant',
      timestamp: Date.now() + 1,
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
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
            msg.id === assistantMessageId ? { ...msg, text: `Error: ${err}` } : msg
        ));
    };

    try {
        const newConvId = await sendMessageStream(
            text,
            conversationIdRef.current,
            user,
            app.token,
            handleChunk,
            handleError
        );

        if (newConvId && newConvId !== conversationIdRef.current) {
            setConversationId(newConvId);
        }

    } catch (e) {
        const message = e instanceof Error ? e.message : 'An unexpected error occurred.';
        handleError(message);
    } finally {
        setIsLoading(false);
    }
  }, [messages, user, app.token, app.id]);

  return { messages, isLoading, error, handleSendMessage };
};
