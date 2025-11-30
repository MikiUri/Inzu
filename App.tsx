import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './components/Icons';
import VirtualRoll from './components/VirtualRoll';
import TimelineRail from './components/TimelineRail';
import ErrorCard from './components/ErrorCard';
import ErrorModal from './components/ErrorModal';
import { 
  PrintError, 
  ErrorStatus, 
  PrintJobStatus,
  ErrorType,
  ErrorSeverity
} from './types';
import { 
  MOCK_JOB_STATUS, 
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
  const [modalOpen, setModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Simulation State
  const [simulationMeters, setSimulationMeters] = useState(0);
  const [nextErrorAt, setNextErrorAt] = useState<number>(6); // Distance until next error
  const [totalRollMeters, setTotalRollMeters] = useState(INITIAL_ROLL_LENGTH);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nextErrorIdRef = useRef<number>(6); // Start IDs from 6

  // Derived
  const selectedError = errors.find(e => e.id === selectedErrorId);
  const activeErrorCount = errors.filter(e => e.status === ErrorStatus.ACTIVE).length;

  // Constants for layout calculations
  // Header is h-64 (256px), Roll Container margin is -mt-32 (-128px)
  const ROLL_START_OFFSET_PX = 128; 

  // Simulation Loop
  useEffect(() => {
    // 3 Seconds per tick (Slower speed)
    const interval = setTimeout(() => {
        // Calculate potential new state
        const speed = SIMULATION_SPEED_METERS;
        const newSimMeters = simulationMeters + speed;
        
        // Check for Reset Condition (if roll has gone too far)
        // We use the position of the furthest error as a proxy for "active" roll area to watch
        const maxErrorMeter = Math.max(...errors.map(e => e.meter), 0);
        
        if (maxErrorMeter > MAX_SIMULATION_METERS) {
            // --- RESET SIMULATION ---
            setSimulationMeters(0);
            setErrors(INITIAL_ERRORS);
            setTotalRollMeters(INITIAL_ROLL_LENGTH);
            setNextErrorAt(6);
            nextErrorIdRef.current = 6;
            
        } else {
            // --- ADVANCE SIMULATION ---
            
            // 1. Move Errors Down
            const updatedErrors = errors.map(e => ({
                ...e,
                meter: parseFloat((e.meter + speed).toFixed(2))
            }));
            
            // 2. Spawn New Errors if needed
            let newNextErrorAt = nextErrorAt - speed;
            if (newNextErrorAt <= 0) {
                const newId = nextErrorIdRef.current.toString();
                nextErrorIdRef.current += 1;

                const newError: PrintError = {
                    id: newId,
                    type: Math.random() > 0.5 ? ErrorType.BANDING : (Math.random() > 0.5 ? ErrorType.SMEARS : ErrorType.GRAIN),
                    severity: Math.random() > 0.7 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    meter: 0, // Appears at the printer head (top)
                    status: ErrorStatus.ACTIVE,
                    xPosition: Math.floor(Math.random() * 80) + 10 // Random X between 10-90%
                };
                
                updatedErrors.push(newError);
                // Reset spawn timer (Random 6-8m)
                newNextErrorAt = Math.random() * (ERROR_SPAWN_MAX_METERS - ERROR_SPAWN_MIN_METERS) + ERROR_SPAWN_MIN_METERS;
            }

            // 3. Update State
            setSimulationMeters(newSimMeters);
            setErrors(updatedErrors);
            setNextErrorAt(newNextErrorAt);
            
            // Grow the roll length to accommodate printing
            setTotalRollMeters(INITIAL_ROLL_LENGTH + newSimMeters);

            // Update Job Progress
            setJobStatus(prev => ({
                ...prev,
                currentMeter: prev.currentMeter + speed
            }));
        }

    }, 3000); // 3 seconds tick

    return () => clearTimeout(interval);
  }, [simulationMeters, errors, nextErrorAt]);

  // Scroll Handler
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

  // Attach scroll listener
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
        scrollContainerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
  };

  // Actions
  const handleCardClick = (error: PrintError) => {
    setSelectedErrorId(error.id);
    scrollToError(error);
    setModalOpen(true);
  };

  const handleRailDotClick = (error: PrintError) => {
    setSelectedErrorId(error.id);
    scrollToError(error);
  };

  const handleErrorDotClick = (error: PrintError) => {
    setSelectedErrorId(error.id);
    setModalOpen(true);
  };

  const handleToggleIgnore = () => {
    if (selectedErrorId) {
        setErrors(prev => prev.map(e => 
            e.id === selectedErrorId 
            ? { ...e, status: e.status === ErrorStatus.DISMISSED ? ErrorStatus.ACTIVE : ErrorStatus.DISMISSED } 
            : e
        ));
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-slate-800 overflow-hidden font-sans">
      
      {/* Global Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 h-16 flex items-center px-6 z-50 shadow-sm justify-between">
          <div className="flex items-center gap-4">
              {/* HP Logo */}
              <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" 
                  alt="HP Logo" 
                  className="w-10 h-10 shrink-0 drop-shadow-sm"
              />
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-slate-800 tracking-tight">AI camera visualizator</h1>
          </div>
          <div className="flex items-center text-sm text-gray-500 gap-4">
               <span className="hidden md:inline-block font-mono text-slate-400">V1.1</span>
          </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-1 h-full overflow-hidden">
        
        {/* LEFT PANEL: Virtual Roll */}
        <div className="flex-grow relative h-full flex min-w-0">
            <VirtualRoll 
                errors={errors} 
                onErrorClick={handleErrorDotClick}
                scrollRef={scrollContainerRef}
                activeErrorId={selectedErrorId}
                offsetMeters={simulationMeters}
                totalMeters={totalRollMeters}
            />

            {/* Go To Top CTA */}
            <div className={`absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-40 transition-all duration-500 transform ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <button 
                    onClick={scrollToTop}
                    className="pointer-events-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group font-bold text-sm tracking-wide"
                >
                    <Icons.ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                    GO TO TOP
                </button>
            </div>
        </div>

        {/* CENTER RAIL: Timeline Indicator */}
        <TimelineRail 
            errors={errors}
            currentScrollMeter={currentScrollMeter}
            onDotClick={handleRailDotClick}
            totalMeters={totalRollMeters}
        />

        {/* RIGHT PANEL: Error List */}
        <div className="w-[420px] bg-white flex flex-col border-l border-gray-200 shadow-2xl z-40">
            
            {/* Top Dashboard Header Area */}
            <div className="bg-white border-b border-gray-100 shadow-sm relative z-20">
                {/* 1. Status Bar */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
                     <div className="flex items-center gap-3 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                         <div className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                         </div>
                         <span className="font-bold text-green-800 text-xs tracking-wide">PRINTING</span>
                     </div>
                     
                     <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${activeErrorCount > 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                         <Icons.Alert className="w-4 h-4" />
                         <span className="text-xs font-semibold uppercase mr-1">Defects</span>
                         <span className="font-bold text-lg leading-none">{activeErrorCount}</span>
                     </div>
                </div>

                {/* 2. Job Information */}
                <div className="p-6">
                    <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Active Job</h2>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                 <h3 className="text-base font-bold text-slate-800 leading-tight line-clamp-1">{jobStatus.jobName}</h3>
                                 <p className="text-[10px] text-slate-400 mt-1 font-mono">ID: #8823-XL-09</p>
                            </div>
                            <Icons.Printer className="text-slate-300 w-5 h-5" />
                        </div>
                        
                        {/* Progress */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                                <span>Progress</span>
                                <span>{Math.round((jobStatus.currentMeter / jobStatus.totalLengthMeters) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                                    style={{ width: `${(jobStatus.currentMeter / jobStatus.totalLengthMeters) * 100}%`}}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
                                <span>{Math.floor(jobStatus.currentMeter)}m / {jobStatus.totalLengthMeters}m</span>
                                <span>Speed: 6m/min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div className="px-6 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between backdrop-blur">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Defect Log</span>
                <span className="text-[10px] text-gray-400">Total: {errors.length}</span>
            </div>

            {/* Scrollable List of Cards */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                {errors.sort((a,b) => a.meter - b.meter).map((error) => (
                    <ErrorCard 
                        key={error.id} 
                        error={error} 
                        onClick={handleCardClick}
                        isActive={selectedErrorId === error.id}
                    />
                ))}
                
                <div className="h-10 text-center text-xs text-gray-300 py-4">End of list</div>
            </div>
        </div>

      </div>

      {/* Modal Overlay */}
      {modalOpen && selectedError && (
        <ErrorModal 
            error={selectedError}
            onClose={handleCloseModal}
            onToggleIgnore={handleToggleIgnore}
            position={{ x: 0, y: 0 }} 
        />
      )}
    </div>
  );
};

export default App;