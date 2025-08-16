import React from 'react';
import type { AppInfo } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface AssistantsScreenProps {
  apps: AppInfo[];
  onSelectApp: (app: AppInfo) => void;
}

export const AssistantsScreen: React.FC<AssistantsScreenProps> = ({ apps, onSelectApp }) => {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <div className="space-y-6 pb-8">
        {apps.map((app) => (
          <div
            key={app.id}
            onClick={() => onSelectApp(app)}
            className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-slate-900/50 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-0.5 active:scale-98 shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 p-4 rounded-xl shadow-sm">
                <app.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate mb-2">{t(app.nameKey)}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">{t(app.descriptionKey)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
