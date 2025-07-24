import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export const AboutScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 text-slate-700 dark:text-slate-300 space-y-6">
      <section>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('about.section1.title')}</h3>
        <p className="leading-relaxed">{t('about.section1.content')}</p>
      </section>
      <section>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('about.section2.title')}</h3>
        <p className="leading-relaxed">{t('about.section2.content')}</p>
      </section>
      <section>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('about.section3.title')}</h3>
        <p className="leading-relaxed">{t('about.section3.content')}</p>
      </section>
      <footer className="pt-4 mt-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
        {t('login.footer')}
      </footer>
    </div>
  );
};
