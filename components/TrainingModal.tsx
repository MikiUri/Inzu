import React, { useState } from 'react';
import { Icons } from './Icons';
import { ErrorType } from '../types';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRAINING_MODULES = [
  {
    id: 'banding',
    title: 'Banding Issues',
    type: ErrorType.BANDING,
    description: 'Horizontal or vertical lines appearing across the print, often caused by nozzle clogs or feed issues.',
    causes: ['Clogged printhead nozzles', 'Media feed calibration off', 'Low vacuum pressure'],
    prevention: 'Run daily nozzle checks and ensure media is loaded straight.',
    fix: 'Perform a hard clean on printheads 1 & 2. Recalibrate media advance.',
    imageIndex: 1050
  },
  {
    id: 'smears',
    title: 'Ink Smears / Head Crash',
    type: ErrorType.SMEARS,
    description: 'Patches of wet ink or drag marks caused by the printhead physically touching the media.',
    causes: ['Media curling at edges', 'Printhead height too low', 'Media not secured on vacuum zone'],
    prevention: 'Use edge holders for rigid media. Increase vacuum strength.',
    fix: 'Cancel job immediately. Clean printhead plate manually. Raise carriage height.',
    imageIndex: 1051
  },
  {
    id: 'grain',
    title: 'Graininess / Noise',
    type: ErrorType.GRAIN,
    description: 'Print appears speckled or grainy, lacking smoothness in solid colors.',
    causes: ['Pass count too low', 'Curing temperature too high', 'Expired ink'],
    prevention: 'Select "High Quality" profile for photographic prints.',
    fix: 'Increase pass count to 8 or higher. Lower curing temperature by 5°C.',
    imageIndex: 1052
  }
];

const TrainingModal: React.FC<TrainingModalProps> = ({ isOpen, onClose }) => {
  const [activeModule, setActiveModule] = useState(TRAINING_MODULES[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[600px] overflow-hidden relative z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-hp-blue">
                 <Icons.Training className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-[20px] font-semibold text-hp-dark">Operator Training Center</h2>
                 <p className="text-[12px] text-hp-gray">Self-learning resources for defect identification and resolution.</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-hp-gray hover:bg-gray-200 rounded-full transition-colors">
              <Icons.Close className="w-6 h-6" />
           </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
           {/* Sidebar Navigation */}
           <div className="w-1/3 border-r border-gray-100 bg-gray-50 overflow-y-auto p-4 space-y-2">
              {TRAINING_MODULES.map(module => (
                 <button
                    key={module.id}
                    onClick={() => setActiveModule(module)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group
                       ${activeModule.id === module.id 
                          ? 'bg-white border-hp-blue ring-1 ring-hp-blue shadow-sm' 
                          : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'
                       }
                    `}
                 >
                    <div>
                       <span className="text-[13px] font-semibold text-hp-dark block">{module.title}</span>
                       <span className="text-[11px] text-hp-gray uppercase">{module.type}</span>
                    </div>
                    <Icons.ArrowRight className={`w-4 h-4 text-hp-gray opacity-0 group-hover:opacity-100 transition-opacity ${activeModule.id === module.id ? 'opacity-100 text-hp-blue' : ''}`} />
                 </button>
              ))}
           </div>

           {/* Content Area */}
           <div className="w-2/3 overflow-y-auto p-8">
               <div className="mb-6 rounded-lg overflow-hidden h-48 bg-gray-100 relative group">
                  <img 
                     src={`https://picsum.photos/800/400?random=${activeModule.imageIndex}`} 
                     alt={activeModule.title} 
                     className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                     <h3 className="text-white text-2xl font-bold">{activeModule.title}</h3>
                  </div>
               </div>

               <div className="space-y-6">
                  <div>
                     <h4 className="text-[14px] font-semibold text-hp-dark mb-2 flex items-center gap-2">
                        <Icons.Alert className="w-4 h-4 text-hp-orange" />
                        Description
                     </h4>
                     <p className="text-[13px] text-hp-dark leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {activeModule.description}
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div>
                        <h4 className="text-[14px] font-semibold text-hp-dark mb-2">Common Causes</h4>
                        <ul className="list-disc list-inside text-[13px] text-hp-gray space-y-1">
                           {activeModule.causes.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                     </div>
                     <div>
                        <h4 className="text-[14px] font-semibold text-hp-dark mb-2">Prevention</h4>
                        <p className="text-[13px] text-hp-gray">{activeModule.prevention}</p>
                     </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                     <h4 className="text-[14px] font-semibold text-hp-blue mb-2 flex items-center gap-2">
                        <Icons.Check className="w-4 h-4" />
                        Resolution Steps
                     </h4>
                     <p className="text-[13px] text-hp-dark">{activeModule.fix}</p>
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingModal;