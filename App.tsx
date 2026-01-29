import React, { useState, useEffect } from 'react';
import { User } from './types';
import { getCurrentUser, logout } from './services/db';
import { LandingPage } from './app/page';
import { Onboarding } from './components/Onboarding';
import { ClientDashboard } from './app/dashboard/ClientDashboard';
import { FreelancerDashboard } from './app/dashboard/FreelancerDashboard';
import { Button } from './components/Button';
import { LogOut, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Not logged in and not onboarding -> Landing
  if (!user && !showOnboarding) {
    return <LandingPage onStart={handleStart} />;
  }

  // Onboarding flow
  if (!user && showOnboarding) {
    return <Onboarding onComplete={(newUser) => setUser(newUser)} />;
  }

  // Authenticated State - Dashboard Layout
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 cursor-pointer">
              TeenSkill
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full uppercase font-bold tracking-wider">
              {user?.role}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              <span className="text-xs text-gray-500">@{user?.username}</span>
            </div>
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
               {user?.name.charAt(0)}
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:bg-red-50">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {user?.role === 'client' ? (
          <ClientDashboard user={user} />
        ) : user?.role === 'freelancer' ? (
          <FreelancerDashboard user={user} />
        ) : (
          <div className="text-center py-20 text-gray-500">
            Dasbor orang tua belum diimplementasikan dalam demo ini.
          </div>
        )}
      </main>
    </div>
  );
};

export default App;