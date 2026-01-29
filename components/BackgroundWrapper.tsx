
import React from 'react';

export const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F0F4F8] dark:bg-[#0B1120] transition-colors duration-500 perspective-1000">
      
      {/* 3D Animated Background Layer */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        
        {/* Base Gradient - Lighter for cleaner look */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 dark:from-slate-900 dark:to-[#0B1120]" />

        {/* 3D Orb 1 (Big Blue) - Increased Opacity & Saturation */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full animate-float-slow opacity-100 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen blur-3xl"
             style={{
               background: 'radial-gradient(circle at 40% 40%, #bae6fd, #7dd3fc)',
             }}>
        </div>

        {/* 3D Orb 2 (Purple) */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full animate-float-medium opacity-100 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen blur-3xl"
             style={{
               background: 'radial-gradient(circle at 40% 40%, #e9d5ff, #c084fc)',
             }}>
        </div>

        {/* 3D Cube/Shape (Teal/Pink Accent) - Center Floating */}
        <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] rounded-full animate-float-fast opacity-80 dark:opacity-10 mix-blend-multiply dark:mix-blend-screen blur-2xl"
             style={{
               background: 'radial-gradient(circle at 50% 50%, #fbcfe8, #f472b6)',
             }}>
        </div>
        
        {/* Crisp Particles for Detail */}
        <div className="absolute top-[20%] right-[20%] w-32 h-32 rounded-full bg-yellow-200/50 blur-xl animate-pulse-slow mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[40%] left-[10%] w-24 h-24 rounded-full bg-blue-300/40 blur-xl animate-bounce mix-blend-multiply dark:mix-blend-screen"></div>

      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
