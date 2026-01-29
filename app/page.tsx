
'use client';

import React, { useEffect, useState } from 'react';
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { BackgroundWrapper } from '@/components/BackgroundWrapper';
import { ClientDashboard } from '@/app/dashboard/ClientDashboard';
import { FreelancerDashboard } from '@/app/dashboard/FreelancerDashboard';
import { Onboarding } from '@/components/Onboarding';
import { syncUser, initializeSystemAction } from '@/app/actions';
import { Button } from '@/components/Button';
import { Rocket, Loader2, CheckCircle2 } from 'lucide-react';
import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  // State Global
  const [systemReady, setSystemReady] = useState(false); // Apakah DB sudah siap?
  const [dbUser, setDbUser] = useState<any>(null); // Data user dari DB
  const [initStep, setInitStep] = useState("Menyiapkan ruang kerjamu..."); // Pesan loading

  // 1. INITIALIZATION EFFECT (Jalan sekali saat aplikasi dibuka)
  useEffect(() => {
    const bootSystem = async () => {
      // Tunggu sebentar untuk efek visual yang halus
      await new Promise(r => setTimeout(r, 800));

      setInitStep("Menghubungkan Database...");
      const initResult = await initializeSystemAction();
      
      if (!initResult.success) {
        console.error("System Init Failed:", initResult.message);
        // Tetap lanjut agar user tidak stuck, tapi log error
      }

      setInitStep("Memuat akun...");
      setSystemReady(true);
    };

    bootSystem();
  }, []);

  // 2. USER SYNC EFFECT (Jalan setelah system ready & user login)
  useEffect(() => {
    if (systemReady && isLoaded && isSignedIn && !dbUser) {
      const fetchUserData = async () => {
        const u = await syncUser();
        if (u) setDbUser(u);
      };
      fetchUserData();
    }
  }, [systemReady, isLoaded, isSignedIn, dbUser]);

  // --- SPLASH SCREEN / LOADING SCREEN ---
  // Tampilkan ini jika: Clerk belum load ATAU Sistem belum ready
  if (!isLoaded || !systemReady) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 dark:bg-slate-900 transition-colors duration-500">
        <div className="flex flex-col items-center gap-6 animate-fade-in-up">
           <div className="relative">
             <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-none animate-bounce">
                <Rocket className="w-10 h-10 text-indigo-500" />
             </div>
             {/* Loading Ping */}
             <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
             <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
           </div>
           
           <div className="text-center space-y-2">
             <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">TeenSkill</h2>
             <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 px-4 py-1.5 rounded-full">
               <Loader2 className="w-3 h-3 animate-spin" />
               {initStep}
             </div>
           </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP ---
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
