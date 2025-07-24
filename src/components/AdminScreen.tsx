import React, { useState, useEffect } from 'react';
import * as authService from '../services/authService';
import { useTranslation } from '../hooks/useTranslation';
import type { User } from '../types';

export const AdminScreen: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const userList = await authService.getAllUsers();
        setUsers(userList);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [t]);

  return (
    <div className="h-full p-4">
      {isLoading ? (
        <div className="text-center p-8 text-slate-500 dark:text-slate-400">{t('admin.loading')}</div>
      ) : (
        <div className="space-y-4">
          {users.length > 0 ? (
              users.map(user => (
                  <div key={user.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold mr-4">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-lg text-slate-800 dark:text-slate-200">{user.name}</span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1 pl-14">
                        <p><span className="font-medium text-slate-700 dark:text-slate-300">{t('admin.country')}:</span> {user.country}</p>
                        <p><span className="font-medium text-slate-700 dark:text-slate-300">{t('admin.industry')}:</span> {user.industry}</p>
                    </div>
                  </div>
              ))
          ) : (
              <div className="text-center p-8 text-slate-500 dark:text-slate-400">{t('admin.noUsers')}</div>
          )}
        </div>
      )}
    </div>
  );
};
