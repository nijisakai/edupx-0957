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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            onClick={() => onSelectApp(app)}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95 active:shadow-inner"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center space-x-4 mb-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                  <app.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="flex-1 text-md font-semibold text-slate-900 dark:text-white">{t(app.nameKey)}</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow">{t(app.descriptionKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
