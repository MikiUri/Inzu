import React from 'react';
import { Icons } from './Icons';

interface WasteReportModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isPage?: boolean;
}

const WasteReportModal: React.FC<WasteReportModalProps> = ({ isOpen, onClose, isPage = false }) => {
  if (!isOpen && !isPage) return null;

  const containerClasses = isPage 
    ? "w-full h-full bg-brand-bg p-8 overflow-y-auto"
    : "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200";
    
  const wrapperClasses = isPage
    ? "bg-white rounded-xl shadow-sm border border-brand-lightGray w-full max-w-6xl mx-auto h-[750px] flex flex-col"
    : "bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[700px] overflow-hidden relative z-10 flex flex-col animate-in slide-in-from-bottom-4 duration-300";

  return (
    <div className={containerClasses}>
      {!isPage && <div className="absolute inset-0" onClick={onClose}></div>}

      <div className={wrapperClasses}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 rounded-t-xl">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg text-hp-red">
                 <Icons.BarChart className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-[20px] font-semibold text-hp-dark">Material Waste Report</h2>
                 <p className="text-[12px] text-hp-gray">Weekly Analysis • Oct 23 - Oct 30, 2025</p>
              </div>
           </div>
           {!isPage && (
            <button onClick={onClose} className="p-2 text-hp-gray hover:bg-gray-100 rounded-full transition-colors">
                <Icons.Close className="w-6 h-6" />
            </button>
           )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
           
           {/* Top Stats Cards */}
           <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[12px] font-semibold text-hp-gray uppercase">Total Waste Length</span>
                    <Icons.Settings className="w-4 h-4 text-gray-300" />
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-hp-dark">142.5</span>
                    <span className="text-sm font-medium text-hp-gray">meters</span>
                 </div>
                 <div className="mt-2 text-[11px] text-hp-green flex items-center gap-1">
                    <Icons.Trend className="w-3 h-3" />
                    <span>-12% vs last week</span>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[12px] font-semibold text-hp-gray uppercase">Estimated Cost</span>
                    <Icons.Dollar className="w-4 h-4 text-gray-300" />
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-hp-dark">$854.20</span>
                 </div>
                 <div className="mt-2 text-[11px] text-hp-red flex items-center gap-1">
                    <Icons.Trend className="w-3 h-3 rotate-180" />
                    <span>+5% material price increase</span>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[12px] font-semibold text-hp-gray uppercase">Efficiency Score</span>
                    <Icons.Activity className="w-4 h-4 text-gray-300" />
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-hp-blue">94.2%</span>
                 </div>
                 <p className="mt-2 text-[11px] text-hp-gray">Based on print vs waste ratio</p>
              </div>
           </div>

           {/* Charts Section */}
           <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                 <h3 className="text-[14px] font-semibold text-hp-dark mb-6">Waste by Defect Type</h3>
                 <div className="space-y-4">
                    {[
                       { label: 'Banding', val: 45, color: 'bg-hp-red' },
                       { label: 'Ink Smears', val: 30, color: 'bg-hp-orange' },
                       { label: 'Grain', val: 15, color: 'bg-hp-blue' },
                       { label: 'Other', val: 10, color: 'bg-gray-300' }
                    ].map((item) => (
                       <div key={item.label}>
                          <div className="flex justify-between text-[12px] mb-1">
                             <span className="font-medium text-hp-dark">{item.label}</span>
                             <span className="text-hp-gray">{item.val}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                 <h3 className="text-[14px] font-semibold text-hp-dark mb-6">Waste by Operator Shift</h3>
                 <div className="flex items-end justify-between h-[150px] space-x-4">
                    {[
                        { day: 'Mon', h: '60%' },
                        { day: 'Tue', h: '40%' },
                        { day: 'Wed', h: '75%' },
                        { day: 'Thu', h: '30%' },
                        { day: 'Fri', h: '50%' },
                        { day: 'Sat', h: '20%' },
                        { day: 'Sun', h: '10%' },
                    ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                            <div 
                                className="w-full bg-blue-100 group-hover:bg-hp-blue transition-colors rounded-t-sm relative"
                                style={{ height: bar.h }}
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {bar.h}
                                </div>
                            </div>
                            <span className="text-[10px] text-hp-gray mt-2">{bar.day}</span>
                        </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-xl">
             <button className="px-4 py-2 bg-white border border-gray-200 text-hp-dark text-[13px] font-semibold rounded-lg hover:bg-gray-50">
                Export CSV
             </button>
             {!isPage && (
               <button onClick={onClose} className="px-4 py-2 bg-hp-blue text-white text-[13px] font-semibold rounded-lg hover:bg-blue-600">
                  Done
               </button>
             )}
        </div>
      </div>
    </div>
  );
};

export default WasteReportModal;