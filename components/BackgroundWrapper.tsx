
import React from 'react';

export const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F0F4F8] dark:bg-[#0B1120] transition-colors duration-500 perspective-1000">
      
      {/* 3D Animated Background Layer */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-[#0B1120]" />

        {/* 3D Orb 1 (Big Blue) */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full animate-float-slow opacity-80 mix-blend-multiply dark:mix-blend-normal dark:opacity-20"
             style={{
               background: 'radial-gradient(circle at 30% 30%, #BAE6FD, #38BDF8)',
               boxShadow: 'inset -20px -20px 60px rgba(0,0,0,0.1), inset 10px 10px 40px rgba(255,255,255,0.8), 0 20px 50px rgba(56, 189, 248, 0.3)'
             }}>
        </div>

        {/* 3D Orb 2 (Purple) */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full animate-float-medium opacity-80 mix-blend-multiply dark:mix-blend-normal dark:opacity-20"
             style={{
               background: 'radial-gradient(circle at 30% 30%, #E9D5FF, #A855F7)',
               boxShadow: 'inset -20px -20px 60px rgba(0,0,0,0.1), inset 10px 10px 40px rgba(255,255,255,0.8), 0 20px 50px rgba(168, 85, 247, 0.3)'
             }}>
        </div>

        {/* 3D Cube/Shape (Teal) - Center Floating */}
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-[60px] animate-float-fast opacity-60 mix-blend-multiply dark:mix-blend-normal dark:opacity-10 rotate-12"
             style={{
               background: 'radial-gradient(circle at 30% 30%, #CCFBF1, #2DD4BF)',
               boxShadow: 'inset -10px -10px 40px rgba(0,0,0,0.05), inset 10px 10px 30px rgba(255,255,255,0.9), 0 20px 40px rgba(45, 212, 191, 0.2)'
             }}>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute top-[20%] right-[20%] w-8 h-8 rounded-full bg-yellow-300 blur-sm animate-pulse-slow"></div>
        <div className="absolute bottom-[30%] left-[10%] w-12 h-12 rounded-full bg-pink-300 blur-md animate-bounce"></div>

      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
