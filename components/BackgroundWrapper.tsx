
import React from 'react';

export const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 perspective-1000">
      
      {/* 3D Animated Background Layer */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        
        {/* Base Gradient - Clean & Bright for Light Mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-[#0B1120]" />

        {/* 3D Orb 1 (Big Blue - Glossy Pixar Style) */}
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full animate-float-slow opacity-90 dark:opacity-20"
             style={{
               background: 'radial-gradient(circle at 30% 30%, #BAE6FD, #38BDF8, #0284C7)',
               boxShadow: 'inset 10px 10px 40px rgba(255,255,255,0.8), 0 20px 60px rgba(14, 165, 233, 0.3)'
             }}>
        </div>

        {/* 3D Orb 2 (Purple - Glossy Pixar Style) */}
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full animate-float-medium opacity-90 dark:opacity-20"
             style={{
               background: 'radial-gradient(circle at 30% 30%, #E9D5FF, #A855F7, #7E22CE)',
               boxShadow: 'inset 10px 10px 40px rgba(255,255,255,0.8), 0 20px 60px rgba(147, 51, 234, 0.3)'
             }}>
        </div>

        {/* 3D Orb 3 (Pink/Teal Accent - Glossy) */}
        <div className="absolute bottom-[-10%] left-[20%] w-[350px] h-[350px] rounded-full animate-float-fast opacity-80 dark:opacity-20"
             style={{
               background: 'radial-gradient(circle at 30% 30%, #FBCFE8, #F472B6, #DB2777)',
               boxShadow: 'inset 5px 5px 30px rgba(255,255,255,0.9), 0 15px 40px rgba(219, 39, 119, 0.25)'
             }}>
        </div>
        
        {/* Floating Particles/Sparkles */}
        <div className="absolute top-[20%] right-[30%] w-6 h-6 rounded-full bg-yellow-400 blur-[1px] animate-pulse-slow shadow-[0_0_15px_rgba(250,204,21,0.6)]"></div>
        <div className="absolute bottom-[30%] left-[10%] w-4 h-4 rounded-full bg-sky-400 blur-[1px] animate-bounce shadow-[0_0_10px_rgba(56,189,248,0.6)]"></div>

      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
