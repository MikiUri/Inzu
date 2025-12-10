
import React, { useState } from 'react';
import { Icons } from './Icons';
import { PrintJobStatus, Machine } from '../types';

interface TopBarProps {
  jobStatus: PrintJobStatus;
  totalWasteCost: number;
  onPauseToggle: () => void;
  onStop: () => void;
  onSelectMachine: (machineId: string) => void;
}

const AVAILABLE_MACHINES: Machine[] = [
    { id: 'LATEX-01', name: 'HP Latex R2000 Plus', status: 'running' },
    { id: 'LATEX-02', name: 'HP Latex 3600', status: 'idle' },
    { id: 'STITCH-01', name: 'HP Stitch S1000', status: 'paused' }
];

const TopBar: React.FC<TopBarProps> = ({ jobStatus, totalWasteCost, onPauseToggle, onStop, onSelectMachine }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMachineSelect = (id: string) => {
    onSelectMachine(id);
    setIsDropdownOpen(false);
  };

  return (
    <header className="h-[72px] bg-white border-b border-brand-border flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm relative">
      
      {/* Left: Machine Selector & Status */}
      <div className="flex items-center gap-6">
        <div className="relative">
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-xl font-bold text-brand-dark hover:opacity-70 transition-opacity"
            >
                {jobStatus.machineName}
                <Icons.ChevronDown className={`w-5 h-5 text-brand-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Machine Dropdown */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-brand-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 text-xs font-semibold text-brand-muted uppercase tracking-wider">Select Machine</div>
                    {AVAILABLE_MACHINES.map(machine => (
                        <button 
                            key={machine.id}
                            className="w-full text-left px-4 py-3 hover:bg-brand-bg flex items-center justify-between group transition-colors"
                            onClick={() => handleMachineSelect(machine.id)}
                        >
                            <span className={`text-sm font-medium ${machine.name === jobStatus.machineName ? 'text-brand-secondary' : 'text-brand-dark'}`}>
                                {machine.name}
                            </span>
                            {machine.status === 'running' && <span className="w-2 h-2 rounded-full bg-status-success"></span>}
                            {machine.status === 'paused' && <span className="w-2 h-2 rounded-full bg-status-warning"></span>}
                            {machine.status === 'idle' && <span className="w-2 h-2 rounded-full bg-brand-muted"></span>}
                        </button>
                    ))}
                </div>
            )}

            {/* Click outside to close */}
            {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>}

            <div className="flex items-center gap-3 text-xs text-brand-muted mt-1 font-medium">
                <span>ID: {jobStatus.machineId}</span>
                <span className="w-1 h-1 rounded-full bg-brand-border"></span>
                <span>Job: {jobStatus.jobId}</span>
                <span className="w-1 h-1 rounded-full bg-brand-border"></span>
                <span className={`flex items-center gap-1 ${!jobStatus.isPrinting ? 'text-brand-muted' : jobStatus.isPaused ? 'text-status-warning' : 'text-status-success'}`}>
                    {!jobStatus.isPrinting ? 'STOPPED' : jobStatus.isPaused ? 'PAUSED' : 'RUNNING'}
                </span>
            </div>
        </div>
      </div>

      {/* Center: Waste Stats */}
      <div className="hidden md:flex items-center gap-6 bg-brand-bg px-4 py-2 rounded-lg border border-brand-border">
         <div className="flex flex-col items-center px-4 border-r border-brand-border">
             <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Est. Waste Cost</span>
             <span className="text-sm font-semibold text-brand-dark">€{totalWasteCost.toFixed(2)}</span>
         </div>
         <div className="flex flex-col items-center px-2">
             <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Quality Profile</span>
             <span className="text-sm font-medium text-brand-secondary">{jobStatus.qualityProfile}</span>
         </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
         <button 
            onClick={onPauseToggle}
            disabled={!jobStatus.isPrinting}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors border
                ${!jobStatus.isPrinting
                    ? 'bg-brand-bg text-brand-muted border-brand-border cursor-not-allowed opacity-50'
                    : jobStatus.isPaused 
                        ? 'bg-status-success text-white border-status-success hover:bg-green-600' 
                        : 'bg-white text-brand-dark border-brand-border hover:bg-brand-bg'
                }
            `}
         >
            {jobStatus.isPaused ? <Icons.Play className="w-4 h-4" /> : <Icons.Pause className="w-4 h-4" />}
            {jobStatus.isPaused ? 'Resume' : 'Pause'}
         </button>
         
         <button 
            onClick={onStop}
            disabled={!jobStatus.isPrinting}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors border shadow-sm
                ${!jobStatus.isPrinting
                   ? 'bg-brand-bg text-brand-muted border-brand-border cursor-not-allowed opacity-50'
                   : 'bg-status-critical text-white border-status-critical hover:bg-red-700'
                }
            `}
         >
            <Icons.Stop className="w-4 h-4" />
            Stop
         </button>
      </div>

    </header>
  );
};

export default TopBar;
