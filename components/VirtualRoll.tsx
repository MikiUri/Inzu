import React, { useMemo } from 'react';
import { PrintError, ErrorStatus, ErrorSeverity, ErrorType } from '../types';
import { PIXELS_PER_METER } from '../constants';
import { Icons } from './Icons';

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

const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const PrinterHeader = () => (
  <div className="relative z-30 w-full flex-shrink-0 pointer-events-none">
     <div className="w-full h-64 bg-slate-300/95 backdrop-blur-sm relative shadow-2xl overflow-hidden border-b border-slate-400/50">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-300"></div>
        <div className="absolute bottom-0 left-0 right-0 h-52 bg-hp-dark rounded-t-xl shadow-[0_10px_50px_rgba(0,0,0,0.6)] flex flex-col items-center border-t border-slate-700 relative z-20">
             <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-xl opacity-50"></div>
             <div className="relative z-10 w-[86%] h-full bg-slate-900 rounded-t-2xl border-l border-r border-slate-600 overflow-hidden group shadow-2xl">
                 <div className="absolute top-6 w-full text-center">
                    <span className="text-slate-600 font-black text-2xl tracking-[0.3em] opacity-30 group-hover:opacity-50 transition-opacity">HP LATEX 3000</span>
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"></div>
             </div>
             <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/80 z-30 border-t border-slate-700 shadow-xl"></div>
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
  const errorStructureKey = JSON.stringify(errors.map(e => ({ id: e.id, x: e.xPosition, m: e.meter })));

  const printItems = useMemo(() => {
    const items: PrintItem[] = [];
    const stepMeters = 1.6; 
    const gapPx = 20; 
    
    const startP = Math.floor(-offsetMeters / stepMeters) * stepMeters - stepMeters; 
    const endP = Math.ceil((totalMeters - offsetMeters) / stepMeters) * stepMeters + stepMeters;

    for (let p = startP; p < endP; p += stepMeters) {
        const yMeters = p + offsetMeters;
        const top = yMeters * PIXELS_PER_METER;
        if (top < -500 || top > totalHeight + 500) continue;

        const seed = Math.round(p * 137); 
        let height = (stepMeters * PIXELS_PER_METER) - gapPx;
        height -= Math.floor(seededRandom(seed + 5) * 10); 

        let widthPercent = 50 + Math.floor(seededRandom(seed + 1) * 40); 
        let leftPercent = seededRandom(seed + 2) * (100 - widthPercent);
        let imageIndex = Math.abs(Math.floor(p));
        let zIndex = 5;

        const errorsInSlice = errors.filter(e => {
            const paperPos = e.meter - offsetMeters;
            return paperPos >= p - 0.1 && paperPos < p + stepMeters + 0.1;
        });

        if (errorsInSlice.length > 0) {
            zIndex = 10;
            const minX = Math.min(...errorsInSlice.map(e => e.xPosition));
            const maxX = Math.max(...errorsInSlice.map(e => e.xPosition));
            const padding = 10;
            const reqLeft = Math.max(0, minX - padding);
            const reqRight = Math.min(100, maxX + padding);
            if (leftPercent > reqLeft) leftPercent = reqLeft;
            if (leftPercent + widthPercent < reqRight) {
                 widthPercent = reqRight - leftPercent;
            }
            if (leftPercent + widthPercent > 100) widthPercent = 100 - leftPercent;

            const maxErrorPaperPos = Math.max(...errorsInSlice.map(e => e.meter - offsetMeters));
            const itemEndP = p + stepMeters;
            const gapMeters = gapPx / PIXELS_PER_METER; 
            if (maxErrorPaperPos > itemEndP - gapMeters) {
                 height += gapPx + 10;
            }
            const primaryErrorId = parseInt(errorsInSlice[0].id) || 999;
            imageIndex = 1000 + primaryErrorId;
        }

        items.push({
            id: `img-${p.toFixed(2)}`,
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

  // Icon Helper
  const getDefectIcon = (type: ErrorType) => {
    switch(type) {
        case ErrorType.SMEARS: return Icons.Smears;
        case ErrorType.BANDING: return Icons.Banding;
        case ErrorType.GRAIN: return Icons.Grain;
        case ErrorType.INK_DROP: return Icons.InkDrop;
        default: return Icons.Alert;
    }
  }

  return (
    <div className="relative h-full flex flex-col bg-slate-100 overflow-hidden w-full">
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative no-scrollbar w-full" 
        style={{ scrollBehavior: 'smooth' }}
      >
         <PrinterHeader />

         <div className="relative w-full flex justify-center pb-96 min-h-[1000px] bg-slate-200/50 -mt-32">
             <div 
               className="relative bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] z-10 overflow-hidden"
               style={{ 
                 height: `${totalHeight}px`, 
                 width: '86%',
                 maxWidth: 'none' 
               }}
             >
                <div className="absolute inset-0">
                    {printItems.map((item) => (
                        <div 
                          key={item.id}
                          className="absolute bg-gray-50 overflow-hidden shadow-sm transition-opacity hover:opacity-90"
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
                                className="w-full h-full object-cover brightness-[1.05] contrast-[1.02]"
                            />
                        </div>
                    ))}
                    
                    {/* Subtle Meter Markings */}
                    <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-start z-20 pointer-events-none">
                         {Array.from({ length: Math.ceil(totalMeters) }).map((_, i) => (
                           <div key={i} className="absolute flex items-center border-b border-hp-light/30 w-16" style={{ top: `${i * PIXELS_PER_METER}px` }}>
                              <span className="text-[10px] font-sans text-hp-light pl-1">{i}m</span>
                           </div>
                         ))}
                    </div>
                </div>

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

                {errors.map((error) => {
                  const topPos = error.meter * PIXELS_PER_METER;
                  const isDismissed = error.status === ErrorStatus.DISMISSED;
                  const isActive = activeErrorId === error.id;
                  const DefectIcon = getDefectIcon(error.type);
                  
                  let borderColor = 'border-hp-red';
                  if (error.severity === ErrorSeverity.MEDIUM) borderColor = 'border-hp-orange';
                  if (isDismissed) borderColor = 'border-hp-gray';

                  return (
                    <button
                      key={error.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onErrorClick(error);
                      }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-30 group outline-none
                        ${isActive ? 'scale-125 z-40' : 'hover:scale-110'}
                      `}
                      style={{ 
                        top: `${topPos}px`, 
                        left: `${error.xPosition}%` 
                      }}
                    >
                      {isActive && (
                          <div className="absolute inset-0 rounded-full ring-4 ring-hp-blue opacity-40 animate-pulse scale-150"></div>
                      )}
                      
                      {/* Defect Marker Circle */}
                      <div className={`
                         w-10 h-10 rounded-full border-2 ${borderColor} bg-white shadow-md
                         flex items-center justify-center
                         ${isDismissed ? 'opacity-70' : ''}
                      `}>
                         <DefectIcon className={`w-5 h-5 ${isDismissed ? 'text-hp-gray' : 'text-hp-dark'}`} />
                      </div>
                      
                      {/* Floating Label on Hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-hp-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         #{error.id} {error.type}
                      </div>
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