import React, { useState } from 'react';
import type { AppInfo } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { BackIcon } from './Icons';

interface WebViewScreenProps {
  app: AppInfo;
  onBack: () => void;
}

export const WebViewScreen: React.FC<WebViewScreenProps> = ({ app, onBack }) => {
  const { t } = useTranslation();
  const { isOnline, isSlowConnection } = useNetworkStatus();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const retryLoad = () => {
    setHasError(false);
    setIsLoading(true);
    // Force iframe reload
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

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
        {!isOnline && (
          <div className="ml-auto">
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              离线
            </span>
          </div>
        )}
        {isSlowConnection && isOnline && (
          <div className="ml-auto">
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              网络较慢
            </span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-slate-600 dark:text-slate-400">{t('common.loading')}</p>
            </div>
          </div>
        )}

        {hasError ? (
          <div className="flex items-center justify-center h-full bg-white dark:bg-slate-800">
            <div className="text-center p-6 max-w-sm">
              <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full mx-auto w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.084 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {t('error.loadFailed')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                {!isOnline ? t('error.offline') : t('error.networkIssue')}
              </p>
              <div className="space-y-2">
                <button
                  onClick={retryLoad}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!isOnline}
                >
                  {t('common.retry')}
                </button>
                <button
                  onClick={onBack}
                  className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  {t('common.back')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={app.url}
            title={t(app.nameKey)}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </main>
    </div>
  );
};
