import React from 'react';
import { ThresholdConfig, QualityProfileType } from '../types';
import { Icons } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentProfile: QualityProfileType;
  onUpdateProfile: (profile: QualityProfileType) => void;
  thresholds: ThresholdConfig;
  onUpdateThresholds: (config: ThresholdConfig) => void;
  isPage?: boolean;
}

const QUALITY_PROFILES: QualityProfileType[] = [
  'High Quality (1200dpi)', 
  'Standard (600dpi)', 
  'Draft (300dpi)', 
  'Eco Mode'
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  currentProfile, 
  onUpdateProfile,
  thresholds,
  onUpdateThresholds,
  isPage = false
}) => {
  if (!isOpen && !isPage) return null;

  const handleSliderChange = (key: keyof ThresholdConfig, value: number) => {
    onUpdateThresholds({
      ...thresholds,
      [key]: value
    });
  };

  const containerClasses = isPage 
    ? "w-full h-full bg-brand-bg p-8 overflow-y-auto"
    : "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200";
    
  const wrapperClasses = isPage
    ? "bg-white rounded-xl shadow-sm border border-brand-lightGray w-full max-w-4xl mx-auto"
    : "bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-200";

  return (
    <div className={containerClasses}>
      {!isPage && <div className="absolute inset-0" onClick={onClose}></div>}

      <div 
        className={wrapperClasses}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-hp-blue">
                <Icons.Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-[20px] font-semibold text-hp-dark">Job & Detection Settings</h2>
          </div>
          {!isPage && (
            <button 
                onClick={onClose}
                className="p-2 text-hp-gray hover:bg-gray-100 rounded-full transition-colors"
            >
                <Icons.Close className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-8">
          
          {/* Section 1: Quality Profile */}
          <div className="space-y-3">
             <label className="text-[14px] font-semibold text-hp-dark block">Quality Profile</label>
             <div className="relative">
                <select 
                   value={currentProfile}
                   onChange={(e) => onUpdateProfile(e.target.value as QualityProfileType)}
                   className="w-full appearance-none bg-gray-50 border border-gray-200 text-hp-dark text-[14px] rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-hp-blue focus:ring-1 focus:ring-hp-blue transition-all"
                >
                   {QUALITY_PROFILES.map(profile => (
                     <option key={profile} value={profile}>{profile}</option>
                   ))}
                </select>
                <Icons.ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-hp-gray pointer-events-none" />
             </div>
             <p className="text-[12px] text-hp-gray">
               Adjusts sensor sensitivity and processing speed based on job requirements.
             </p>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* Section 2: Thresholds */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-hp-dark">Severity Thresholds</h3>
                <span className="text-[10px] uppercase font-bold text-hp-blue bg-blue-50 px-2 py-1 rounded">Advanced</span>
             </div>

             {/* Slider 1: Delta E */}
             <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <label className="text-[12px] font-medium text-hp-gray">Delta-E Tolerance</label>
                   <span className="text-[14px] font-bold text-hp-dark">{thresholds.deltaE.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="5.0" 
                  step="0.1" 
                  value={thresholds.deltaE}
                  onChange={(e) => handleSliderChange('deltaE', parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-hp-blue"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                   <span>Strict (0.5)</span>
                   <span>Loose (5.0)</span>
                </div>
             </div>

             {/* Slider 2: Size */}
             <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <label className="text-[12px] font-medium text-hp-gray">Min Defect Size</label>
                   <span className="text-[14px] font-bold text-hp-dark">{thresholds.minDefectSizeMM.toFixed(1)} mm</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="5.0" 
                  step="0.1" 
                  value={thresholds.minDefectSizeMM}
                  onChange={(e) => handleSliderChange('minDefectSizeMM', parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-hp-blue"
                />
             </div>

             {/* Slider 3: High Severity Zone */}
             <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <label className="text-[12px] font-medium text-hp-gray">High Severity Trigger</label>
                   <span className="text-[14px] font-bold text-hp-red">{thresholds.highSeverityPercentage}% match</span>
                </div>
                <div className="relative w-full h-6 flex items-center">
                   {/* Background Track */}
                   <div className="absolute inset-0 top-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                       <div 
                          className="absolute right-0 top-0 bottom-0 bg-hp-red opacity-80" 
                          style={{ width: `${100 - thresholds.highSeverityPercentage}%` }}
                       ></div>
                   </div>
                   
                   {/* Interactive Input - Positioned on top with opacity 0 but keeping cursor events */}
                   <input 
                      type="range" 
                      min="50" 
                      max="99" 
                      step="1" 
                      value={thresholds.highSeverityPercentage}
                      onChange={(e) => handleSliderChange('highSeverityPercentage', parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                   />
                   
                   {/* Visual Thumb Follower (Optional for better UX, but simple overlay works) */}
                   <div 
                        className="absolute top-1 w-4 h-4 bg-white border border-gray-300 rounded-full shadow-sm pointer-events-none z-10"
                        style={{ left: `calc(${((thresholds.highSeverityPercentage - 50) / 49) * 100}% - 8px)` }}
                   ></div>
                </div>
                
                <p className="text-[10px] text-gray-400 pt-1">
                   Defects exceeding this confidence level will stop the printer.
                </p>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
           {!isPage && (
             <button 
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-gray-300 text-hp-dark font-semibold rounded-lg hover:bg-gray-50 transition-colors text-[13px]"
             >
                Cancel
             </button>
           )}
           <button 
             onClick={onClose}
             className="flex-1 py-3 bg-hp-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm text-[13px]"
           >
             Save Changes
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;