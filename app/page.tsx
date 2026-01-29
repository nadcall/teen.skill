
'use client';

import React, { useEffect, useState } from 'react';
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { BackgroundWrapper } from '@/components/BackgroundWrapper';
import { ClientDashboard } from '@/app/dashboard/ClientDashboard';
import { FreelancerDashboard } from '@/app/dashboard/FreelancerDashboard';
import { Onboarding } from '@/components/Onboarding';
import { syncUser, setupDatabaseAction } from '@/app/actions';
import { Button } from '@/components/Button';
import { Rocket, AlertTriangle, Database, RefreshCw } from 'lucide-react';
import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [errorDb, setErrorDb] = useState<string | null>(null);
  const [isFixingDb, setIsFixingDb] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      setLoadingDb(true);
      setErrorDb(null);
      
      syncUser()
        .then((u) => {
          setDbUser(u);
        })
        .catch((err) => {
          console.error("Gagal sinkronisasi user:", err);
          setErrorDb(err.message || "Gagal terhubung ke database.");
        })
        .finally(() => {
          setLoadingDb(false);
        });
    }
  }, [isSignedIn]);

  const handleFixDatabase = async () => {
    setIsFixingDb(true);
    try {
      const res = await setupDatabaseAction();
      if (res.success) {
        alert("Database berhasil diperbaiki! Halaman akan dimuat ulang.");
        window.location.reload();
      } else {
        alert("Gagal memperbaiki database: " + res.message);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsFixingDb(false);
    }
  };

  // Tampilan Loading
  if (!isLoaded || (isSignedIn && loadingDb)) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-sky-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <Rocket className="w-10 h-10 text-sky-500 animate-bounce" />
           <div className="text-sky-500 font-bold tracking-widest text-sm">MEMUAT TEENSKILL...</div>
        </div>
      </div>
    );
  }

  // Tampilan Error Database
  if (isSignedIn && errorDb) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md text-center border border-red-100 dark:border-red-900 animate-fade-in-up">
           <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Setup Database Diperlukan</h2>
           <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
             Sepertinya ini adalah deployment pertama. Tabel database belum ditemukan di Turso.
           </p>
           
           <div className="flex flex-col gap-3">
             <Button 
                onClick={handleFixDatabase} 
                isLoading={isFixingDb}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
             >
                <Database className="w-4 h-4" />
                {isFixingDb ? "Sedang Membuat Tabel..." : "Perbaiki Database (Otomatis)"}
             </Button>
             
             <Button 
                onClick={() => window.location.reload()} 
                variant="ghost" 
                className="w-full"
             >
               <RefreshCw className="w-4 h-4 mr-2" /> Coba Muat Ulang
             </Button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <BackgroundWrapper>
      {/* Navbar Simple */}
      <nav className="fixed top-0 w-full p-4 z-50 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
         <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-500" />
            <span className="font-bold text-slate-800 dark:text-white">TeenSkill</span>
         </div>
         <div className="flex gap-2">
            {!isSignedIn && (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-xs px-3 py-2">Masuk</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="text-xs px-3 py-2">Daftar</Button>
                </SignUpButton>
              </>
            )}
            {isSignedIn && (
               <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                 {dbUser ? dbUser.role : 'Member Baru'}
               </div>
            )}
         </div>
      </nav>

      <main className="pt-24 px-4 pb-12 max-w-7xl mx-auto">
        {!isSignedIn && (
          <LandingPage 
            onRegister={() => (document.querySelector('.cl-signUpTrigger') as HTMLElement)?.click()} 
            onLogin={() => (document.querySelector('.cl-signInTrigger') as HTMLElement)?.click()} 
          />
        )}

        {isSignedIn && !dbUser && (
          <Onboarding onComplete={(u) => setDbUser(u)} />
        )}

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
