
'use client';

import React, { useEffect, useState } from 'react';
import { useUser, SignInButton, SignUpButton, UserButton, SignOutButton } from "@clerk/nextjs";
import { BackgroundWrapper } from '@/components/BackgroundWrapper';
import { ClientDashboard } from '@/app/dashboard/ClientDashboard';
import { FreelancerDashboard } from '@/app/dashboard/FreelancerDashboard';
import { Onboarding } from '@/components/Onboarding';
import { syncUser, checkSystemHealthAction } from '@/app/actions';
import { Button } from '@/components/Button';
import { Rocket, Loader2, CheckCircle2, XCircle, Database, Server, UserCheck, Moon, Sun, LogOut } from 'lucide-react';
import { LandingPage } from '@/components/LandingPage';
import { useTheme } from '@/context/ThemeContext';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { theme, toggleTheme } = useTheme();
  
  // State Diagnostik
  const [health, setHealth] = useState({
    checking: true,
    env: 'pending' as 'pending' | 'success' | 'error',
    database: 'pending' as 'pending' | 'success' | 'error',
    clerk: 'pending' as 'pending' | 'success' | 'error',
    errorMsg: ''
  });

  const [dbUser, setDbUser] = useState<any>(null);

  // 1. DIAGNOSTIC BOOT (Jalan saat awal buka)
  useEffect(() => {
    const runDiagnostics = async () => {
      if (!isLoaded) return; 
      setHealth(h => ({ ...h, clerk: 'success' }));

      try {
        const status = await checkSystemHealthAction();
        
        if (status.env && status.database) {
           setHealth(h => ({ 
             ...h, 
             env: 'success', 
             database: 'success', 
             checking: false 
           }));
        } else {
           setHealth(h => ({ 
             ...h, 
             env: status.env ? 'success' : 'error', 
             database: status.database ? 'success' : 'error', 
             checking: false,
             errorMsg: status.message 
           }));
        }
      } catch (e: any) {
        setHealth(h => ({ 
          ...h, 
          database: 'error', 
          checking: false, 
          errorMsg: "Gagal menghubungi server: " + e.message 
        }));
      }
    };

    if (isLoaded) {
      runDiagnostics();
    }
  }, [isLoaded]);

  // 2. SYNC USER
  useEffect(() => {
    if (!health.checking && health.database === 'success' && isSignedIn && !dbUser) {
      const fetchUserData = async () => {
        const u = await syncUser();
        if (u) setDbUser(u);
      };
      fetchUserData();
    }
  }, [health.checking, health.database, isSignedIn, dbUser]);

  // --- DIAGNOSTIC SCREEN / LOADING ---
  if (!isLoaded || health.checking || (health.database === 'error')) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 dark:bg-[#020617] px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800 animate-fade-in-up">
           <div className="flex flex-col items-center mb-8">
             <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
                <Rocket className="w-8 h-8 text-sky-600 dark:text-sky-400" />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white">System Check</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Menyiapkan infrastruktur...</p>
           </div>
           
           {/* Simple Status List */}
           <div className="space-y-4">
             <StatusItem icon={UserCheck} label="Auth Service" status={isLoaded ? 'success' : 'loading'} />
             <StatusItem icon={Server} label="System Config" status={health.env === 'pending' ? 'loading' : health.env === 'success' ? 'success' : 'error'} />
             <StatusItem icon={Database} label="Turso Database" status={health.database === 'pending' ? 'loading' : health.database === 'success' ? 'success' : 'error'} />
           </div>

           {health.errorMsg && (
             <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800">
               <strong>Diagnosa Error:</strong><br/>{health.errorMsg}
             </div>
           )}

           {health.database === 'error' && (
             <Button onClick={() => window.location.reload()} className="w-full mt-6 bg-slate-800 text-white hover:bg-slate-700">Coba Lagi (Reload)</Button>
           )}
        </div>
      </div>
    );
  }

  // --- MAIN APP ---
  return (
    <BackgroundWrapper>
      {/* Navbar Global (Hanya muncul jika BELUM login atau BELUM setup profile) */}
      {(!isSignedIn || !dbUser) && (
        <nav className="fixed top-0 w-full p-4 z-50 flex justify-between items-center max-w-7xl mx-auto left-0 right-0 animate-fade-in-up">
           <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/40 dark:border-slate-700 flex items-center gap-2 shadow-sm">
              <Rocket className="w-5 h-5 text-sky-500" />
              <span className="font-bold text-slate-800 dark:text-white tracking-tight">TeenSkill</span>
           </div>
           
           <div className="flex gap-2 items-center">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/40 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {!isSignedIn && (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost" className="text-xs px-4 py-2 font-bold hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">Masuk</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="text-xs px-4 py-2 shadow-lg shadow-sky-500/20 bg-sky-500 hover:bg-sky-600 text-white">Daftar</Button>
                  </SignUpButton>
                </>
              )}
           </div>
        </nav>
      )}

      {/* Main Content Area */}
      {/* Remove padding top if user is logged in because dashboards have their own layout */}
      <main className={`min-h-screen ${(!isSignedIn || !dbUser) ? 'pt-24 px-4 pb-12' : ''} max-w-7xl mx-auto`}>
        {!isSignedIn && <LandingPage />}
        {isSignedIn && !dbUser && <Onboarding onComplete={(u) => setDbUser(u)} />}
        {isSignedIn && dbUser && dbUser.role === 'client' && <ClientDashboard user={dbUser} />}
        {isSignedIn && dbUser && dbUser.role === 'freelancer' && <FreelancerDashboard user={dbUser} />}
      </main>
    </BackgroundWrapper>
  );
}

// Sub-component for clean code
const StatusItem = ({ icon: Icon, label, status }: any) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-slate-500" />
      <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{label}</span>
    </div>
    {status === 'loading' && <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />}
    {status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
    {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
  </div>
);
