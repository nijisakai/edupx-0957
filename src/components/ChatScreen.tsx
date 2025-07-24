
import React, { useEffect, useRef } from 'react';
import type { User, AppInfo } from '../types';
import { useDifyChat } from '../hooks/useDifyChat';
import { useTranslation } from '../hooks/useTranslation';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { BackIcon } from './Icons';

interface ChatScreenProps {
  user: User;
  app: AppInfo;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ user, app, onBack }) => {
  const { messages, isLoading, error, handleSendMessage } = useDifyChat(user, app);
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800">
      <header className="flex items-center p-3 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
        <button
          onClick={onBack}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
          aria-label={t('common.back')}
        >
          <BackIcon className="h-6 w-6" />
        </button>
        <img src={app.avatarUrl} alt={t(app.nameKey)} className="w-10 h-10 rounded-full mx-3" />
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t(app.nameKey)}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{isLoading ? 'Typing...' : 'Online'}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 dark:bg-slate-900">
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} botAvatarUrl={app.avatarUrl} userName={user.name} />
          ))}
          {isLoading && messages[messages.length -1]?.sender === 'assistant' && <TypingIndicator botAvatarUrl={app.avatarUrl} />}
        </div>
        <div ref={messagesEndRef} />
      </main>

      {error && (
        <div className="p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm text-center">
          {error}
        </div>
      )}
      
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};