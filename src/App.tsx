import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { MainScreen } from './components/MainScreen';
import { WebViewScreen } from './components/WebViewScreen';
import type { User, AppInfo } from './types';

type View = 'login' | 'main' | 'webview';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('login');
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);

  // Add iOS safe area support
  useEffect(() => {
    // Detect if we're in iOS and add appropriate CSS variables
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOS) {
      // Add CSS variables for safe areas
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
      document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
      
      // Add iOS-specific class
      document.body.classList.add('ios-device');
    }
    
    // Add viewport meta tag for proper mobile rendering
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('main');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    // Also clear any per-user data if necessary, e.g. conversation IDs
    Object.keys(localStorage).forEach(key => {
        if(key.startsWith('conversationId_')) {
            localStorage.removeItem(key);
        }
    });
  };

  const handleSelectApp = (app: AppInfo) => {
    if (app.url) {
      setSelectedApp(app);
      setView('webview');
    }
  };

  const handleBackToMain = () => {
    setView('main');
    setSelectedApp(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'main':
        if (user) {
          return (
            <MainScreen
              user={user}
              onSelectApp={handleSelectApp}
              onLogout={handleLogout}
            />
          );
        }
        // Should not happen if logic is correct, but as a fallback:
        return <LoginScreen onLogin={handleLogin} />;
      case 'webview':
        if (selectedApp) {
          return <WebViewScreen app={selectedApp} onBack={handleBackToMain} />;
        }
        // Fallback to main if no app is selected
        setView('main');
        return null;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="w-full h-screen max-w-lg mx-auto bg-white dark:bg-slate-900 shadow-2xl flex flex-col antialiased ios-safe-container">
      {renderContent()}
    </div>
  );
};

export default App;
