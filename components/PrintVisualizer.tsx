import React, { useMemo } from 'react';
import { PrintError, ErrorStatus, ErrorType } from '../types';
import { PIXELS_PER_METER } from '../constants';
import { Icons } from './Icons';

interface PrintVisualizerProps {
  errors: PrintError[];
  onSelectError: (error: PrintError) => void;
  selectedErrorId: string | null;
  offsetMeters: number;
  totalMeters: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  selectedErrorIds: string[]; // Bulk select
}

const PrintVisualizer: React.FC<PrintVisualizerProps> = ({ 
  errors, 
  onSelectError, 
  selectedErrorId,
  offsetMeters,
  totalMeters,
  scrollRef,
  selectedErrorIds
}) => {
  const totalHeight = totalMeters * PIXELS_PER_METER;
  
  // deterministic random helper
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generate "Print Nests" (Simulated Image Boundaries)
  const nests = useMemo(() => {
    const items = [];
    const stepMeters = 1.6;
    const startP = Math.floor(-offsetMeters / stepMeters) * stepMeters - stepMeters;
    const endP = Math.ceil((totalMeters - offsetMeters) / stepMeters) * stepMeters + stepMeters;

    for (let p = startP; p < endP; p += stepMeters) {
        const yMeters = p + offsetMeters;
        const top = yMeters * PIXELS_PER_METER;
        if (top < -500 || top > totalHeight + 500) continue;

        const seed = Math.round(p * 137); 
        let widthPercent = 60 + Math.floor(seededRandom(seed + 1) * 30);
        let leftPercent = 5 + seededRandom(seed + 2) * (90 - widthPercent);
        let imageIndex = Math.abs(Math.floor(p));

        // Ensure errors have a nest under them
        const errorsInSlice = errors.filter(e => {
            const paperPos = e.meter - offsetMeters;
            return paperPos >= p && paperPos < p + stepMeters;
        });

        if (errorsInSlice.length > 0) {
            imageIndex = 1000 + parseInt(errorsInSlice[0].id);
            // Adjust nest to cover error x position
            const errorX = errorsInSlice[0].xPosition;
            if (errorX < leftPercent) leftPercent = Math.max(0, errorX - 10);
            if (errorX > leftPercent + widthPercent) widthPercent = Math.min(100 - leftPercent, (errorX - leftPercent) + 20);
        }

        items.push({
            id: `nest-${p}`,
            top,
            height: stepMeters * PIXELS_PER_METER - 20,
            widthPercent,
            leftPercent,
            imageIndex
        });
    }
    return items;
  }, [offsetMeters, totalMeters, errors]);

  return (
    <div className="flex-1 relative bg-brand-lightGray/50 overflow-hidden flex flex-col">
       <div 
         ref={scrollRef}
         className="flex-1 overflow-y-auto relative no-scrollbar"
       >
         {/* Paper Background */}
         <div className="relative w-full min-h-full flex justify-center py-20">
             <div 
               className="bg-white shadow-lg relative"
               style={{ height: `${totalHeight}px`, width: '90%' }}
             >
                {/* Print Nests */}
                {nests.map(nest => (
                    <div
                        key={nest.id}
                        className="absolute border border-brand-lightGray bg-gray-50 overflow-hidden"
                        style={{
                            top: `${nest.top}px`,
                            height: `${nest.height}px`,
                            left: `${nest.leftPercent}%`,
                            width: `${nest.widthPercent}%`
                        }}
                    >
                        <img 
                            src={`https://picsum.photos/600/400?random=${nest.imageIndex}`}
                            alt="Print Content"
                            className="w-full h-full object-cover opacity-90 grayscale-[0.2]"
                        />
                    </div>
                ))}

                {/* Errors Overlay */}
                {errors.map(error => {
                    const topPx = error.meter * PIXELS_PER_METER;
                    const isActive = selectedErrorId === error.id;
                    const isSelectedInBulk = selectedErrorIds.includes(error.id);
                    const isDismissed = error.status === ErrorStatus.DISMISSED;
                    
                    if (isDismissed && !isActive) return null; // Hide dismissed unless selected

                    return (
                        <div
                            key={error.id}
                            onClick={(e) => { e.stopPropagation(); onSelectError(error); }}
                            className={`
                                absolute transition-all duration-200 cursor-pointer group flex items-center justify-center
                                ${isActive ? 'z-50' : 'z-30 hover:z-40'}
                            `}
                            style={{
                                top: `${topPx}px`,
                                left: `${error.xPosition}%`,
                                width: '120px', 
                                height: '80px',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {/* The Red Box Overlay */}
                            <div className={`
                                absolute inset-0 
                                bg-status-error/60 border-2 border-status-error
                                ${isActive || isSelectedInBulk ? 'ring-4 ring-brand-blue/30 scale-105' : 'hover:scale-105'}
                            `}></div>

                            {/* Center Icon */}
                            <Icons.Alert className="relative text-white w-8 h-8 drop-shadow-md" />
                            
                            {/* Tooltip Label */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                                {error.type}
                            </div>
                        </div>
                    );
                })}
             </div>
         </div>
       </div>
    </div>
  );
};

export default PrintVisualizer;