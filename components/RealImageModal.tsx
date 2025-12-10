import React, { useState } from 'react';
import { PrintError } from '../types';
import { Icons } from './Icons';

interface RealImageModalProps {
  error: PrintError | null;
  onClose: () => void;
  onIgnore: () => void;
}

const RealImageModal: React.FC<RealImageModalProps> = ({ error, onClose, onIgnore }) => {
  const [zoom, setZoom] = useState(1);
  
  if (!error) return null;
  
  const imageIndex = 1000 + parseInt(error.id);

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col animate-in fade-in duration-200">
       {/* Toolbar */}
       <div className="h-16 flex items-center justify-between px-6 bg-black/50 backdrop-blur-md border-b border-white/10 shrink-0">
          <div className="text-white">
             <h2 className="text-h2 font-medium">{error.type}</h2>
             <span className="text-gray-400 text-sm">{error.timestamp} • Meter {error.meter}</span>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={onIgnore}
                className="px-4 py-2 border border-blue-500 text-blue-400 rounded hover:bg-blue-500/10 transition-colors"
             >
                Ignore Error
             </button>
             <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                <Icons.Close className="w-6 h-6" />
             </button>
          </div>
       </div>

       {/* Image Viewport */}
       <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
          <img 
             src={`https://picsum.photos/1200/800?random=${imageIndex}`}
             alt="Real Defect"
             className="transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing max-w-full max-h-full object-contain"
             style={{ transform: `scale(${zoom})` }}
          />
          
          {/* Zoom Controls */}
          <div className="absolute bottom-8 flex gap-4 bg-black/60 p-2 rounded-full backdrop-blur-md">
             <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="p-2 text-white hover:text-blue-400">
                <Icons.ZoomOut className="w-6 h-6" />
             </button>
             <span className="text-white font-mono self-center w-12 text-center">{Math.round(zoom * 100)}%</span>
             <button onClick={() => setZoom(z => Math.min(4, z + 0.5))} className="p-2 text-white hover:text-blue-400">
                <Icons.ZoomIn className="w-6 h-6" />
             </button>
          </div>
       </div>
    </div>
  );
};

export default RealImageModal;