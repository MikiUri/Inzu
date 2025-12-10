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
        case ErrorSeverity.CRITICAL: return 'bg-status-error text-white';
        case ErrorSeverity.HIGH: return 'bg-red-100 text-status-error';
        case ErrorSeverity.MEDIUM: return 'bg-status-warning/20 text-status-warning';
        default: return 'bg-brand-lightGray text-brand-dark';
    }
  };

  const imageIndex = 1000 + parseInt(error.id);

  return (
    <div 
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border transition-all duration-200 mb-4 bg-white
        ${isSelected ? 'border-brand-blue ring-1 ring-brand-blue shadow-md' : 'border-brand-lightGray hover:border-gray-300'}
      `}
    >
      {/* Header Row */}
      <div className="flex justify-between items-start mb-3">
         <div className="flex items-start gap-3">
             <button 
                onClick={(e) => { e.stopPropagation(); onToggleCheck(); }}
                className="mt-1 text-brand-gray hover:text-brand-blue"
             >
                {isChecked ? <Icons.Checkbox className="w-5 h-5 text-brand-blue" /> : <Icons.Square className="w-5 h-5" />}
             </button>
             <div>
                 <h2 className="text-h2 text-brand-dark mb-1">{error.type}</h2>
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getSeverityStyle(error.severity)}`}>
                    {error.severity}
                 </span>
             </div>
         </div>
         <span className="text-label text-brand-gray font-mono">{error.timestamp}</span>
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
             <Icons.Maximize className="text-white opacity-0 group-hover:opacity-100 w-6 h-6 drop-shadow-md" />
         </div>
      </div>

      {/* Details Row */}
      <div className="flex justify-between items-center mb-4 px-1">
         <div className="text-label text-brand-gray">
            Loc: <span className="text-brand-dark font-medium">{error.meter}m</span>
         </div>
         {error.wasteCost && (
            <div className="text-label text-brand-gray">
               Cost: <span className="text-status-error font-medium">€{error.wasteCost.toFixed(2)}</span>
            </div>
         )}
      </div>

      {/* Actions Row */}
      <div className="flex gap-3 border-t border-brand-lightGray pt-3">
         <button 
            onClick={(e) => { e.stopPropagation(); onIgnore(); }}
            className="flex-1 py-2 rounded border border-brand-blue text-brand-blue text-label font-medium hover:bg-blue-50 transition-colors"
         >
            Ignore
         </button>
         <button 
             onClick={(e) => { e.stopPropagation(); onReport(); }}
             className="flex-1 py-2 rounded bg-brand-blue text-white text-label font-medium hover:bg-blue-600 transition-colors shadow-sm"
         >
             Report
         </button>
      </div>
    </div>
  );
};

export default ErrorCard;