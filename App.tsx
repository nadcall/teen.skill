import React, { useState, useEffect } from 'react';
import { User } from './types';
import { getCurrentUser, logout } from './services/db';
import { LandingPage } from './app/page';
import { Onboarding } from './components/Onboarding';
import { ClientDashboard } from './app/dashboard/ClientDashboard';
import { FreelancerDashboard } from './app/dashboard/FreelancerDashboard';
import { Button } from './components/Button';
import { LogOut, Sun, Moon } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { BackgroundWrapper } from './components/BackgroundWrapper';

// Inner component to access ThemeContext
const MainApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      setUser(u);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowOnboarding(false);
  };

  const handleStart = () => {
    if (user) return; // Already logged in
    setShowOnboarding(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="min-h-screen flex flex-col font-sans">
        <nav className="bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-800 sticky top-0 z-30 backdrop-blur-lg transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span 
                onClick={() => { setUser(null); setShowOnboarding(false); }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 cursor-pointer tracking-tight"
              >
                TeenSkill
              </span>
              {user && (
                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] rounded-full uppercase font-bold tracking-widest border border-gray-200 dark:border-gray-700">
                  {user.role}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5" />}
              </button>

              {user && (
                <>
                  <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</span>
                  </div>
                  <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                     {user.name.charAt(0)}
                  </div>
                  <Button variant="ghost" onClick={handleLogout} className="text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {!user && !showOnboarding && <LandingPage onStart={handleStart} />}
          {!user && showOnboarding && <Onboarding onComplete={(newUser) => setUser(newUser)} />}
          {user?.role === 'client' && <ClientDashboard user={user} />}
          {user?.role === 'freelancer' && <FreelancerDashboard user={user} />}
          {user && user.role === 'parent' && (
             <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl">
              Dasbor orang tua belum diimplementasikan dalam demo ini.
            </div>
          )}
        </main>
      </div>
    </BackgroundWrapper>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
};

export default App;