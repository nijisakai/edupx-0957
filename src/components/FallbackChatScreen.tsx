import React, { useState } from 'react';
import type { AppInfo, User } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { BackIcon } from './Icons';
import { ChatScreen } from './ChatScreen';

interface FallbackChatScreenProps {
  app: AppInfo;
  user: User;
  onBack: () => void;
}

export const FallbackChatScreen: React.FC<FallbackChatScreenProps> = ({ app, user, onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800">
      <header className="flex items-center p-3 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
        <button
          onClick={onBack}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label={t('common.back')}
        >
          <BackIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center ml-3">
           <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-3">
              <app.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
           </div>
           <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t(app.nameKey)}</h2>
        </div>
        <div className="ml-auto">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            离线模式
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ChatScreen app={app} user={user} onBack={onBack} />
      </main>
    </div>
  );
};
