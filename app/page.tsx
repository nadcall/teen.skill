
'use client';

import React, { useEffect, useState } from 'react';
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { BackgroundWrapper } from '@/components/BackgroundWrapper';
import { ClientDashboard } from '@/app/dashboard/ClientDashboard';
import { FreelancerDashboard } from '@/app/dashboard/FreelancerDashboard';
import { Onboarding } from '@/components/Onboarding';
import { syncUser } from '@/app/actions';
import { Button } from '@/components/Button';
import { Rocket } from 'lucide-react';
import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Logika Sinkronisasi Otomatis
    if (isSignedIn && !dbUser && !isSyncing) {
      setIsSyncing(true);
      
      syncUser()
        .then((u) => {
          if (u) {
            setDbUser(u);
          }
          // Jika u null (user baru atau db baru dibuat), 
          // komponen Onboarding akan muncul otomatis di bawah.
        })
        .catch((err) => {
          console.error("Sync silent error:", err);
          // Kita diamkan saja errornya, biarkan user tetap di halaman ini.
          // Karena di actions.ts kita sudah melakukan "Auto-Healing" database.
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  }, [isSignedIn, dbUser, isSyncing]);

  // Tampilan Loading Awal (Clerk belum load atau sedang sync DB pertama kali)
  if (!isLoaded || (isSignedIn && isSyncing && !dbUser)) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-sky-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
           <div className="relative">
             <Rocket className="w-12 h-12 text-indigo-500 animate-bounce" />
             <div className="absolute -bottom-2 w-full h-2 bg-black/10 rounded-full blur-sm animate-pulse"></div>
           </div>
           <div className="text-indigo-500 font-bold tracking-widest text-xs uppercase">Menyiapkan Ruang Kerjamu...</div>
        </div>
      </div>
    );
  }

  return (
    <BackgroundWrapper>
      {/* Navbar Simple */}
      <nav className="fixed top-0 w-full p-4 z-50 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
         <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2 shadow-sm">
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
               <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md pl-4 pr-1 py-1 rounded-full border border-white/20">
                 <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:inline">
                   Halo, {dbUser.name.split(' ')[0]}
                 </span>
                 <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                   {dbUser.role}
                 </div>
               </div>
            )}
         </div>
      </nav>

      <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto min-h-screen">
        
        {/* State 1: Belum Login -> Landing Page */}
        {!isSignedIn && (
          <LandingPage />
        )}

        {/* State 2: Sudah Login tapi Data DB Belum Ada -> Onboarding (Daftar Role) */}
        {isSignedIn && !dbUser && !isSyncing && (
          <Onboarding onComplete={(u) => setDbUser(u)} />
        )}

        {/* State 3: Sudah Login & Data Ada -> Dashboard sesuai Role */}
        {isSignedIn && dbUser && dbUser.role === 'client' && (
          <ClientDashboard user={dbUser} />
        )}

        {isSignedIn && dbUser && dbUser.role === 'freelancer' && (
          <FreelancerDashboard user={dbUser} />
        )}
      </main>
    </BackgroundWrapper>
  );
}
