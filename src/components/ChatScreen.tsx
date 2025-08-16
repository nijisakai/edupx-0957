
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <header className="flex items-center p-4 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 ios-safe-top border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-colors"
          aria-label={t('common.back')}
        >
          <BackIcon className="h-6 w-6" />
        </button>
        <img src={app.avatarUrl} alt={t(app.nameKey)} className="w-12 h-12 rounded-2xl mx-4 border-2 border-white dark:border-slate-700 shadow-sm" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t(app.nameKey)}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{isLoading ? 'Typing...' : 'Online'}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar ios-safe-left ios-safe-right">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} botAvatarUrl={app.avatarUrl} userName={user.name} />
          ))}
          {isLoading && messages[messages.length -1]?.sender === 'assistant' && <TypingIndicator botAvatarUrl={app.avatarUrl} />}
        </div>
        <div ref={messagesEndRef} />
      </main>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm text-center border-t border-red-100 dark:border-red-800">
          {error}
        </div>
      )}
      
      <div className="ios-safe-bottom border-t border-slate-100 dark:border-slate-800">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};