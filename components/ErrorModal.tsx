import React, { useState } from 'react';
import { PrintError, ErrorSeverity, ErrorStatus } from '../types';
import { Icons } from './Icons';

interface ErrorModalProps {
  error: PrintError;
  onClose: () => void;
  onToggleIgnore: () => void;
  position: { x: number; y: number } | null;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose, onToggleIgnore, position }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!position) return null;

  const isHigh = error.severity === ErrorSeverity.HIGH;
  const isDismissed = error.status === ErrorStatus.DISMISSED;
  // Use the same deterministic seed logic as VirtualRoll to ensure the image matches
  const imageIndex = 1000 + parseInt(error.id);

  // Full Screen View
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center animate-in fade-in duration-200">
         <button 
            onClick={() => setIsFullScreen(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
         >
             <Icons.Close className="w-8 h-8" />
         </button>

         <div className="relative w-full h-full p-4 flex items-center justify-center">
             <img 
                src={`https://picsum.photos/800/600?random=${imageIndex}`} 
                alt="Error Fullscreen" 
                className="max-w-full max-h-full object-contain shadow-2xl"
             />
             
             {/* Red Circle Defect Marker (Centered relative to screen for simplicity, or relative to image if wrapper was tighter) */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                 <div className="w-32 h-32 border-4 border-red-500 rounded-full shadow-[0_0_50px_rgba(239,68,68,0.8)] animate-pulse"></div>
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded shadow-lg whitespace-nowrap">
                    DEFECT #{error.id}
                 </div>
             </div>
         </div>
      </div>
    );
  }

  // Normal Modal View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
        {/* Click outside to close */}
        <div className="absolute inset-0" onClick={onClose}></div>

        <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    {isHigh && <Icons.Alert className="w-5 h-5 text-red-500" />}
                    <h2 className={`text-lg font-bold uppercase tracking-wide ${isDismissed ? 'text-gray-400' : 'text-gray-900'}`}>
                        {error.type} {isDismissed ? '(IGNORED)' : 'DETECTED'}
                    </h2>
                </div>
                <button 
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                    <Icons.Cancel className="w-6 h-6" />
                </button>
            </div>

            {/* Image Content (Simulated real photo with zoom) */}
            <div className="relative h-64 bg-gray-100 group overflow-hidden border-b border-gray-200">
                {/* Zoomed Image */}
                <img 
                    src={`https://picsum.photos/800/600?random=${imageIndex}`} 
                    alt="Error detail" 
                    className={`w-full h-full object-cover transform scale-125 transition-all duration-700 ${isDismissed ? 'grayscale opacity-75' : ''}`}
                />
                
                {/* Visual indicator of where the error is on the image (The Red Circle) */}
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none transition-opacity ${isDismissed ? 'opacity-30' : 'opacity-100'}`}>
                     <div className="w-20 h-20 border-4 border-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse"></div>
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                        DEFECT FOUND
                     </div>
                </div>

                {/* Zoom Icon Button */}
                <button 
                    onClick={() => setIsFullScreen(true)}
                    className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-20 shadow-lg"
                    title="View Full Screen"
                >
                    <Icons.ZoomIn className="w-5 h-5" />
                </button>

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">
                    Cam 02 - High Res
                </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="block text-xs text-gray-500 uppercase font-semibold">Time Detected</span>
                        <span className="font-mono text-lg font-bold text-slate-700">{error.timestamp}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="block text-xs text-gray-500 uppercase font-semibold">Position on Roll</span>
                        <span className="font-mono text-lg font-bold text-slate-700">{error.meter}m</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="uppercase text-xs font-semibold text-gray-500">Severity:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase tracking-wide ${isHigh ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {error.severity}
                    </span>
                    <span className="text-gray-400 mx-1">|</span>
                    <span className="uppercase text-xs font-semibold text-gray-500">Type:</span>
                    <span className="font-bold text-slate-700">{error.type}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                 <button 
                    onClick={onToggleIgnore}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border font-semibold rounded-lg transition-colors shadow-sm text-sm
                        ${isDismissed 
                            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                    `}
                 >
                    {isDismissed ? (
                        <>
                            <Icons.Restore className="w-4 h-4" />
                            DO NOT IGNORE
                        </>
                    ) : (
                        <>
                            <Icons.Dismiss className="w-4 h-4" />
                            MARK IGNORED
                        </>
                    )}
                 </button>
                 
                 <button 
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm uppercase tracking-wide"
                 >
                    Close
                 </button>
            </div>
        </div>
    </div>
  );
};

export default ErrorModal;