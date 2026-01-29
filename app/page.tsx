
'use client';

import React, { useEffect, useState } from 'react';
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { BackgroundWrapper } from '@/components/BackgroundWrapper';
import { ClientDashboard } from '@/app/dashboard/ClientDashboard';
import { FreelancerDashboard } from '@/app/dashboard/FreelancerDashboard';
import { Onboarding } from '@/components/Onboarding';
import { syncUser, checkSystemHealthAction } from '@/app/actions';
import { Button } from '@/components/Button';
import { Rocket, Loader2, CheckCircle2, XCircle, Database, Server, UserCheck } from 'lucide-react';
import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  
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
      // Step 1: Cek Clerk Client Load
      if (!isLoaded) return; // Tunggu Clerk loaded dulu
      setHealth(h => ({ ...h, clerk: 'success' }));

      // Step 2: Cek Server (Env & DB)
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

  // 2. SYNC USER (Jalan setelah diagnostik sukses & user login)
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
  // Tampilkan jika: Clerk belum load ATAU Health Check belum selesai ATAU Ada Error Fatal
  if (!isLoaded || health.checking || (health.database === 'error')) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#020617] px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800 animate-fade-in-up">
           
           <div className="flex flex-col items-center mb-8">
             <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
                <Rocket className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 dark:text-white">System Check</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Menyiapkan infrastruktur...</p>
           </div>

           <div className="space-y-4">
             {/* Status 1: Auth Service */}
             <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-3">
                 <UserCheck className="w-5 h-5 text-slate-500" />
                 <span className="font-medium text-slate-700 dark:text-slate-200">Auth Service (Clerk)</span>
               </div>
               {isLoaded ? (
                 <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md flex items-center gap-1">
                   <CheckCircle2 className="w-3 h-3" /> CONNECTED
                 </span>
               ) : (
                 <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
               )}
             </div>

             {/* Status 2: Environment */}
             <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-3">
                 <Server className="w-5 h-5 text-slate-500" />
                 <span className="font-medium text-slate-700 dark:text-slate-200">System Config</span>
               </div>
               {health.env === 'pending' ? <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" /> :
                health.env === 'success' ? <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> READY</span> :
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md flex items-center gap-1"><XCircle className="w-3 h-3" /> MISSING</span>
               }
             </div>

             {/* Status 3: Database */}
             <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-3">
                 <Database className="w-5 h-5 text-slate-500" />
                 <span className="font-medium text-slate-700 dark:text-slate-200">Turso Database</span>
               </div>
               {health.database === 'pending' ? <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" /> :
                health.database === 'success' ? <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> CONNECTED</span> :
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md flex items-center gap-1"><XCircle className="w-3 h-3" /> FAILED</span>
               }
             </div>
           </div>

           {health.errorMsg && (
             <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800">
               <strong>Diagnosa Error:</strong><br/>
               {health.errorMsg}
               <p className="mt-2">Silakan cek Environment Variables di Vercel.</p>
             </div>
           )}

           {health.database === 'error' && (
             <Button onClick={() => window.location.reload()} className="w-full mt-6 bg-slate-800 text-white hover:bg-slate-700">
               Coba Lagi (Reload)
             </Button>
           )}
        </div>
      </div>
    );
  }

  // --- MAIN APP (Hanya Render Jika Semua Check SUKSES) ---
  return (
    <BackgroundWrapper>
      {/* Navbar Simple */}
      <nav className="fixed top-0 w-full p-4 z-50 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
         <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2 shadow-sm transition-all hover:bg-white/70">
            <Rocket className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-slate-800 dark:text-white">TeenSkill</span>
         </div>
         <div className="flex gap-2">
            {!isSignedIn && (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-xs px-4 py-2 font-bold">Masuk</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="text-xs px-4 py-2 shadow-indigo-500/20">Daftar</Button>
                </SignUpButton>
              </>
            )}
            {isSignedIn && dbUser && (
               <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md pl-4 pr-1 py-1 rounded-full border border-white/20 animate-fade-in-up">
                 <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:inline">
                   Halo, {dbUser.name.split(' ')[0]}
                 </span>
                 <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                   {dbUser.role === 'client' ? 'Pemberi Tugas' : 'Freelancer'}
                 </div>
               </div>
            )}
         </div>
      </nav>

      <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto min-h-screen">
        
        {/* Scenario 1: Belum Login -> Landing Page */}
        {!isSignedIn && (
          <LandingPage />
        )}

        {/* Scenario 2: Sudah Login, Tapi Data DB Belum Ada -> Onboarding */}
        {isSignedIn && !dbUser && (
          <Onboarding onComplete={(u) => setDbUser(u)} />
        )}

        {/* Scenario 3: Login & Data Ada -> Dashboard Client */}
        {isSignedIn && dbUser && dbUser.role === 'client' && (
          <ClientDashboard user={dbUser} />
        )}

        {/* Scenario 4: Login & Data Ada -> Dashboard Freelancer */}
        {isSignedIn && dbUser && dbUser.role === 'freelancer' && (
          <FreelancerDashboard user={dbUser} />
        )}
      </main>
    </BackgroundWrapper>
  );
}
