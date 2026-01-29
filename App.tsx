import React, { useState, useEffect } from 'react';
import { User } from './types';
import { getCurrentUser, logout } from './services/db';
import { LandingPage } from './app/page';
import { Onboarding } from './components/Onboarding';
import { Login } from './components/Login';
import { ClientDashboard } from './app/dashboard/ClientDashboard';
import { FreelancerDashboard } from './app/dashboard/FreelancerDashboard';
import { Button } from './components/Button';
import { LogOut, Sun, Moon, Rocket } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { BackgroundWrapper } from './components/BackgroundWrapper';

// Main Layout Component
const MainApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation State
  const [viewState, setViewState] = useState<'landing' | 'login' | 'register'>('landing');

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
    setViewState('landing');
  };

  const handleAuthSuccess = (newUser: User) => {
    setUser(newUser);
    setViewState('landing'); // Reset view state, but user is logged in so dashboard shows
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <Rocket className="w-10 h-10 text-sky-500 animate-bounce" />
           <div className="text-sky-500 font-bold tracking-widest text-sm">MEMUAT TEENSKILL...</div>
        </div>
      </div>
    );
  }

  return (
    <BackgroundWrapper>
      {/* Navbar (Fixed Glass Header) */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <nav className="max-w-7xl mx-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 rounded-2xl shadow-sm px-6 h-16 flex justify-between items-center transition-all duration-300">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => { if(!user) setViewState('landing'); }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="bg-gradient-to-br from-sky-500 to-indigo-500 text-white p-1.5 rounded-lg shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
                <Rocket className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 dark:from-white dark:to-slate-300 tracking-tight">
                TeenSkill
              </span>
            </div>
            
            {user && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 text-[10px] rounded-full uppercase font-extrabold tracking-widest border border-sky-200 dark:border-sky-800/50">
                {user.role === 'freelancer' ? 'Siswa' : 'Klien'}
              </span>
            )}
          </div>
          
          {/* Actions Area */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-yellow-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all shadow-sm"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">@{user.username}</span>
                </div>
                <div className="h-9 w-9 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-800">
                   {user.name.charAt(0)}
                </div>
                <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 rounded-xl">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
               <div className="flex gap-2">
                 {viewState === 'landing' && (
                    <Button variant="secondary" className="px-4 py-2 text-xs" onClick={() => setViewState('login')}>Masuk</Button>
                 )}
               </div>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10 pb-12">
        {user ? (
          <>
            {user.role === 'client' && <ClientDashboard user={user} />}
            {user.role === 'freelancer' && <FreelancerDashboard user={user} />}
          </>
        ) : (
          <>
            {viewState === 'landing' && <LandingPage onRegister={() => setViewState('register')} onLogin={() => setViewState('login')} />}
            {viewState === 'register' && <Onboarding onComplete={handleAuthSuccess} />}
            {viewState === 'login' && <Login onLoginSuccess={handleAuthSuccess} onBack={() => setViewState('landing')} />}
          </>
        )}
      </main>
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