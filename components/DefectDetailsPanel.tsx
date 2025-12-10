import React, { useState } from 'react';
import { PrintError, ErrorSeverity, ErrorStatus, DefectOrigin, ErrorType } from '../types';
import { Icons } from './Icons';

interface DefectDetailsPanelProps {
  error: PrintError;
  onClose: () => void;
  onIgnore: (id: string, reason: string) => void;
  onRestore: (id: string) => void;
}

const DefectDetailsPanel: React.FC<DefectDetailsPanelProps> = ({ error, onClose, onIgnore, onRestore }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showIgnoreInput, setShowIgnoreInput] = useState(false);
  const [ignoreReason, setIgnoreReason] = useState('');
  const [showRootCause, setShowRootCause] = useState(false);

  const isDismissed = error.status === ErrorStatus.DISMISSED;
  const imageIndex = 1000 + parseInt(error.id);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));

  const handleMarkIgnoredSubmit = () => {
    if (ignoreReason.trim()) {
      onIgnore(error.id, ignoreReason);
      setShowIgnoreInput(false);
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.HIGH: return 'bg-hp-red text-white';
      case ErrorSeverity.MEDIUM: return 'bg-hp-orange text-white';
      default: return 'bg-hp-light text-hp-dark';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-[20px] font-semibold text-hp-dark">
          Defect Details: {error.type}
        </h2>
        <button onClick={onClose} className="p-2 text-hp-gray hover:bg-gray-100 rounded-full">
          <Icons.Close className="w-6 h-6" />
        </button>
      </div>

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        
        {/* Camera Feed */}
        <div className="relative w-full h-[240px] bg-gray-100 overflow-hidden border-b border-gray-200">
          <div 
            className="w-full h-full transition-transform duration-300 ease-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
             <img 
                src={`https://picsum.photos/800/600?random=${imageIndex}`} 
                alt="Defect" 
                className={`w-full h-full object-cover ${isDismissed ? 'grayscale opacity-75' : ''}`}
             />
             
             {/* Defect Marker (No box, just circle) */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 border-2 border-hp-red rounded-full shadow-[0_0_15px_rgba(224,36,36,0.6)]"></div>
             </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button onClick={handleZoomIn} className="p-2 bg-white shadow-md rounded-full text-hp-dark hover:bg-gray-50">
              <Icons.ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={handleZoomOut} className="p-2 bg-white shadow-md rounded-full text-hp-dark hover:bg-gray-50">
              <Icons.ZoomOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 space-y-6">
          
          {/* Severity & Origin Tags */}
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getSeverityColor(error.severity)}`}>
              {error.severity}
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-hp-gray flex items-center gap-1`}>
               {error.origin === DefectOrigin.FILE ? <Icons.FileDefect className="w-3 h-3"/> : <Icons.Printer className="w-3 h-3"/>}
               Origin: {error.origin}
            </span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-6">
             <div>
               <label className="block text-[12px] text-hp-gray mb-1">Time Detected</label>
               <span className="text-[13px] font-semibold text-hp-dark">{error.timestamp}</span>
             </div>
             <div>
               <label className="block text-[12px] text-hp-gray mb-1">Position</label>
               <span className="text-[13px] font-semibold text-hp-dark">{error.meter}m</span>
             </div>
             {error.deltaE && (
               <div>
                 <label className="block text-[12px] text-hp-gray mb-1">Delta E (Color)</label>
                 <span className={`text-[13px] font-semibold ${error.deltaE > 2 ? 'text-hp-orange' : 'text-hp-green'}`}>
                    {error.deltaE}
                 </span>
               </div>
             )}
             {error.wasteMeters !== undefined && (
               <div>
                 <label className="block text-[12px] text-hp-gray mb-1">Est. Waste</label>
                 <span className="text-[13px] font-semibold text-hp-dark">{error.wasteMeters}m</span>
               </div>
             )}
          </div>

          {/* Automation Status */}
          {error.autoMarked && (
             <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
               <Icons.Cut className="w-4 h-4 text-hp-blue" />
               <span className="text-[12px] font-medium text-hp-blue">Cut mark inserted automatically</span>
             </div>
          )}

          {/* Dismissed Reason */}
          {isDismissed && error.ignoreReason && (
             <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
               <label className="block text-[10px] uppercase font-bold text-hp-gray mb-1">Ignored Reason</label>
               <p className="text-[13px] text-hp-dark italic">"{error.ignoreReason}"</p>
             </div>
          )}

          {/* Root Cause Analysis (Expandable) */}
          <div className="border-t border-gray-100 pt-4">
             <button 
                onClick={() => setShowRootCause(!showRootCause)}
                className="flex items-center justify-between w-full text-left"
             >
                <span className="text-[14px] font-semibold text-hp-dark">Root Cause Analysis</span>
                <Icons.ArrowRight className={`w-4 h-4 text-hp-gray transition-transform ${showRootCause ? 'rotate-90' : ''}`} />
             </button>
             
             {showRootCause && (
               <div className="mt-3 space-y-3 animate-in slide-in-from-top-2">
                  <div className="p-3 bg-orange-50 rounded border border-orange-100">
                    <span className="text-[11px] font-bold text-hp-orange block mb-1">PROBABLE CAUSES</span>
                    <ul className="list-disc list-inside text-[12px] text-hp-dark space-y-1">
                      {error.probableCauses?.map((cause, i) => <li key={i}>{cause}</li>)}
                    </ul>
                  </div>
                  {error.correctiveActions && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-100">
                      <span className="text-[11px] font-bold text-hp-blue block mb-1">RECOMMENDED ACTIONS</span>
                      <ul className="list-disc list-inside text-[12px] text-hp-dark space-y-1">
                        {error.correctiveActions?.map((action, i) => <li key={i}>{action}</li>)}
                      </ul>
                    </div>
                  )}
               </div>
             )}
          </div>

        </div>
      </div>

      {/* 3. Footer Actions */}
      <div className="p-6 border-t border-gray-100 bg-gray-50">
         {showIgnoreInput ? (
           <div className="space-y-3">
              <label className="text-[12px] font-medium text-hp-dark">Reason for ignoring:</label>
              <input 
                 type="text" 
                 className="w-full border border-gray-300 rounded p-2 text-[13px] focus:border-hp-blue focus:outline-none"
                 placeholder="e.g. Test print, False positive..."
                 value={ignoreReason}
                 onChange={(e) => setIgnoreReason(e.target.value)}
                 autoFocus
              />
              <div className="flex gap-2">
                 <button onClick={() => setShowIgnoreInput(false)} className="flex-1 py-2 text-[13px] text-hp-gray font-medium">Cancel</button>
                 <button onClick={handleMarkIgnoredSubmit} className="flex-1 py-2 bg-hp-blue text-white rounded text-[13px] font-semibold">Confirm</button>
              </div>
           </div>
         ) : (
           <div className="flex gap-4">
              {isDismissed ? (
                <button 
                  onClick={() => onRestore(error.id)}
                  className="flex-1 py-3 border border-hp-blue text-hp-blue font-semibold rounded text-[13px] hover:bg-blue-50 transition-colors"
                >
                  RESTORE
                </button>
              ) : (
                <button 
                  onClick={() => setShowIgnoreInput(true)}
                  className="flex-1 py-3 border border-hp-blue text-hp-blue font-semibold rounded text-[13px] hover:bg-blue-50 transition-colors"
                >
                  MARK IGNORED
                </button>
              )}
              
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-hp-blue text-white font-semibold rounded text-[13px] hover:bg-blue-600 transition-colors shadow-sm"
              >
                CLOSE
              </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default DefectDetailsPanel;