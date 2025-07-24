import React from 'react';
import type { AppInfo } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { BackIcon } from './Icons';

interface WebViewScreenProps {
  app: AppInfo;
  onBack: () => void;
}

export const WebViewScreen: React.FC<WebViewScreenProps> = ({ app, onBack }) => {
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
      </header>

      <main className="flex-1 overflow-hidden">
        <iframe
          src={app.url}
          title={t(app.nameKey)}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </main>
    </div>
  );
};
