
import React from 'react';

// Komponen Kubus 3D Kecil
const FloatingCube = ({ size, left, delay, duration, colorClass }: any) => {
  return (
    <div 
      className="absolute preserve-3d"
      style={{
        left: left,
        width: size,
        height: size,
        bottom: '-20%', // Mulai dari bawah layar
        animation: `float-rotate ${duration}s linear infinite`,
        animationDelay: delay,
      }}
    >
      {/* 6 Sisi Kubus */}
      {['rotateX(0deg)', 'rotateX(180deg)', 'rotateY(90deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)'].map((transform, i) => (
        <div
          key={i}
          className={`absolute inset-0 border border-white/30 dark:border-white/10 ${colorClass} backdrop-blur-[1px] opacity-40`}
          style={{
            transform: `${transform} translateZ(${parseInt(size)/2}px)`,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        />
      ))}
    </div>
  );
};

export const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 perspective-[1000px]">
      
      {/* 3D Animated Background Layer */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-sky-50 dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#1E293B]" />

        {/* Existing Orbs (Tetap ada sebagai ambient light) */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full animate-float-slow opacity-60 dark:opacity-10 blur-[80px]"
             style={{ background: 'radial-gradient(circle, #38BDF8 0%, transparent 70%)' }} />
        
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full animate-float-medium opacity-60 dark:opacity-10 blur-[80px]"
             style={{ background: 'radial-gradient(circle, #818CF8 0%, transparent 70%)' }} />

        {/* --- 3D FLOATING CUBES --- */}
        {/* Kubus-kubus ini akan melayang dari bawah ke atas sambil berputar */}
        <FloatingCube size="60px" left="10%" delay="0s" duration="20" colorClass="bg-sky-500/10" />
        <FloatingCube size="40px" left="25%" delay="5s" duration="25" colorClass="bg-purple-500/10" />
        <FloatingCube size="80px" left="50%" delay="2s" duration="30" colorClass="bg-indigo-500/10" />
        <FloatingCube size="50px" left="75%" delay="8s" duration="22" colorClass="bg-blue-500/10" />
        <FloatingCube size="30px" left="90%" delay="12s" duration="18" colorClass="bg-sky-500/10" />
        <FloatingCube size="45px" left="15%" delay="15s" duration="28" colorClass="bg-purple-500/10" />

      </div>
      
      {/* CSS untuk Animasi 3D */}
      <style>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        @keyframes float-rotate {
          0% {
            transform: translateY(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) rotateX(360deg) rotateY(360deg) rotateZ(180deg);
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
