import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import * as authService from '../services/authService';
import type { User } from '../types';
import { COUNTRIES, INDUSTRIES } from '../constants';
import { SearchableSelect } from './SearchableSelect';
import { LanguageSwitcher } from './LanguageSwitcher';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const EduPXLogo = () => (
    <svg width="80" height="80" viewBox="0 0 100 100" className="mx-auto text-blue-600 dark:text-blue-500">
        <rect width="100" height="100" rx="20" fill="currentColor"/>
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="50" fontWeight="bold" fill="white">
            E
        </text>
        <text x="75%" y="75%" dominantBaseline="central" textAnchor="middle" fontSize="25" fontWeight="bold" fill="white">
            PX
        </text>
    </svg>
);


export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const countryOptions = COUNTRIES.map(c => ({ value: c.name, label: c.name }));
  const industryOptions = INDUSTRIES.map(i => ({ value: i, label: i }));

  const resetFields = () => {
    setUsername('');
    setPassword('');
    setCountry('');
    setIndustry('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
        setError(t('login.credentialsEmpty'));
        return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const user = await authService.login(username.trim(), password);
        onLogin(user);
      } else { // register
        if (!country) {
            setError(t('login.countryRequired'));
            setIsLoading(false);
            return;
        }
        if (!industry) {
            setError(t('login.industryRequired'));
            setIsLoading(false);
            return;
        }
        await authService.register(username.trim(), password, country, industry);
        setSuccessMessage(t('login.registrationSuccess'));
        setMode('login');
        resetFields();
      }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setError(null);
    setSuccessMessage(null);
    resetFields();
  };

  const commonInputClass = "w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";

  return (
    <div className="relative flex flex-col h-full bg-slate-50 dark:bg-slate-900">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
            <EduPXLogo />
            <h1 className="text-4xl font-bold mt-4 text-slate-800 dark:text-white">
              {mode === 'login' ? t('login.title') : t('login.createAccountTitle')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {t('login.slogan')}
            </p>

            <form onSubmit={handleSubmit} className="mt-10 w-full max-w-sm">
              <div className="mb-4">
                <label htmlFor="username" className="sr-only">{t('login.usernamePlaceholder')}</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('login.usernamePlaceholder')}
                  className={commonInputClass}
                  autoFocus
                  autoComplete="username"
                />
              </div>
               <div className="mb-4">
                <label htmlFor="password" className="sr-only">{t('login.passwordPlaceholder')}</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  className={commonInputClass}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>

              {mode === 'register' && (
                  <>
                      <div className="mb-4">
                        <SearchableSelect
                            options={countryOptions}
                            value={country}
                            onChange={setCountry}
                            placeholder={t('login.selectCountry')}
                            searchPlaceholder={t('login.searchCountry')}
                        />
                      </div>
                      <div className="mb-4">
                        <SearchableSelect
                            options={industryOptions}
                            value={industry}
                            onChange={setIndustry}
                            placeholder={t('login.selectIndustry')}
                            searchPlaceholder={t('login.searchIndustry')}
                        />
                      </div>
                  </>
              )}

              {error && <p className="text-red-500 text-sm my-4">{error}</p>}
              {successMessage && <p className="text-green-600 dark:text-green-500 text-sm my-4">{successMessage}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (mode === 'login' ? t('login.loginButton') : t('login.registerButton'))}
              </button>
            </form>
            <p className="mt-6 text-sm">
                <button onClick={toggleMode} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    {mode === 'login' ? t('login.toggleToRegister') : t('login.toggleToLogin')}
                </button>
            </p>
        </div>
        <footer className="text-center p-4 text-xs text-slate-500 dark:text-slate-400">
            {t('login.footer')}
        </footer>
    </div>
  );
};