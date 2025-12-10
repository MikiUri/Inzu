

import React from 'react';
import { Icons } from './Icons';
import { Machine, ViewType, DashboardWidgetConfig } from '../types';

interface DashboardViewProps {
    onNavigate: (view: ViewType) => void;
    onSelectMachine: (machineId: string) => void;
    onCustomizeView: () => void;
    widgets: DashboardWidgetConfig;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectMachine, onCustomizeView, widgets }) => {
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
                <h1 className="text-2xl font-bold text-brand-dark mb-1">Dashboard</h1>
                <p className="text-brand-muted">Overview of production floor status</p>
             </div>
             <button 
                onClick={onCustomizeView}
                className="px-4 py-2 bg-white border border-brand-border rounded-lg text-sm font-medium hover:bg-brand-bg flex items-center gap-2 transition-colors"
             >
                <Icons.Settings className="w-4 h-4" />
                Customize View
             </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
              {widgets.efficiency && (
                  <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm animate-in zoom-in duration-300">
                      <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Production Efficiency</span>
                          <Icons.Activity className="w-5 h-5 text-brand-secondary" />
                      </div>
                      <div className="text-3xl font-bold text-brand-dark">92%</div>
                      <div className="text-xs text-status-success mt-1">↑ 2.4% vs last week</div>
                  </div>
              )}
              {widgets.activeJobs && (
                  <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm animate-in zoom-in duration-300 delay-75">
                      <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Active Jobs</span>
                          <Icons.Jobs className="w-5 h-5 text-status-medium" />
                      </div>
                      <div className="text-3xl font-bold text-brand-dark">3</div>
                      <div className="text-xs text-brand-muted mt-1">5 jobs queued</div>
                  </div>
              )}
              {widgets.defects && (
                  <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm animate-in zoom-in duration-300 delay-100">
                      <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Total Defects (24h)</span>
                          <Icons.Alert className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div className="text-3xl font-bold text-brand-dark">12</div>
                      <div className="text-xs text-status-success mt-1">↓ 4 fewer than avg</div>
                  </div>
              )}
              {widgets.cost && (
                  <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm animate-in zoom-in duration-300 delay-150">
                      <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Est. Waste Cost</span>
                          <Icons.Dollar className="w-5 h-5 text-brand-muted" />
                      </div>
                      <div className="text-3xl font-bold text-brand-dark">€124</div>
                      <div className="text-xs text-brand-muted mt-1">Today's accumulation</div>
                  </div>
              )}
          </div>

          {/* Machine Status Grid */}
          <div>
             <h2 className="text-lg font-bold text-brand-dark mb-4">Machine Status</h2>
             <div className="grid grid-cols-2 gap-6">
                {machines.map(machine => (
                    <div 
                        key={machine.id} 
                        onClick={() => handleMachineClick(machine.id)}
                        className="bg-white p-6 rounded-xl border border-brand-border shadow-sm flex items-center justify-between group hover:border-brand-secondary transition-all cursor-pointer hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center
                                ${machine.status === 'running' ? 'bg-green-100 text-status-success' : 
                                  machine.status === 'paused' ? 'bg-yellow-100 text-status-warning' :
                                  machine.status === 'error' ? 'bg-red-100 text-status-critical' :
                                  'bg-gray-100 text-gray-400'}
                            `}>
                                <Icons.Printer className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-brand-dark group-hover:text-brand-secondary transition-colors">{machine.name}</h3>
                                <p className="text-sm text-brand-muted">ID: {machine.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`
                                px-3 py-1 rounded-full text-xs font-bold uppercase
                                ${machine.status === 'running' ? 'bg-green-100 text-status-success' : 
                                  machine.status === 'paused' ? 'bg-yellow-100 text-status-warning' :
                                  machine.status === 'error' ? 'bg-red-100 text-status-critical' :
                                  'bg-gray-100 text-gray-500'}
                            `}>
                                {machine.status}
                            </span>
                            <Icons.ArrowRight className="w-5 h-5 text-brand-muted group-hover:text-brand-secondary group-hover:translate-x-1 transition-all" />
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