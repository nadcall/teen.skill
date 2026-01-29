
import React from 'react';

// Komponen Kubus 3D
const FloatingCube = ({ size, left, delay, duration, colorClass }: any) => {
  // Hitung translateZ berdasarkan ukuran agar kubus benar-benar kotak 3D
  const halfSize = parseInt(size) / 2;
  
  return (
    <div 
      className="absolute preserve-3d"
      style={{
        left: left,
        width: size,
        height: size,
        bottom: '-150px', // Mulai dari bawah viewport
        transformStyle: 'preserve-3d',
        animation: `float-rotate ${duration}s linear infinite`,
        animationDelay: delay,
      }}
    >
      {/* 6 Sisi Kubus */}
      {/* Front, Back, Right, Left, Top, Bottom */}
      <div className={`cube-face ${colorClass}`} style={{ transform: `rotateY(0deg) translateZ(${halfSize}px)` }} />
      <div className={`cube-face ${colorClass}`} style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)` }} />
      <div className={`cube-face ${colorClass}`} style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)` }} />
      <div className={`cube-face ${colorClass}`} style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)` }} />
      <div className={`cube-face ${colorClass}`} style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)` }} />
      <div className={`cube-face ${colorClass}`} style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)` }} />
    </div>
  );
};

export const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    // Hapus bg-color di wrapper utama agar tidak menutupi fixed layer di belakangnya
    <div className="relative min-h-screen w-full overflow-hidden transition-colors duration-500">
      
      {/* BACKGROUND LAYER (Fixed & Z-Index Paling Belakang) */}
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
        
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-sky-50 to-indigo-50/50 dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#1E293B]" />

        {/* Ambient Orbs (Cahaya Redup) */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-40 dark:opacity-10 blur-[100px] bg-sky-400 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-40 dark:opacity-10 blur-[100px] bg-purple-500 animate-pulse-slow" />

        {/* 3D SCENE CONTAINER */}
        <div className="absolute inset-0 perspective-container">
            {/* Kubus-kubus 3D */}
            <FloatingCube size="60px" left="10%" delay="0s" duration="25" colorClass="cube-sky" />
            <FloatingCube size="40px" left="20%" delay="5s" duration="20" colorClass="cube-purple" />
            <FloatingCube size="80px" left="40%" delay="2s" duration="35" colorClass="cube-indigo" />
            <FloatingCube size="50px" left="65%" delay="8s" duration="28" colorClass="cube-blue" />
            <FloatingCube size="35px" left="85%" delay="12s" duration="22" colorClass="cube-sky" />
            <FloatingCube size="55px" left="90%" delay="4s" duration="30" colorClass="cube-purple" />
        </div>

      </div>
      
      {/* GLOBAL STYLES FOR 3D ANIMATION */}
      <style>{`
        .perspective-container {
          perspective: 1000px;
          perspective-origin: 50% 50%;
          transform-style: preserve-3d;
          overflow: hidden;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        /* Face Styles */
        .cube-face {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(2px);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
        }

        /* Warna Kubus (Light/Dark aware via classes) */
        .cube-sky {
          background: rgba(56, 189, 248, 0.1); /* Sky */
          border-color: rgba(56, 189, 248, 0.3);
        }
        .dark .cube-sky {
          background: rgba(56, 189, 248, 0.05);
          border-color: rgba(56, 189, 248, 0.1);
        }

        .cube-purple {
          background: rgba(168, 85, 247, 0.1); /* Purple */
          border-color: rgba(168, 85, 247, 0.3);
        }
        .dark .cube-purple {
          background: rgba(168, 85, 247, 0.05);
          border-color: rgba(168, 85, 247, 0.1);
        }

        .cube-indigo {
          background: rgba(99, 102, 241, 0.1); /* Indigo */
          border-color: rgba(99, 102, 241, 0.3);
        }
        .dark .cube-indigo {
          background: rgba(99, 102, 241, 0.05);
          border-color: rgba(99, 102, 241, 0.1);
        }
        
        .cube-blue {
          background: rgba(59, 130, 246, 0.1); /* Blue */
          border-color: rgba(59, 130, 246, 0.3);
        }
        .dark .cube-blue {
           background: rgba(59, 130, 246, 0.05);
           border-color: rgba(59, 130, 246, 0.1);
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
            transform: translateY(-120vh) rotateX(360deg) rotateY(720deg) rotateZ(180deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Main Content (Z-Index di atas background) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
