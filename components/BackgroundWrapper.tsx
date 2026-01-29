
import React from 'react';

export const BackgroundWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden selection:bg-sky-200 selection:text-sky-900 bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-500">
      
      {/* SVG Background Layer */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        
        {/* Soft Pastel Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 opacity-100" />

        {/* Animated Pastel Shapes */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-60 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="bbblurry-filter" x="-100%" y="-100%" width="400%" height="400%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="80" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" edgeMode="none" result="blur"></feGaussianBlur>
            </filter>
          </defs>
          
          {/* Shape 1: Baby Blue - Top Left */}
          <g filter="url(#bbblurry-filter)">
            <ellipse rx="400" ry="400" cx="10%" cy="0%" fill="rgba(186, 230, 253, 0.6)" className="animate-float-slow"> 
            </ellipse>
          </g>

          {/* Shape 2: Soft Lavender - Bottom Right */}
          <g filter="url(#bbblurry-filter)">
            <ellipse rx="350" ry="350" cx="90%" cy="100%" fill="rgba(221, 214, 254, 0.5)" className="animate-float-medium"> 
            </ellipse>
          </g>

          {/* Shape 3: Pale Cyan - Center */}
          <g filter="url(#bbblurry-filter)">
            <ellipse rx="250" ry="250" cx="50%" cy="50%" fill="rgba(204, 251, 241, 0.4)" className="animate-float-fast"> 
            </ellipse>
          </g>
        </svg>

        {/* Grid Texture Overlay (Subtle) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
