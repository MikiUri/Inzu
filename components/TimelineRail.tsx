
import React from 'react';
import { PrintError, ErrorStatus, ErrorSeverity } from '../types';

interface TimelineRailProps {
  errors: PrintError[];
  currentScrollMeter: number;
  onDotClick: (error: PrintError) => void;
  totalMeters: number;
  selectedErrorId: string | null;
}

const TimelineRail: React.FC<TimelineRailProps> = ({ errors, currentScrollMeter, onDotClick, totalMeters, selectedErrorId }) => {
  
  const getMarkerColor = (severity: ErrorSeverity) => {
    switch(severity) {
        case ErrorSeverity.CRITICAL: return 'bg-status-critical';
        case ErrorSeverity.HIGH: return 'bg-status-high';
        case ErrorSeverity.MEDIUM: return 'bg-status-medium';
        case ErrorSeverity.LOW: return 'bg-status-low';
        default: return 'bg-brand-muted';
    }
  };

  return (
    <div className="w-16 bg-white border-l border-brand-border relative h-full flex-shrink-0 select-none z-30 flex flex-col items-center shadow-inner">
      
      {/* Time Markers Background */}
      <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
         {Array.from({length: 20}).map((_, i) => (
             <div key={i} className="w-full flex justify-end pr-2 h-px relative">
                 <div className="w-2 h-px bg-brand-border absolute right-0 top-0"></div>
                 <span className="text-[10px] font-mono text-brand-muted relative -top-2">{(i * (totalMeters/20)).toFixed(0)}m</span>
             </div>
         ))}
      </div>

      {/* Current View Indicator Line */}
      <div 
        className="absolute w-full h-1 bg-brand-secondary z-20 shadow-sm transition-all duration-300 ease-out"
        style={{ top: `${(currentScrollMeter / totalMeters) * 100}%` }}
      >
        <div className="absolute right-full mr-1 -top-1.5 bg-brand-secondary text-white text-[10px] px-1 rounded">
            {currentScrollMeter.toFixed(1)}m
        </div>
      </div>

      {/* Error Markers */}
      {errors.map((error) => {
        if (error.status === ErrorStatus.DISMISSED && selectedErrorId !== error.id) return null;

        const topPercent = (error.meter / totalMeters) * 100;
        const isActive = selectedErrorId === error.id;
        
        return (
          <button
            key={error.id}
            onClick={() => onDotClick(error)}
            className={`
                absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30
                rounded-full transition-all duration-200 group
                ${isActive ? 'w-5 h-5 ring-2 ring-brand-primary ring-offset-2' : 'w-3 h-3 hover:scale-150'}
                ${getMarkerColor(error.severity)}
                ${error.status === ErrorStatus.DISMISSED ? 'opacity-40' : 'opacity-100'}
            `}
            style={{ top: `${topPercent}%` }}
          >
             {/* Tooltip */}
             <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-brand-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-40">
                 {error.type}
             </div>
          </button>
        );
      })}
    </div>
  );
};

export default TimelineRail;
