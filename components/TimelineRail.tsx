import React from 'react';
import { PrintError, ErrorSeverity, ErrorStatus } from '../types';

interface TimelineRailProps {
  errors: PrintError[];
  currentScrollMeter: number;
  onDotClick: (error: PrintError) => void;
  totalMeters: number;
}

const TimelineRail: React.FC<TimelineRailProps> = ({ errors, currentScrollMeter, onDotClick, totalMeters }) => {
  return (
    <div className="w-16 bg-gray-50 border-r border-l border-gray-200 relative h-full flex-shrink-0 select-none z-50">
      {/* Track Line */}
      <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-gray-300 transform -translate-x-1/2 rounded-full"></div>

      {/* Current View Indicator (Pill) */}
      <div 
        className="absolute left-1/2 w-2 h-8 bg-slate-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 z-10 shadow-lg"
        style={{ 
          top: `${(currentScrollMeter / totalMeters) * 100}%` 
        }}
      ></div>

      {/* Error Markers */}
      {errors.map((error) => {
        const topPercent = (error.meter / totalMeters) * 100;
        const isDismissed = error.status === ErrorStatus.DISMISSED;
        const isHigh = error.severity === ErrorSeverity.HIGH;
        
        let bgClass = isDismissed ? 'bg-gray-400' : 'bg-orange-500';
        if (!isDismissed && isHigh) bgClass = 'bg-red-600';

        return (
          <button
            key={error.id}
            onClick={() => onDotClick(error)}
            className={`
                absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 
                flex items-center justify-center
                w-7 h-7 rounded-full border-2 border-white shadow-md transition-transform hover:scale-125
                ${bgClass}
            `}
            style={{ top: `${topPercent}%` }}
            title={`Go to Error #${error.id}`}
          >
             <span className="text-[10px] font-bold text-white leading-none mt-0.5">
                {error.id}
             </span>
          </button>
        );
      })}
    </div>
  );
};

export default TimelineRail;