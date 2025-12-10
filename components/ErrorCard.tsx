
import React from 'react';
import { PrintError, ErrorSeverity } from '../types';
import { Icons } from './Icons';

interface ErrorCardProps {
  error: PrintError;
  isSelected: boolean;
  isChecked: boolean;
  onToggleCheck: () => void;
  onClick: () => void;
  onIgnore: () => void;
  onReport: () => void;
  onImageClick: () => void;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ 
  error, isSelected, isChecked, onToggleCheck, onClick, onIgnore, onReport, onImageClick 
}) => {
  
  const getSeverityStyle = (s: ErrorSeverity) => {
    switch(s) {
        case ErrorSeverity.CRITICAL: return 'bg-status-critical text-white';
        case ErrorSeverity.HIGH: return 'bg-red-100 text-status-critical';
        case ErrorSeverity.MEDIUM: return 'bg-orange-100 text-status-medium';
        default: return 'bg-brand-bg text-brand-dark';
    }
  };

  const imageIndex = 1000 + parseInt(error.id);

  return (
    <div 
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border transition-all duration-200 mb-4 bg-white cursor-pointer
        ${isSelected ? 'border-brand-secondary ring-1 ring-brand-secondary shadow-md' : 'border-brand-border hover:border-gray-300'}
      `}
    >
      {/* Header Row */}
      <div className="flex justify-between items-start mb-3">
         <div className="flex items-start gap-3">
             <button 
                onClick={(e) => { e.stopPropagation(); onToggleCheck(); }}
                className="mt-1 text-brand-muted hover:text-brand-secondary"
             >
                {isChecked ? <Icons.Checkbox className="w-5 h-5 text-brand-secondary" /> : <Icons.Square className="w-5 h-5" />}
             </button>
             <div>
                 <h2 className="text-base font-semibold text-brand-dark mb-1">{error.type}</h2>
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getSeverityStyle(error.severity)}`}>
                    {error.severity}
                 </span>
             </div>
         </div>
         <span className="text-xs font-mono text-brand-muted">{error.timestamp}</span>
      </div>

      {/* Main Content: Large Image */}
      <div 
        onClick={(e) => { e.stopPropagation(); onImageClick(); }}
        className="w-full h-32 bg-gray-100 rounded-md overflow-hidden mb-3 cursor-zoom-in relative group"
      >
         <img 
            src={`https://picsum.photos/600/400?random=${imageIndex}`}
            alt="Defect"
            className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
             <Icons.Maximize className="text-white opacity-0 group-hover:opacity-100 w-6 h-6 drop-shadow-md transition-opacity" />
         </div>
      </div>

      {/* Details Row */}
      <div className="flex justify-between items-center mb-4 px-1">
         <div className="text-xs text-brand-muted">
            Loc: <span className="text-brand-dark font-medium">{error.meter}m</span>
         </div>
         {error.wasteCost && (
            <div className="text-xs text-brand-muted">
               Cost: <span className="text-status-critical font-medium">€{error.wasteCost.toFixed(2)}</span>
            </div>
         )}
      </div>

      {/* Actions Row - Ensure visibility */}
      <div className="flex gap-3 border-t border-brand-border pt-3">
         <button 
            onClick={(e) => { e.stopPropagation(); onIgnore(); }}
            className="flex-1 py-2 rounded border border-brand-secondary text-brand-secondary text-xs font-bold hover:bg-blue-50 transition-colors opacity-100"
         >
            Ignore
         </button>
         <button 
             onClick={(e) => { e.stopPropagation(); onReport(); }}
             className="flex-1 py-2 rounded bg-brand-secondary text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm opacity-100"
         >
             Report
         </button>
      </div>
    </div>
  );
};

export default ErrorCard;
