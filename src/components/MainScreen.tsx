import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { User, AppInfo } from '../types';
import { APPS } from '../constants';
import { AssistantsScreen } from './AssistantsScreen';
import { DocsScreen } from './DocsScreen';
import { AboutScreen } from './AboutScreen';
import { AdminScreen } from './AdminScreen';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoutIcon, BriefcaseIcon, BookOpenIcon, InfoIcon, UserGroupIcon, MenuIcon } from './Icons';

interface MainScreenProps {
  user: User;
  onSelectApp: (app: AppInfo) => void;
  onLogout: () => void;
}

type Tab = 'assistants' | 'docs' | 'about' | 'admin';

export const MainScreen: React.FC<MainScreenProps> = ({ user, onSelectApp, onLogout }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<Tab>('assistants');
    const [isTocOpen, setIsTocOpen] = useState(false);

    const tabs: {id: Tab; labelKey: string; icon: React.FC<any>}[] = [
        { id: 'assistants', labelKey: 'main.tabs.assistants', icon: BriefcaseIcon },
        { id: 'docs', labelKey: 'main.tabs.docs', icon: BookOpenIcon },
        { id: 'about', labelKey: 'main.tabs.about', icon: InfoIcon },
    ];

    if (user.isAdmin) {
        tabs.push({ id: 'admin', labelKey: 'main.tabs.admin', icon: UserGroupIcon });
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'assistants': return <AssistantsScreen apps={APPS} onSelectApp={onSelectApp} />;
            case 'docs': return <DocsScreen isTocOpen={isTocOpen} setIsTocOpen={setIsTocOpen} />;
            case 'about': return <AboutScreen />;
            case 'admin': return <AdminScreen />;
            default: return <AssistantsScreen apps={APPS} onSelectApp={onSelectApp} />;
        }
    };

    const getHeaderTitle = () => {
         switch (activeTab) {
            case 'assistants': return t('portal.subGreeting');
            case 'docs': return t('docs.title');
            case 'about': return t('about.title');
            case 'admin': return t('admin.title');
            default: return 'EduPX';
        }
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            <header className="p-4 shrink-0 ios-safe-top">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('portal.greeting', { name: user.name })}</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{getHeaderTitle()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                         <LanguageSwitcher />
                         {activeTab === 'docs' && (
                            <button 
                                onClick={() => setIsTocOpen(true)} 
                                className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                aria-label={t('docs.tocTitle')}
                            >
                                <MenuIcon className="h-6 w-6" />
                            </button>
                         )}
                         <button
                            onClick={onLogout}
                            className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            aria-label={t('portal.logoutButton')}
                          >
                            <LogoutIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar ios-safe-left ios-safe-right">
                {renderContent()}
            </main>
            
            <footer className="shrink-0 ios-safe-bottom border-t border-slate-100 dark:border-slate-800">
                <nav className="flex justify-around h-16 bg-white dark:bg-slate-900">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <tab.icon className="h-6 w-6" />
                            <span className="text-xs mt-1">{t(tab.labelKey)}</span>
                        </button>
                    ))}
                </nav>
            </footer>
        </div>
    );
};
