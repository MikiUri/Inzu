import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './components/Icons';
import VirtualRoll from './components/VirtualRoll';
import TimelineRail from './components/TimelineRail';
import ErrorCard from './components/ErrorCard';
import DefectDetailsPanel from './components/DefectDetailsPanel';
import SettingsModal from './components/SettingsModal';
import TrainingModal from './components/TrainingModal'; // New Import
import WasteReportModal from './components/WasteReportModal'; // New Import
import { 
  PrintError, 
  ErrorStatus, 
  PrintJobStatus,
  ErrorType,
  ErrorSeverity,
  DefectOrigin,
  ThresholdConfig,
  QualityProfileType
} from './types';
import { 
  MOCK_JOB_STATUS, 
  MOCK_ALERTS,
  INITIAL_ERRORS, 
  PIXELS_PER_METER,
  SIMULATION_SPEED_METERS,
  ERROR_SPAWN_MIN_METERS,
  ERROR_SPAWN_MAX_METERS,
  MAX_SIMULATION_METERS,
  ROLL_LENGTH_METERS as INITIAL_ROLL_LENGTH
} from './constants';

const App: React.FC = () => {
  // State
  const [errors, setErrors] = useState<PrintError[]>(INITIAL_ERRORS);
  const [jobStatus, setJobStatus] = useState<PrintJobStatus>(MOCK_JOB_STATUS);
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const [currentScrollMeter, setCurrentScrollMeter] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [thresholds, setThresholds] = useState<ThresholdConfig>({
    deltaE: 2.0,
    minDefectSizeMM: 0.5,
    highSeverityPercentage: 85
  });

  // Modal States (New)
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [isWasteReportOpen, setIsWasteReportOpen] = useState(false);
  
  // Simulation State
  const [simulationMeters, setSimulationMeters] = useState(0);
  const [nextErrorAt, setNextErrorAt] = useState<number>(6); 
  const [totalRollMeters, setTotalRollMeters] = useState(INITIAL_ROLL_LENGTH);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nextErrorIdRef = useRef<number>(6);

  const selectedError = errors.find(e => e.id === selectedErrorId);
  const activeErrorCount = errors.filter(e => e.status === ErrorStatus.ACTIVE).length;
  const ROLL_START_OFFSET_PX = 128; 

  // --- Simulation Logic ---
  useEffect(() => {
    const interval = setTimeout(() => {
        const speed = SIMULATION_SPEED_METERS;
        const newSimMeters = simulationMeters + speed;
        
        const maxErrorMeter = Math.max(...errors.map(e => e.meter), 0);
        
        if (maxErrorMeter > MAX_SIMULATION_METERS) {
            setSimulationMeters(0);
            setErrors(INITIAL_ERRORS);
            setTotalRollMeters(INITIAL_ROLL_LENGTH);
            setNextErrorAt(6);
            nextErrorIdRef.current = 6;
        } else {
            const updatedErrors = errors.map(e => ({
                ...e,
                meter: parseFloat((e.meter + speed).toFixed(2))
            }));
            
            let newNextErrorAt = nextErrorAt - speed;
            if (newNextErrorAt <= 0) {
                const newId = nextErrorIdRef.current.toString();
                nextErrorIdRef.current += 1;

                const newError: PrintError = {
                    id: newId,
                    type: Math.random() > 0.5 ? ErrorType.BANDING : (Math.random() > 0.5 ? ErrorType.SMEARS : ErrorType.GRAIN),
                    severity: Math.random() > 0.7 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    meter: 0,
                    status: ErrorStatus.ACTIVE,
                    xPosition: Math.floor(Math.random() * 80) + 10,
                    origin: Math.random() > 0.8 ? DefectOrigin.FILE : DefectOrigin.MACHINE,
                    deltaE: parseFloat((Math.random() * 3).toFixed(1))
                };
                
                updatedErrors.push(newError);
                newNextErrorAt = Math.random() * (ERROR_SPAWN_MAX_METERS - ERROR_SPAWN_MIN_METERS) + ERROR_SPAWN_MIN_METERS;
            }

            setSimulationMeters(newSimMeters);
            setErrors(updatedErrors);
            setNextErrorAt(newNextErrorAt);
            setTotalRollMeters(INITIAL_ROLL_LENGTH + newSimMeters);
            setJobStatus(prev => ({ ...prev, currentMeter: prev.currentMeter + speed }));
        }
    }, 3000); 

    return () => clearTimeout(interval);
  }, [simulationMeters, errors, nextErrorAt]);

  // Scroll Handling
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, clientHeight } = scrollContainerRef.current;
      setShowScrollTop(scrollTop > 300);
      const centerPixel = scrollTop + (clientHeight / 2);
      const pixelOnRoll = centerPixel - ROLL_START_OFFSET_PX;
      const meter = Math.max(0, pixelOnRoll / PIXELS_PER_METER);
      setCurrentScrollMeter(meter);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToError = (error: PrintError) => {
    if (scrollContainerRef.current) {
        const { clientHeight } = scrollContainerRef.current;
        const errorPixelOnRoll = error.meter * PIXELS_PER_METER;
        const targetScrollTop = (ROLL_START_OFFSET_PX + errorPixelOnRoll) - (clientHeight / 2);
        scrollContainerRef.current.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Interaction Handlers
  const handleSelectError = (error: PrintError) => {
    setSelectedErrorId(error.id);
    scrollToError(error);
    setShowDetailsPanel(true);
  };

  const handleDismissError = (id: string, reason: string) => {
    setErrors(prev => prev.map(e => e.id === id ? { ...e, status: ErrorStatus.DISMISSED, ignoreReason: reason } : e));
  };

  const handleRestoreError = (id: string) => {
    setErrors(prev => prev.map(e => e.id === id ? { ...e, status: ErrorStatus.ACTIVE, ignoreReason: undefined } : e));
  };

  const handleClosePanel = () => {
    setShowDetailsPanel(false);
    setSelectedErrorId(null);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-hp-dark overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 h-[64px] flex items-center px-[16px] z-50 shadow-sm justify-between">
          <div className="flex items-center gap-[16px]">
              <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" 
                  alt="HP Logo" 
                  className="h-[32px] w-auto shrink-0"
              />
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-[20px] font-semibold text-hp-dark tracking-tight">HP Camera Visualizer</h1>
          </div>
          <div className="flex items-center gap-4">
             {/* Quality Profile / Settings Trigger */}
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
             >
                <Icons.Settings className="w-4 h-4 text-hp-gray" />
                <span className="text-[12px] font-medium text-hp-gray">{jobStatus.qualityProfile}</span>
             </button>
             
             {/* Training Module Link */}
             <button 
                onClick={() => setIsTrainingOpen(true)}
                className="p-2 text-hp-gray hover:text-hp-blue transition-colors" 
                title="Operator Training"
             >
                <Icons.Training className="w-5 h-5" />
             </button>
          </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 h-full overflow-hidden">
        
        {/* COL 1: VISUALIZER */}
        <div className="flex-grow relative h-full flex min-w-0">
            <VirtualRoll 
                errors={errors} 
                onErrorClick={handleSelectError}
                scrollRef={scrollContainerRef}
                activeErrorId={selectedErrorId}
                offsetMeters={simulationMeters}
                totalMeters={totalRollMeters}
            />

            {/* FAB Go To Top */}
            <div className={`absolute bottom-8 right-8 z-40 transition-all duration-300 transform ${showScrollTop ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
                <button 
                    onClick={scrollToTop}
                    className="w-[56px] h-[56px] bg-hp-blue text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                    <Icons.ArrowUp className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* COL 2: RAIL */}
        <TimelineRail 
            errors={errors}
            currentScrollMeter={currentScrollMeter}
            onDotClick={handleSelectError}
            totalMeters={totalRollMeters}
        />

        {/* COL 3: SIDEBAR (Dashboard or Details) */}
        <div className="w-[400px] bg-white flex flex-col border-l border-gray-200 shadow-xl z-40 relative">
            
            {showDetailsPanel && selectedError ? (
                // --- VIEW: DEFECT DETAILS ---
                <DefectDetailsPanel 
                    error={selectedError} 
                    onClose={handleClosePanel}
                    onIgnore={handleDismissError}
                    onRestore={handleRestoreError}
                />
            ) : (
                // --- VIEW: DASHBOARD & LIST ---
                <div className="flex flex-col h-full">
                    
                    {/* 1. Status Dashboard */}
                    <div className="p-6 border-b border-gray-100 bg-white">
                        <div className="flex items-center justify-between mb-6">
                            {/* Ready/Printing Status */}
                            <div className="flex items-center gap-2">
                                <span className="w-[8px] h-[8px] bg-hp-green rounded-full"></span>
                                <span className="text-[12px] font-semibold text-hp-dark">PRINTING</span>
                            </div>
                            
                            {/* Defects Count */}
                            <div className="flex items-center gap-2">
                                <span className="text-[16px] font-bold text-hp-red">{activeErrorCount}</span>
                                <span className="text-[12px] font-medium text-hp-dark">DEFECTS</span>
                            </div>
                        </div>

                        {/* Predictive Alert */}
                        {MOCK_ALERTS.map(alert => (
                           <div key={alert.id} className="mb-4 p-3 bg-orange-50 rounded border border-orange-100 flex items-center gap-3">
                              <Icons.Trend className="w-5 h-5 text-hp-orange" />
                              <div>
                                 <div className="text-[12px] font-bold text-hp-dark">{alert.title}</div>
                                 <div className="text-[10px] text-hp-gray">{alert.trend}</div>
                              </div>
                           </div>
                        ))}

                        {/* Active Job Card */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="flex justify-between items-start mb-4">
                                <h3 className="text-[14px] font-semibold text-hp-dark">ACTIVE JOB</h3>
                                <span className="text-[12px] text-hp-gray font-mono">{jobStatus.jobId}</span>
                             </div>
                             
                             <div className="space-y-4">
                                 <div>
                                     <div className="flex justify-between text-[12px] text-hp-gray mb-1">
                                         <span>Progress</span>
                                         <span>{Math.round((jobStatus.currentMeter / jobStatus.totalLengthMeters) * 100)}%</span>
                                     </div>
                                     <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-hp-blue h-full rounded-full transition-all duration-300"
                                            style={{ width: `${(jobStatus.currentMeter / jobStatus.totalLengthMeters) * 100}%`}}
                                        ></div>
                                     </div>
                                 </div>
                                 
                                 <div className="flex justify-between items-end">
                                     <div>
                                         <label className="text-[10px] text-hp-gray block">Speed</label>
                                         <span className="text-[13px] font-semibold text-hp-dark">{jobStatus.printSpeed} m/min</span>
                                     </div>
                                     <div>
                                         <label className="text-[10px] text-hp-gray block text-right">Remaining</label>
                                         <span className="text-[13px] font-semibold text-hp-dark">
                                            {(jobStatus.totalLengthMeters - jobStatus.currentMeter).toFixed(1)}m
                                         </span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* 2. List Header */}
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-[14px] font-semibold text-hp-dark">DEFECT LOG</h3>
                    </div>

                    {/* 3. Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-white">
                        {errors.sort((a,b) => a.meter - b.meter).map((error) => (
                            <ErrorCard 
                                key={error.id} 
                                error={error} 
                                onClick={handleSelectError} 
                                isActive={false} 
                            />
                        ))}
                        <div className="text-center pt-4">
                            <button 
                                onClick={() => setIsWasteReportOpen(true)}
                                className="text-[12px] text-hp-blue font-medium hover:underline flex items-center gap-1 justify-center w-full"
                            >
                                <Icons.BarChart className="w-4 h-4" />
                                View Waste Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* MODALS */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentProfile={jobStatus.qualityProfile}
        onUpdateProfile={(profile) => setJobStatus(prev => ({...prev, qualityProfile: profile}))}
        thresholds={thresholds}
        onUpdateThresholds={setThresholds}
      />

      <TrainingModal 
        isOpen={isTrainingOpen}
        onClose={() => setIsTrainingOpen(false)}
      />

      <WasteReportModal
        isOpen={isWasteReportOpen}
        onClose={() => setIsWasteReportOpen(false)}
      />

    </div>
  );
};

export default App;