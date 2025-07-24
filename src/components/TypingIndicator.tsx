
import React from 'react';

interface TypingIndicatorProps {
  botAvatarUrl: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ botAvatarUrl }) => {
  return (
    <div className="flex items-end gap-2 justify-start">
        <img src={botAvatarUrl} alt="bot avatar" className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="px-4 py-3 rounded-2xl rounded-bl-lg bg-slate-200 dark:bg-slate-700">
            <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
        </div>
    </div>
  );
};
