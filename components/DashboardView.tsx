import React from 'react';
import { Icons } from './Icons';
import { Machine, ViewType } from '../types';

interface DashboardViewProps {
    onNavigate: (view: ViewType) => void;
    onSelectMachine: (machineId: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectMachine }) => {
  const machines: Machine[] = [
    { id: 'LATEX-01', name: 'HP Latex R2000 Plus', status: 'running' },
    { id: 'LATEX-02', name: 'HP Latex 3600', status: 'idle' },
    { id: 'STITCH-01', name: 'HP Stitch S1000', status: 'paused' },
    { id: 'INDIGO-01', name: 'HP Indigo 15K', status: 'error' }
  ];

  const handleMachineClick = (machineId: string) => {
    onSelectMachine(machineId);
    onNavigate('activeJob');
  };

  return (
    <div className="flex-1 bg-brand-bg p-8 overflow-y-auto">
       <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
             <div>
                <h1 className="text-h1 text-brand-dark mb-1">Dashboard</h1>
                <p className="text-brand-gray">Overview of production floor status</p>
             </div>
             <button 
                onClick={() => onNavigate('settings')}
                className="px-4 py-2 bg-white border border-brand-lightGray rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
             >
                <Icons.Settings className="w-4 h-4" />
                Customize View
             </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-brand-lightGray shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-label text-brand-gray uppercase">Production Efficiency</span>
                      <Icons.Activity className="w-5 h-5 text-hp-blue" />
                  </div>
                  <div className="text-3xl font-bold text-brand-dark">92%</div>
                  <div className="text-xs text-status-success mt-1">↑ 2.4% vs last week</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-brand-lightGray shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-label text-brand-gray uppercase">Active Jobs</span>
                      <Icons.Jobs className="w-5 h-5 text-hp-orange" />
                  </div>
                  <div className="text-3xl font-bold text-brand-dark">3</div>
                  <div className="text-xs text-brand-gray mt-1">5 jobs queued</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-brand-lightGray shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-label text-brand-gray uppercase">Total Defects (24h)</span>
                      <Icons.Alert className="w-5 h-5 text-hp-red" />
                  </div>
                  <div className="text-3xl font-bold text-brand-dark">12</div>
                  <div className="text-xs text-status-success mt-1">↓ 4 fewer than avg</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-brand-lightGray shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-label text-brand-gray uppercase">Est. Waste Cost</span>
                      <Icons.Dollar className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="text-3xl font-bold text-brand-dark">€124</div>
                  <div className="text-xs text-brand-gray mt-1">Today's accumulation</div>
              </div>
          </div>

          {/* Machine Status Grid */}
          <div>
             <h2 className="text-h2 text-brand-dark mb-4">Machine Status</h2>
             <div className="grid grid-cols-2 gap-6">
                {machines.map(machine => (
                    <div 
                        key={machine.id} 
                        onClick={() => handleMachineClick(machine.id)}
                        className="bg-white p-6 rounded-xl border border-brand-lightGray shadow-sm flex items-center justify-between group hover:border-brand-blue transition-all cursor-pointer hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center
                                ${machine.status === 'running' ? 'bg-green-100 text-status-success' : 
                                  machine.status === 'paused' ? 'bg-yellow-100 text-status-warning' :
                                  machine.status === 'error' ? 'bg-red-100 text-status-error' :
                                  'bg-gray-100 text-gray-400'}
                            `}>
                                <Icons.Printer className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-brand-dark group-hover:text-brand-blue transition-colors">{machine.name}</h3>
                                <p className="text-sm text-brand-gray">ID: {machine.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`
                                px-3 py-1 rounded-full text-xs font-bold uppercase
                                ${machine.status === 'running' ? 'bg-green-100 text-status-success' : 
                                  machine.status === 'paused' ? 'bg-yellow-100 text-status-warning' :
                                  machine.status === 'error' ? 'bg-red-100 text-status-error' :
                                  'bg-gray-100 text-gray-500'}
                            `}>
                                {machine.status}
                            </span>
                            <Icons.ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default DashboardView;