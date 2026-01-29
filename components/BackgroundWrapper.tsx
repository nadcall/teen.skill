
import React from 'react';

export const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 perspective-1000">
      
      {/* 3D Animated Background Layer */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-[#0B1120]" />

        {/* 3D Orbs (Existing) */}
        <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full animate-float-slow opacity-90 dark:opacity-20"
             style={{
               background: 'radial-gradient(circle at 30% 30%, #BAE6FD, #38BDF8, #0284C7)',
               boxShadow: 'inset 10px 10px 40px rgba(255,255,255,0.8), 0 20px 60px rgba(14, 165, 233, 0.3)'
             }}>
        </div>

        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full animate-float-medium opacity-90 dark:opacity-20"
             style={{
               background: 'radial-gradient(circle at 30% 30%, #E9D5FF, #A855F7, #7E22CE)',
               boxShadow: 'inset 10px 10px 40px rgba(255,255,255,0.8), 0 20px 60px rgba(147, 51, 234, 0.3)'
             }}>
        </div>

        <div className="absolute bottom-[-10%] left-[20%] w-[350px] h-[350px] rounded-full animate-float-fast opacity-80 dark:opacity-20"
             style={{
               background: 'radial-gradient(circle at 30% 30%, #FBCFE8, #F472B6, #DB2777)',
               boxShadow: 'inset 5px 5px 30px rgba(255,255,255,0.9), 0 15px 40px rgba(219, 39, 119, 0.25)'
             }}>
        </div>
        
        {/* FALLING PARTICLES ANIMATION */}
        {/* Membuat beberapa partikel dengan delay dan posisi acak */}
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-white/80 to-sky-100/50 dark:from-white/10 dark:to-white/5 backdrop-blur-sm border border-white/20"
            style={{
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: '-10%',
              animationName: 'fall',
              animationDuration: `${Math.random() * 10 + 10}s`, // 10-20s duration
              animationDelay: `${Math.random() * 10}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
              opacity: 0.6
            }}
          />
        ))}

      </div>
      
      {/* CSS for Falling Animation */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(20px);
          }
          100% {
            transform: translateY(110vh) rotate(360deg) translateX(-20px);
            opacity: 0;
          }
        }
      `}</style>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
