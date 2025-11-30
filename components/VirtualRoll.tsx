import React, { useMemo } from 'react';
import { PrintError, ErrorStatus, ErrorSeverity } from '../types';
import { PIXELS_PER_METER } from '../constants';

interface VirtualRollProps {
  errors: PrintError[];
  onErrorClick: (error: PrintError) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  activeErrorId: string | null;
  offsetMeters: number;
  totalMeters: number;
}

interface PrintItem {
    id: string;
    top: number;
    height: number;
    widthPercent: number;
    leftPercent: number;
    imageIndex: number;
    zIndex: number;
}

// Deterministic Pseudo-Random Number Generator
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const PrinterHeader = () => (
  <div className="relative z-30 w-full flex-shrink-0 pointer-events-none">
     {/* Printer Machine Visualization */}
     <div className="w-full h-64 bg-slate-300/95 backdrop-blur-sm relative shadow-2xl overflow-hidden border-b border-slate-400/50">
        
        {/* Floor Context */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-300"></div>

        {/* Printer Chassis (Top View) */}
        <div className="absolute bottom-0 left-0 right-0 h-52 bg-slate-800 rounded-t-xl shadow-[0_10px_50px_rgba(0,0,0,0.6)] flex flex-col items-center border-t border-slate-700 relative z-20">
             
             {/* Top Surface Texture */}
             <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-xl opacity-50"></div>

             {/* Center Hood / Window - Width 86% */}
             <div className="relative z-10 w-[86%] h-full bg-slate-900 rounded-t-2xl border-l border-r border-slate-600 overflow-hidden group shadow-2xl">
                 {/* Branding */}
                 <div className="absolute top-6 w-full text-center">
                    <span className="text-slate-600 font-black text-2xl tracking-[0.3em] opacity-30 group-hover:opacity-50 transition-opacity">HP LATEX 3000</span>
                 </div>
                 
                 {/* Window Reflection Effect */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"></div>
                 
                 {/* Internal Carriage Animation (Subtle) */}
                 <div className="absolute bottom-12 left-0 right-0 h-1 bg-blue-500/20 blur-md animate-pulse"></div>
             </div>

             {/* Left Ink Station Housing */}
             <div className="absolute left-0 top-12 bottom-0 w-24 lg:w-32 bg-slate-800 border-r border-black/30 rounded-tl-xl flex flex-col justify-end pb-8 px-4 gap-3 z-0">
                 {[1,2,3].map(i => (
                    <div key={i} className="h-2 w-full bg-slate-900 rounded-full shadow-inner border-b border-slate-700"></div>
                 ))}
             </div>

             {/* Right Control Station Housing */}
             <div className="absolute right-0 top-12 bottom-0 w-24 lg:w-32 bg-slate-800 border-l border-black/30 rounded-tr-xl flex items-center justify-end px-4 z-0">
                  <div className="w-16 lg:w-20 h-12 bg-black rounded-lg border-2 border-slate-600 flex items-center justify-center shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                      <span className="text-[8px] lg:text-[10px] text-green-400 font-mono relative z-10">READY</span>
                  </div>
             </div>

             {/* Mechanical Exit Lip */}
             <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/80 z-30 border-t border-slate-700 shadow-xl"></div>
             
             {/* Exit Shadow Gradient */}
             <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent z-40 pointer-events-none opacity-80"></div>
        </div>
     </div>
  </div>
);

const VirtualRoll: React.FC<VirtualRollProps> = ({ 
  errors, 
  onErrorClick, 
  scrollRef, 
  activeErrorId,
  offsetMeters,
  totalMeters
}) => {
  const totalHeight = totalMeters * PIXELS_PER_METER;
  
  // Create a stable layout key to prevent re-renders when only status changes
  const errorStructureKey = JSON.stringify(errors.map(e => ({ id: e.id, x: e.xPosition, m: e.meter })));

  const printItems = useMemo(() => {
    const items: PrintItem[] = [];
    
    // Step size in meters for the background grid
    // 1.6m is approx 240px, a good size for images
    const stepMeters = 1.6; 
    const gapPx = 20; // ~0.13m gap (must be < 0.2m)
    
    // Calculate P range (Paper Coordinate System)
    // We render items that would be visible on screen or just off-screen
    const startP = Math.floor(-offsetMeters / stepMeters) * stepMeters - stepMeters; 
    const endP = Math.ceil((totalMeters - offsetMeters) / stepMeters) * stepMeters + stepMeters;

    for (let p = startP; p < endP; p += stepMeters) {
        // Calculate Screen Top Position
        const yMeters = p + offsetMeters;
        const top = yMeters * PIXELS_PER_METER;

        // Skip items that are wildly off screen (optimization)
        if (top < -500 || top > totalHeight + 500) continue;

        // Base Layout for this grid slot
        // Seed based on P ensures stability as roll moves
        const seed = Math.round(p * 137); 
        
        let height = (stepMeters * PIXELS_PER_METER) - gapPx;
        // Small random variation to height to look organic, but keeping gap small
        height -= Math.floor(seededRandom(seed + 5) * 10); 

        let widthPercent = 50 + Math.floor(seededRandom(seed + 1) * 40); // 50-90%
        let leftPercent = seededRandom(seed + 2) * (100 - widthPercent);
        let imageIndex = Math.abs(Math.floor(p));
        let zIndex = 5;

        // --- CHECK FOR ERRORS IN THIS SLICE ---
        // An error is in this slice if its Paper Coordinate (error.meter - offsetMeters) falls within [p, p + stepMeters)
        const errorsInSlice = errors.filter(e => {
            // Error Meter is Screen Y relative to print head (increments with simulation)
            // OffsetMeters is simulation progress
            // So (e.meter - offsetMeters) is the fixed position on the paper
            const paperPos = e.meter - offsetMeters;
            // Add a small buffer to catch errors slightly on the edge due to rounding
            return paperPos >= p - 0.1 && paperPos < p + stepMeters + 0.1;
        });

        if (errorsInSlice.length > 0) {
            // PROMOTE THIS IMAGE TO BE AN ERROR IMAGE
            zIndex = 10;
            
            // 1. Ensure it covers all errors horizontally
            const minX = Math.min(...errorsInSlice.map(e => e.xPosition));
            const maxX = Math.max(...errorsInSlice.map(e => e.xPosition));
            
            // Adjust Left/Width to cover [minX, maxX] with padding
            const padding = 10;
            const reqLeft = Math.max(0, minX - padding);
            const reqRight = Math.min(100, maxX + padding);
            
            // Override random values if they don't cover the error
            if (leftPercent > reqLeft) leftPercent = reqLeft;
            if (leftPercent + widthPercent < reqRight) {
                 widthPercent = reqRight - leftPercent;
            }
            // Clamp width
            if (leftPercent + widthPercent > 100) widthPercent = 100 - leftPercent;

            // 2. Ensure it covers errors vertically (Gap Insurance)
            // If an error is very close to the bottom gap, extend height to cover it
            const maxErrorPaperPos = Math.max(...errorsInSlice.map(e => e.meter - offsetMeters));
            const itemEndP = p + stepMeters;
            // Convert gap to meters approx
            const gapMeters = gapPx / PIXELS_PER_METER; 
            
            // If error is in the gap zone
            if (maxErrorPaperPos > itemEndP - gapMeters) {
                 height += gapPx + 10; // Extend height to bridge the gap
            }

            // 3. Use Error ID for image consistency
            // Use the first error's ID to generate the image index, ensuring the Modal sees the same image
            const primaryErrorId = parseInt(errorsInSlice[0].id) || 999;
            imageIndex = 1000 + primaryErrorId;
        }

        items.push({
            id: `img-${p.toFixed(2)}`, // Stable ID based on paper pos
            top,
            height,
            widthPercent,
            leftPercent,
            imageIndex,
            zIndex
        });
    }

    return items;
  }, [errorStructureKey, totalMeters, offsetMeters]); 

  return (
    <div className="relative h-full flex flex-col bg-slate-200 overflow-hidden w-full">
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative no-scrollbar w-full" 
        style={{ scrollBehavior: 'smooth' }}
      >
         {/* Printer Header */}
         <PrinterHeader />

         {/* The Roll Container */}
         <div className="relative w-full flex justify-center pb-96 min-h-[1000px] bg-slate-200/50 -mt-32">
             
             {/* The Paper Roll */}
             <div 
               className="relative bg-white shadow-[0_0_50px_rgba(0,0,0,0.2)] z-10 overflow-hidden"
               style={{ 
                 height: `${totalHeight}px`, 
                 width: '86%',
                 maxWidth: 'none' 
               }}
             >
                {/* Images */}
                <div className="absolute inset-0">
                    {printItems.map((item) => (
                        <div 
                          key={item.id}
                          className="absolute bg-gray-100 overflow-hidden shadow-sm transition-opacity hover:opacity-90"
                          style={{
                            top: `${item.top}px`,
                            height: `${item.height}px`,
                            width: `${item.widthPercent}%`,
                            left: `${item.leftPercent}%`,
                            zIndex: item.zIndex
                          }}
                        >
                           <img 
                                src={`https://picsum.photos/800/600?random=${item.imageIndex}`} 
                                alt="" 
                                className="w-full h-full object-cover brightness-[1.02] contrast-[1.05]"
                            />
                            {/* Crop marks */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black opacity-20"></div>
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black opacity-20"></div>
                        </div>
                    ))}
                    
                    {/* Meter Markings */}
                    <div className="absolute -left-0 top-0 bottom-0 w-8 flex flex-col justify-start items-center py-2 text-[10px] font-mono text-slate-400 border-r border-slate-100 z-20 overflow-hidden">
                         {Array.from({ length: Math.ceil(totalMeters) }).map((_, i) => (
                           <div key={i} className="absolute border-b border-slate-200 w-full flex justify-center" style={{ top: `${i * PIXELS_PER_METER}px` }}>
                              <span className="bg-white px-1">{i}m</span>
                           </div>
                         ))}
                    </div>
                </div>

                {/* Blur Gradient Overlay */}
                <div 
                  className="absolute top-0 left-0 right-0 z-[25] pointer-events-none"
                  style={{
                    height: `${2 * PIXELS_PER_METER}px`,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
                  }}
                ></div>

                {/* Shadows */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none z-10"></div>
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-10"></div>

                {/* Error Dots */}
                {errors.map((error) => {
                  const topPos = error.meter * PIXELS_PER_METER;
                  const isDismissed = error.status === ErrorStatus.DISMISSED;
                  const isActive = activeErrorId === error.id;
                  
                  let colorClass = 'bg-orange-500';
                  if (error.severity === ErrorSeverity.HIGH) colorClass = 'bg-red-600';
                  if (isDismissed) colorClass = 'bg-gray-400';

                  return (
                    <button
                      key={error.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onErrorClick(error);
                      }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-30 group outline-none
                        ${isActive ? 'scale-150 z-40' : 'hover:scale-125'}
                      `}
                      style={{ 
                        top: `${topPos}px`, 
                        left: `${error.xPosition}%` 
                      }}
                    >
                      {isActive && (
                          <div className="absolute inset-0 rounded-full ring-4 ring-blue-400 opacity-60 animate-pulse scale-150"></div>
                      )}
                      <span className={`flex h-6 w-6 relative`}>
                         {!isDismissed && (
                           <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass}`}></span>
                         )}
                         <span className={`relative inline-flex rounded-full h-6 w-6 border-2 border-white shadow-lg ${colorClass} items-center justify-center`}>
                            <span className="text-[9px] font-bold text-white">{error.id}</span>
                         </span>
                      </span>
                    </button>
                  );
                })}
             </div>
         </div>
      </div>
    </div>
  );
};

export default VirtualRoll;