'use client';

import React, { useEffect, useState } from 'react';
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { BackgroundWrapper } from '@/components/BackgroundWrapper';
import { ClientDashboard } from '@/app/dashboard/ClientDashboard';
import { FreelancerDashboard } from '@/app/dashboard/FreelancerDashboard';
import { Onboarding } from '@/components/Onboarding';
import { syncUser } from '@/app/actions';
import { Button } from '@/components/Button';
import { Rocket, ArrowRight, UserCheck } from 'lucide-react';
import { LandingPage } from '@/components/LandingPage'; // You'll need to move LandingPage here or keep locally

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      setLoadingDb(true);
      syncUser().then((u) => {
        setDbUser(u);
        setLoadingDb(false);
      });
    }
  }, [isSignedIn]);

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
                 {dbUser ? dbUser.role : 'New User'}
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