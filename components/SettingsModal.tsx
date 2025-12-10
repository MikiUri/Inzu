

import React from 'react';
import { ThresholdConfig, QualityProfileType, DashboardWidgetConfig } from '../types';
import { Icons } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentProfile: QualityProfileType;
  onUpdateProfile: (profile: QualityProfileType) => void;
  thresholds: ThresholdConfig;
  onUpdateThresholds: (config: ThresholdConfig) => void;
  isPage?: boolean;
  mode: 'general' | 'dashboard'; // 'general' = Settings View, 'dashboard' = Customize View
  widgets: DashboardWidgetConfig;
  onUpdateWidgets: (config: DashboardWidgetConfig) => void;
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
  isPage = false,
  mode,
  widgets,
  onUpdateWidgets
}) => {
  if (!isOpen && !isPage) return null;

  const handleSliderChange = (key: keyof ThresholdConfig, value: number) => {
    onUpdateThresholds({
      ...thresholds,
      [key]: value
    });
  };

  const handleWidgetToggle = (key: keyof DashboardWidgetConfig) => {
      onUpdateWidgets({
          ...widgets,
          [key]: !widgets[key]
      });
  };

  // Preset handlers for Density
  const setCompactView = () => {
      onUpdateWidgets({
          efficiency: true,
          defects: true,
          activeJobs: false,
          cost: false
      });
  };

  const setDetailedView = () => {
      onUpdateWidgets({
          efficiency: true,
          defects: true,
          activeJobs: true,
          cost: true
      });
  };

  const containerClasses = isPage 
    ? "w-full h-full bg-brand-bg p-8 overflow-y-auto"
    : "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200";
    
  const wrapperClasses = isPage
    ? "bg-white rounded-xl shadow-sm border border-brand-border w-full max-w-4xl mx-auto"
    : "bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-200";

  const getTitle = () => mode === 'dashboard' ? 'Customize View' : 'Settings';
  const getIcon = () => mode === 'dashboard' ? <Icons.LayoutGrid className="w-5 h-5" /> : <Icons.Sliders className="w-5 h-5" />;

  return (
    <div className={containerClasses}>
      {!isPage && <div className="absolute inset-0" onClick={onClose}></div>}

      <div 
        className={wrapperClasses}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-brand-secondary">
                {getIcon()}
            </div>
            <h2 className="text-xl font-semibold text-brand-dark">{getTitle()}</h2>
          </div>
          {!isPage && (
            <button 
                onClick={onClose}
                className="p-2 text-brand-muted hover:bg-gray-100 rounded-full transition-colors"
            >
                <Icons.Close className="w-6 h-6" />
            </button>
          )}
        </div>
        
        {/* We no longer use tabs. The content is determined by the `mode` prop. */}

        <div className="p-6 space-y-8 min-h-[400px]">
          
          {mode === 'general' ? (
            <>
              {/* Section 1: Quality Profile */}
              <div className="space-y-3">
                 <label className="text-sm font-semibold text-brand-dark block">Quality Profile</label>
                 <div className="relative">
                    <select 
                       value={currentProfile}
                       onChange={(e) => onUpdateProfile(e.target.value as QualityProfileType)}
                       className="w-full appearance-none bg-brand-bg border border-brand-border text-brand-dark text-sm rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-all"
                    >
                       {QUALITY_PROFILES.map(profile => (
                         <option key={profile} value={profile}>{profile}</option>
                       ))}
                    </select>
                    <Icons.ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                 </div>
                 <p className="text-xs text-brand-muted">
                   Adjusts sensor sensitivity and thresholds.
                 </p>
              </div>

              <div className="h-px bg-brand-border w-full"></div>

              {/* Section 2: Thresholds */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-brand-dark">Detection Thresholds</h3>
                    <span className="text-[10px] uppercase font-bold text-brand-secondary bg-blue-50 px-2 py-1 rounded">Advanced</span>
                 </div>

                 {/* Slider 1: Delta E */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-end">
                       <label className="text-xs font-medium text-brand-muted">Delta-E Tolerance</label>
                       <span className="text-sm font-bold text-brand-dark">{thresholds.deltaE.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="5.0" 
                      step="0.1" 
                      value={thresholds.deltaE}
                      onChange={(e) => handleSliderChange('deltaE', parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
                    />
                 </div>

                 {/* Slider 2: Size */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-end">
                       <label className="text-xs font-medium text-brand-muted">Min Defect Size</label>
                       <span className="text-sm font-bold text-brand-dark">{thresholds.minDefectSizeMM.toFixed(1)} mm</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="5.0" 
                      step="0.1" 
                      value={thresholds.minDefectSizeMM}
                      onChange={(e) => handleSliderChange('minDefectSizeMM', parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
                    />
                 </div>

                 {/* Slider 3: High Severity Zone */}
                 <div className="space-y-2">
                    <div className="flex justify-between items-end">
                       <label className="text-xs font-medium text-brand-muted">High Severity Trigger</label>
                       <span className="text-sm font-bold text-brand-primary">{thresholds.highSeverityPercentage}% match</span>
                    </div>
                    <input 
                        type="range" 
                        min="50" 
                        max="99" 
                        step="1" 
                        value={thresholds.highSeverityPercentage}
                        onChange={(e) => handleSliderChange('highSeverityPercentage', parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                 </div>
              </div>
            </>
          ) : (
            // DASHBOARD CUSTOMIZATION MODE
            <div className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-brand-dark">Dashboard Widgets</h3>
                    <div className="space-y-3">
                         {/* Manual Toggles */}
                        <label className="flex items-center justify-between p-3 bg-brand-bg rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <span className="text-sm text-brand-body font-medium">Production Efficiency</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={widgets.efficiency} 
                                    onChange={() => handleWidgetToggle('efficiency')}
                                    className="sr-only peer" 
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-secondary"></div>
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-3 bg-brand-bg rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <span className="text-sm text-brand-body font-medium">Active Jobs</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={widgets.activeJobs} 
                                    onChange={() => handleWidgetToggle('activeJobs')}
                                    className="sr-only peer" 
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-secondary"></div>
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-3 bg-brand-bg rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <span className="text-sm text-brand-body font-medium">Total Defects</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={widgets.defects} 
                                    onChange={() => handleWidgetToggle('defects')}
                                    className="sr-only peer" 
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-secondary"></div>
                            </div>
                        </label>
                        <label className="flex items-center justify-between p-3 bg-brand-bg rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <span className="text-sm text-brand-body font-medium">Cost Estimation</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={widgets.cost} 
                                    onChange={() => handleWidgetToggle('cost')}
                                    className="sr-only peer" 
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-secondary"></div>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div className="h-px bg-brand-border w-full"></div>
                
                {/* Density Presets */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-brand-dark">Interface Density</h3>
                     <div className="flex gap-2">
                         <button 
                            onClick={setCompactView}
                            className="flex-1 py-2 text-xs border border-brand-border bg-white text-brand-body font-bold rounded hover:bg-gray-50 focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all"
                         >
                            Compact
                         </button>
                         <button 
                            onClick={setDetailedView}
                            className="flex-1 py-2 text-xs border border-brand-border bg-white text-brand-body font-bold rounded hover:bg-gray-50 focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all"
                         >
                            Detailed
                         </button>
                     </div>
                     <p className="text-[10px] text-brand-muted">
                        "Compact" shows only critical efficiency & defect metrics. "Detailed" shows all available widgets.
                     </p>
                </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 bg-brand-bg border-t border-brand-border flex gap-3">
           {!isPage && (
             <button 
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-brand-border text-brand-dark font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
             >
                Done
             </button>
           )}
           {isPage && (
             <button 
               className="flex-1 py-3 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm text-sm"
             >
               Save Changes
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;