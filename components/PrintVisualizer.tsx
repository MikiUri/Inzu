
import React, { useMemo } from 'react';
import { PrintError, ErrorStatus, ErrorType, ErrorSeverity } from '../types';
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

  const getDefectIcon = (type: ErrorType) => {
    switch(type) {
        case ErrorType.BANDING: return Icons.Banding;
        case ErrorType.SMEARS: return Icons.Smears;
        case ErrorType.GRAIN: return Icons.Grain;
        case ErrorType.INK_DROP: return Icons.InkDrop;
        case ErrorType.SCRATCH: 
        case ErrorType.HEAD_STRIKE:
            return Icons.Scratch;
        case ErrorType.MISREGISTRATION:
        case ErrorType.REGISTRATION:
            return Icons.Misregistration;
        case ErrorType.NOZZLE_DROPOUT: return Icons.Nozzle;
        case ErrorType.INK_ADHESION: return Icons.Adhesion;
        case ErrorType.MEDIA_CREASE: return Icons.Crease;
        case ErrorType.GRADIENT_STEPPING: return Icons.Color;
        default: return Icons.Alert;
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
      switch(severity) {
          case ErrorSeverity.CRITICAL: return 'text-status-critical bg-red-100 border-status-critical';
          case ErrorSeverity.HIGH: return 'text-status-high bg-red-50 border-status-high';
          case ErrorSeverity.MEDIUM: return 'text-status-medium bg-orange-50 border-status-medium';
          case ErrorSeverity.LOW: return 'text-status-low bg-blue-50 border-status-low';
          default: return 'text-brand-dark bg-gray-50 border-brand-border';
      }
  };

  const getSeverityFill = (severity: ErrorSeverity) => {
    switch(severity) {
        case ErrorSeverity.CRITICAL: return '#E53E3E';
        case ErrorSeverity.HIGH: return '#E53E3E';
        case ErrorSeverity.MEDIUM: return '#DD6B20';
        case ErrorSeverity.LOW: return '#3182CE';
        default: return '#718096';
    }
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
    <div className="flex-1 relative bg-brand-bg overflow-hidden flex flex-col">
       <div 
         ref={scrollRef}
         className="flex-1 overflow-y-auto relative no-scrollbar"
       >
         {/* Paper Background */}
         <div className="relative w-full min-h-full flex justify-center py-20">
             <div 
               className="bg-white shadow-xl relative border-x border-brand-border"
               style={{ height: `${totalHeight}px`, width: '92%' }}
             >
                {/* Print Nests */}
                {nests.map(nest => (
                    <div
                        key={nest.id}
                        className="absolute bg-gray-50 overflow-hidden shadow-sm transition-opacity hover:opacity-100 opacity-90"
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
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}

                {/* Errors Overlay */}
                {errors.map(error => {
                    const topPx = error.meter * PIXELS_PER_METER;
                    const isActive = selectedErrorId === error.id;
                    const isSelectedInBulk = selectedErrorIds.includes(error.id);
                    const isDismissed = error.status === ErrorStatus.DISMISSED;
                    const DefectIcon = getDefectIcon(error.type);
                    const severityFill = getSeverityFill(error.severity);
                    
                    if (isDismissed && !isActive && !isSelectedInBulk) return null;

                    return (
                        <div
                            key={error.id}
                            onClick={(e) => { e.stopPropagation(); onSelectError(error); }}
                            className={`
                                absolute transition-all duration-200 cursor-pointer group flex items-center justify-center
                                ${isActive ? 'z-50' : 'z-30 hover:z-40'}
                                ${isDismissed ? 'opacity-50 grayscale' : ''}
                            `}
                            style={{
                                top: `${topPx}px`,
                                left: `${error.xPosition}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div className={`
                                relative p-2 rounded-full bg-white shadow-md border-2
                                ${isActive ? 'scale-125 border-brand-primary' : 'hover:scale-110 border-white'}
                            `}>
                                <DefectIcon size={24} color={severityFill} />
                                {isActive && (
                                    <div className="absolute inset-0 rounded-full ring-4 ring-brand-primary/30 animate-pulse"></div>
                                )}
                            </div>

                            {/* Tooltip Label */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-xs px-3 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity flex flex-col items-center">
                                <span className="font-semibold">{error.type}</span>
                                <span className="text-[10px] opacity-80">{error.severity}</span>
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
