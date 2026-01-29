import React from 'react';

export const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden selection:bg-sky-200 selection:text-sky-900 bg-[#F0F9FF] dark:bg-[#0B1120]">
      
      {/* SVG Background Layer */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        
        {/* Slightly stronger pastel base */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-purple-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 opacity-100" />

        {/* Animated SVG Shapes with Higher Opacity */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-80 dark:opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="bbblurry-filter" x="-100%" y="-100%" width="400%" height="400%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="70" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" edgeMode="none" result="blur"></feGaussianBlur>
            </filter>
          </defs>
          
          {/* Shape 1: Top Left - Vivid Pastel Blue */}
          <g filter="url(#bbblurry-filter)">
            <ellipse rx="300" ry="300" cx="5%" cy="5%" fill="rgba(14, 165, 233, 0.25)" className="animate-float-slow"> 
            </ellipse>
          </g>

          {/* Shape 2: Bottom Right - Vivid Pastel Purple */}
          <g filter="url(#bbblurry-filter)">
            <ellipse rx="350" ry="350" cx="95%" cy="95%" fill="rgba(168, 85, 247, 0.25)" className="animate-float-medium"> 
            </ellipse>
          </g>

          {/* Shape 3: Center Left - Vivid Teal */}
          <g filter="url(#bbblurry-filter)">
            <ellipse rx="250" ry="250" cx="20%" cy="60%" fill="rgba(45, 212, 191, 0.2)" className="animate-float-fast"> 
            </ellipse>
          </g>
             
          {/* Shape 4: Top Right - Vivid Pink */}
          <g filter="url(#bbblurry-filter)">
            <ellipse rx="200" ry="200" cx="85%" cy="15%" fill="rgba(244, 114, 182, 0.2)" className="animate-pulse-slow"> 
            </ellipse>
          </g>
        </svg>

        {/* Moving Particles (Simulated with simple divs for extra "alive" feeling) */}
        <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-yellow-300 rounded-full blur-sm opacity-60 animate-bounce"></div>
        <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-pink-300 rounded-full blur-md opacity-50 animate-pulse"></div>

        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};