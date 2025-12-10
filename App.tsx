import React, { useState, useRef, useEffect } from 'react';
import LeftNavigation from './components/LeftNavigation';
import TopBar from './components/TopBar';
import PrintVisualizer from './components/PrintVisualizer';
import ErrorDetailsPanel from './components/ErrorDetailsPanel';
import TimelineRail from './components/TimelineRail';
import RealImageModal from './components/RealImageModal';
import ConfirmationModal from './components/ConfirmationModal';
import DashboardView from './components/DashboardView';
import SettingsModal from './components/SettingsModal';
import TrainingModal from './components/TrainingModal';
import WasteReportModal from './components/WasteReportModal';

import { 
  PrintError, 
  ErrorStatus, 
  PrintJobStatus,
  ViewType,
  ThresholdConfig,
  QualityProfileType
} from './types';
import { 
  MOCK_JOB_STATUS, 
  INITIAL_ERRORS, 
  SIMULATION_SPEED_METERS,
  MAX_SIMULATION_METERS,
  ROLL_LENGTH_METERS as INITIAL_ROLL_LENGTH
} from './constants';

const App: React.FC = () => {
  // --- View State ---
  const [currentView, setCurrentView] = useState<ViewType>('activeJob');

  // --- Data State ---
  const [errors, setErrors] = useState<PrintError[]>(INITIAL_ERRORS);
  const [jobStatus, setJobStatus] = useState<PrintJobStatus>(MOCK_JOB_STATUS);
  
  // --- Settings State ---
  const [qualityProfile, setQualityProfile] = useState<QualityProfileType>('High Quality (1200dpi)');
  const [thresholds, setThresholds] = useState<ThresholdConfig>({
      deltaE: 2.0,
      minDefectSizeMM: 1.0,
      highSeverityPercentage: 85
  });
  
  // --- Selection State ---
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  
  // --- Simulation State ---
  const [simulationMeters, setSimulationMeters] = useState(0);
  const [totalRollMeters, setTotalRollMeters] = useState(INITIAL_ROLL_LENGTH);
  
  // --- UI/Modal State ---
  const [viewingImageError, setViewingImageError] = useState<PrintError | null>(null);
  const [ignoreTarget, setIgnoreTarget] = useState<PrintError | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentScrollMeter, setCurrentScrollMeter] = useState(0);

  // --- Helpers ---
  const activeErrors = errors.filter(e => e.status === ErrorStatus.ACTIVE);
  const totalWasteCost = activeErrors.reduce((sum, e) => sum + (e.wasteCost || 0), 0);

  // --- Scroll Logic ---
  const handleScroll = () => {
    if (scrollContainerRef.current) {
        const { scrollTop, clientHeight } = scrollContainerRef.current;
        const pixelsPerMeter = 150;
        const centerPixel = scrollTop + (clientHeight / 2);
        setCurrentScrollMeter(Math.max(0, centerPixel / pixelsPerMeter));
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [currentView]); // Re-bind when view changes

  // --- Simulation Loop ---
  useEffect(() => {
    if (jobStatus.isPaused || !jobStatus.isPrinting) return;

    const interval = setInterval(() => {
        const speed = SIMULATION_SPEED_METERS;
        const newSimMeters = simulationMeters + speed;
        
        if (newSimMeters > MAX_SIMULATION_METERS) {
            setSimulationMeters(0);
            setTotalRollMeters(INITIAL_ROLL_LENGTH);
            // Reset simulation for demo purposes
        } else {
            setSimulationMeters(newSimMeters);
            setTotalRollMeters(prev => Math.max(prev, newSimMeters + 50));
            // Move errors down
            setErrors(prev => prev.map(e => ({
                ...e,
                meter: parseFloat((e.meter + speed).toFixed(2))
            })));
        }
    }, 3000);

    return () => clearInterval(interval);
  }, [simulationMeters, jobStatus.isPaused, jobStatus.isPrinting]);

  // --- Handlers ---
  const handleSelectError = (error: PrintError) => {
    setSelectedErrorId(error.id);
    // Auto scroll to error if we are in active job view
    if (currentView !== 'activeJob') setCurrentView('activeJob');
    
    // Use timeout to allow view switch render before scrolling
    setTimeout(() => {
        if (scrollContainerRef.current) {
            const pixelsPerMeter = 150;
            const targetTop = (error.meter * pixelsPerMeter) - (scrollContainerRef.current.clientHeight / 2);
            scrollContainerRef.current.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
    }, 50);
  };

  const handleConfirmIgnore = (reason: string, operatorId: string) => {
    if (ignoreTarget) {
        setErrors(prev => prev.map(e => e.id === ignoreTarget.id ? { 
            ...e, 
            status: ErrorStatus.DISMISSED, 
            ignoreReason: reason, 
            operatorId 
        } : e));
        setIgnoreTarget(null);
        setViewingImageError(null); // Close modal if open
    }
  };
  
  const handleReportError = (error: PrintError) => {
    setErrors(prev => prev.map(e => e.id === error.id ? { ...e, status: ErrorStatus.REPORTED } : e));
  };
  
  const handleStop = () => {
    setJobStatus(prev => ({ ...prev, isPrinting: false, isPaused: false }));
  };

  const handleMachineSelect = (machineId: string) => {
    setJobStatus(prev => ({ 
        ...prev, 
        machineId, 
        machineName: machineId.includes('LATEX') ? 'HP Latex R2000 Plus' : 'HP Stitch S1000'
    }));
  };

  const renderContent = () => {
      switch(currentView) {
          case 'dashboard':
              return <DashboardView onNavigate={setCurrentView} onSelectMachine={handleMachineSelect} />;
          case 'reports':
              return <WasteReportModal isOpen={true} isPage={true} />;
          case 'training':
              return <TrainingModal isOpen={true} isPage={true} />;
          case 'settings':
              return (
                <SettingsModal 
                    isOpen={true} 
                    isPage={true}
                    currentProfile={qualityProfile}
                    onUpdateProfile={setQualityProfile}
                    thresholds={thresholds}
                    onUpdateThresholds={setThresholds}
                />
              );
          case 'activeJob':
          default:
              return (
                 <div className="flex-1 flex overflow-hidden">
                     {/* Left Panel: Visualizer */}
                     <div className="flex-1 flex relative min-w-0">
                        <PrintVisualizer 
                            errors={activeErrors}
                            onSelectError={handleSelectError}
                            selectedErrorId={selectedErrorId}
                            offsetMeters={simulationMeters}
                            totalMeters={totalRollMeters}
                            scrollRef={scrollContainerRef}
                            selectedErrorIds={bulkSelectedIds}
                        />
                        <TimelineRail 
                           errors={activeErrors}
                           currentScrollMeter={currentScrollMeter}
                           onDotClick={handleSelectError}
                           totalMeters={totalRollMeters}
                           selectedErrorId={selectedErrorId}
                        />
                     </div>
        
                     {/* Right Panel: Details */}
                     <ErrorDetailsPanel 
                        errors={errors}
                        selectedErrorId={selectedErrorId}
                        onSelectError={handleSelectError}
                        onIgnore={setIgnoreTarget}
                        onReport={handleReportError}
                        onViewImage={setViewingImageError}
                        selectedIds={bulkSelectedIds}
                        onToggleBulkSelect={(id) => {
                            setBulkSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                        }}
                        onSelectAll={setBulkSelectedIds}
                     />
                 </div>
              );
      }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-brand-dark font-sans">
      
      {/* 1. Global Sidebar */}
      <LeftNavigation 
        currentView={currentView} 
        onNavigate={setCurrentView}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
         
         <TopBar 
            jobStatus={{...jobStatus, qualityProfile}}
            totalWasteCost={totalWasteCost}
            onPauseToggle={() => setJobStatus(prev => ({ ...prev, isPaused: !prev.isPaused }))}
            onStop={handleStop}
         />

         {renderContent()}
         
      </div>

      {/* Global Modals */}
      <RealImageModal 
        error={viewingImageError} 
        onClose={() => setViewingImageError(null)} 
        onIgnore={() => setIgnoreTarget(viewingImageError)}
      />

      <ConfirmationModal 
        isOpen={!!ignoreTarget}
        title="Ignore Defect?"
        onClose={() => setIgnoreTarget(null)}
        onConfirm={handleConfirmIgnore}
      />

    </div>
  );
};

export default App;