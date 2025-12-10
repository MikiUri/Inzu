import React from 'react';
import { PrintError, ErrorStatus } from '../types';

interface TimelineRailProps {
  errors: PrintError[];
  currentScrollMeter: number;
  onDotClick: (error: PrintError) => void;
  totalMeters: number;
  selectedErrorId: string | null;
}

const TimelineRail: React.FC<TimelineRailProps> = ({ errors, currentScrollMeter, onDotClick, totalMeters, selectedErrorId }) => {
  return (
    <div className="w-12 bg-white border-l border-brand-lightGray relative h-full flex-shrink-0 select-none z-30 flex flex-col items-center">
      
      {/* Time Markers Background */}
      <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
         {Array.from({length: 10}).map((_, i) => (
             <div key={i} className="w-full border-t border-brand-lightGray/50 h-px relative">
                 <span className="absolute right-1 -top-2 text-[8px] text-brand-gray">{(i * 5)}m</span>
             </div>
         ))}
      </div>

      {/* Current View Indicator Line */}
      <div 
        className="absolute w-full h-1 bg-brand-blue z-20 shadow-sm"
        style={{ top: `${(currentScrollMeter / totalMeters) * 100}%` }}
      ></div>

      {/* Error Markers */}
      {errors.map((error) => {
        if (error.status === ErrorStatus.DISMISSED) return null;

        const topPercent = (error.meter / totalMeters) * 100;
        const isActive = selectedErrorId === error.id;
        
        return (
          <button
            key={error.id}
            onClick={() => onDotClick(error)}
            className={`
                absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30
                rounded-full transition-transform
                ${isActive ? 'w-4 h-4 bg-brand-blue ring-2 ring-blue-200' : 'w-2 h-2 bg-status-error hover:scale-150'}
            `}
            style={{ top: `${topPercent}%` }}
          />
        );
      })}
    </div>
  );
};

export default TimelineRail;