

import React, { useState } from 'react';
import { PrintError, ErrorSeverity, ErrorStatus, DefectOrigin, ErrorType } from '../types';
import { Icons } from './Icons';

interface DefectDetailsPanelProps {
  error: PrintError;
  onClose: () => void;
  onIgnore: (id: string, reason: string) => void;
  onRestore: (id: string) => void;
  onViewImage: (error: PrintError) => void;
  onReprint?: (id: string) => void;
  onLogMaintenance?: (id: string) => void;
}

const DefectDetailsPanel: React.FC<DefectDetailsPanelProps> = ({ 
    error, onClose, onIgnore, onRestore, onViewImage, onReprint, onLogMaintenance 
}) => {
  const [showIgnoreInput, setShowIgnoreInput] = useState(false);
  const [ignoreReason, setIgnoreReason] = useState('');

  const isDismissed = error.status === ErrorStatus.DISMISSED;
  const imageIndex = 1000 + parseInt(error.id);

  const handleMarkIgnoredSubmit = () => {
    if (ignoreReason.trim()) {
      onIgnore(error.id, ignoreReason);
      setShowIgnoreInput(false);
    }
  };

  const getSeverityBadge = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL: 
      case ErrorSeverity.HIGH: return 'bg-status-critical text-white';
      case ErrorSeverity.MEDIUM: return 'bg-status-medium text-white';
      case ErrorSeverity.LOW: return 'bg-status-low text-white';
      default: return 'bg-brand-muted text-white';
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-panel animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-brand-border bg-brand-bg/50">
        <button onClick={onClose} className="p-2 text-brand-body hover:bg-brand-border rounded-lg transition-colors flex items-center gap-1 text-sm font-medium">
          <Icons.ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="h-4 w-px bg-brand-border"></div>
        <h2 className="text-lg font-semibold text-brand-dark">
          Defect #{error.id}
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        
        {/* Top Section: Critical Info & Camera Feed */}
        <div className="flex gap-6">
            <div className="flex-1 space-y-4">
                <div>
                    <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-1">Error Type</span>
                    <h1 className="text-2xl font-bold text-brand-dark leading-tight">{error.type}</h1>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityBadge(error.severity)}`}>
                        {error.severity}
                    </span>
                    {error.deltaE && (
                         <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-bg border border-brand-border text-brand-body">
                             ΔE: {error.deltaE}
                         </span>
                    )}
                </div>
            </div>

            {/* Thumbnail */}
            <div className="relative w-[200px] h-[150px] bg-gray-100 rounded-lg overflow-hidden border border-brand-border shadow-sm group shrink-0">
                 <img 
                    src={`https://picsum.photos/400/300?random=${imageIndex}`} 
                    alt="Defect Thumbnail" 
                    className={`w-full h-full object-cover transition-opacity ${isDismissed ? 'opacity-50 grayscale' : ''}`}
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <button 
                        onClick={() => onViewImage(error)}
                        className="bg-white/90 text-brand-dark p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100"
                        title="View Full Image"
                      >
                         <Icons.Maximize className="w-5 h-5" />
                      </button>
                 </div>
                 {isDismissed && (
                     <div className="absolute top-2 right-2 bg-brand-muted text-white text-[10px] px-2 py-0.5 rounded">IGNORED</div>
                 )}
            </div>
        </div>

        <div className="h-px w-full bg-brand-border"></div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
             <div>
                <label className="text-xs text-brand-muted font-medium block mb-1">Detected At</label>
                <div className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                    <Icons.Activity className="w-4 h-4 text-brand-secondary" />
                    {error.timestamp}
                </div>
             </div>
             <div>
                <label className="text-xs text-brand-muted font-medium block mb-1">Position</label>
                <div className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                    <Icons.ArrowUp className="w-4 h-4 text-brand-secondary" />
                    {error.meter}m
                </div>
             </div>
             <div>
                <label className="text-xs text-brand-muted font-medium block mb-1">Origin</label>
                <div className="text-sm font-semibold text-brand-dark flex items-center gap-2">
                    {error.origin === DefectOrigin.FILE ? <Icons.FileDefect className="w-4 h-4 text-brand-primary" /> : <Icons.Printer className="w-4 h-4 text-brand-primary" />}
                    {error.origin}
                </div>
             </div>
             {error.wasteAmount && (
                <div>
                    <label className="text-xs text-brand-muted font-medium block mb-1">Est. Waste</label>
                    <div className="text-sm font-semibold text-status-critical flex items-center gap-2">
                        <Icons.Alert className="w-4 h-4" />
                        {error.wasteAmount}m
                    </div>
                </div>
             )}
        </div>
        
        {/* RIP Data Integration */}
        {error.deltaE && (
            <div className="bg-brand-bg rounded-lg p-4 border border-brand-border">
                <h3 className="text-sm font-semibold text-brand-dark mb-3 flex items-center gap-2">
                    <Icons.Palette className="w-4 h-4 text-brand-secondary" />
                    RIP / Color Data
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-brand-muted">Target Profile:</div>
                    <div className="font-mono text-brand-body">Coated_Fogra39</div>
                    <div className="text-brand-muted">Measured ΔE:</div>
                    <div className="font-mono text-status-critical font-bold">{error.deltaE}</div>
                    <div className="text-brand-muted">Tolerance:</div>
                    <div className="font-mono text-brand-body">2.0</div>
                </div>
            </div>
        )}

        {/* Root Cause Analysis */}
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-brand-dark">Root Cause Analysis</h3>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <span className="text-xs font-bold text-status-medium block mb-2 uppercase tracking-wide">Probable Causes</span>
                <ul className="list-disc list-inside text-sm text-brand-body space-y-1">
                    {error.probableCauses?.map((cause, i) => <li key={i}>{cause}</li>)}
                </ul>
            </div>
            {error.correctiveActions && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-xs font-bold text-status-low block mb-2 uppercase tracking-wide">Recommended Actions</span>
                    <ul className="list-disc list-inside text-sm text-brand-body space-y-1">
                        {error.correctiveActions?.map((action, i) => <li key={i}>{action}</li>)}
                    </ul>
                </div>
            )}
        </div>

      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-brand-border bg-brand-bg/30">
         {showIgnoreInput ? (
           <div className="space-y-3">
              <label className="text-xs font-semibold text-brand-dark">Reason for ignoring</label>
              <input 
                 type="text" 
                 className="w-full border border-brand-border rounded-md p-2 text-sm focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none"
                 placeholder="e.g. Test print..."
                 value={ignoreReason}
                 onChange={(e) => setIgnoreReason(e.target.value)}
                 autoFocus
              />
              <div className="flex gap-2">
                 <button onClick={() => setShowIgnoreInput(false)} className="flex-1 py-2 text-sm font-medium text-brand-muted hover:bg-gray-100 rounded">Cancel</button>
                 <button onClick={handleMarkIgnoredSubmit} className="flex-1 py-2 bg-brand-secondary text-white rounded text-sm font-semibold hover:bg-blue-600">Confirm</button>
              </div>
           </div>
         ) : (
           <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                  {isDismissed ? (
                    <button 
                        onClick={() => onRestore(error.id)}
                        className="flex-1 py-2.5 bg-gray-300 text-brand-dark font-medium rounded hover:bg-gray-400 transition-colors text-sm"
                    >
                        Restore Error
                    </button>
                  ) : (
                    <button 
                        onClick={() => setShowIgnoreInput(true)}
                        className="flex-1 py-2.5 bg-[#CBD5E0] text-brand-dark font-medium rounded hover:bg-[#A0AEC0] transition-colors text-sm"
                    >
                        Ignore Error
                    </button>
                  )}
                  
                  {error.severity === ErrorSeverity.CRITICAL && (
                      <button className="flex-1 py-2.5 bg-brand-primary text-white font-medium rounded hover:bg-red-700 transition-colors text-sm shadow-sm flex items-center justify-center gap-2">
                          <Icons.Stop className="w-4 h-4" />
                          Stop Printer
                      </button>
                  )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onReprint) onReprint(error.id);
                    }}
                    className="py-2 border border-brand-border text-brand-body rounded hover:bg-white text-sm font-medium transition-colors"
                 >
                     Mark for Reprint
                 </button>
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onLogMaintenance) onLogMaintenance(error.id);
                    }}
                    className="py-2 border border-brand-border text-brand-body rounded hover:bg-white text-sm font-medium transition-colors"
                 >
                     Log Maintenance
                 </button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default DefectDetailsPanel;