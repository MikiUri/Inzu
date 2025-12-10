import { ErrorSeverity, ErrorStatus, ErrorType, PrintError, PrintJobStatus, DefectOrigin, PredictiveAlert } from './types';

export const ROLL_LENGTH_METERS = 50;
export const PIXELS_PER_METER = 150; 

// Simulation Settings
export const SIMULATION_SPEED_METERS = 0.1; 
export const ERROR_SPAWN_MIN_METERS = 6;
export const ERROR_SPAWN_MAX_METERS = 8;
export const MAX_SIMULATION_METERS = 80;

export const MOCK_JOB_STATUS: PrintJobStatus = {
  isPrinting: true,
  isPaused: false,
  jobName: "Campaign_Summer_2025_XL_Banner",
  jobId: "JOB-8823",
  machineId: "LATEX-01",
  machineName: "HP Latex R2000 Plus",
  totalLengthMeters: 150, 
  currentMeter: 42.5,
  printSpeed: 6.2, 
  qualityProfile: "High Quality (1200dpi)"
};

export const MOCK_ALERTS: PredictiveAlert[] = [
  { id: '1', title: 'Banding Trend', trend: '+15% over 4h', severity: 'warning' },
];

export const INITIAL_ERRORS: PrintError[] = [
  {
    id: '1',
    type: ErrorType.BANDING,
    severity: ErrorSeverity.MEDIUM,
    timestamp: '10:32',
    meter: 38,
    status: ErrorStatus.ACTIVE,
    xPosition: 20,
    origin: DefectOrigin.MACHINE,
    deltaE: 2.1,
    wasteCost: 12.50,
    wasteMeters: 0.5,
    probableCauses: ['Printhead misalignment'],
  },
  {
    id: '2',
    type: ErrorType.SMEARS,
    severity: ErrorSeverity.LOW,
    timestamp: '10:02',
    meter: 28,
    status: ErrorStatus.ACTIVE,
    xPosition: 65,
    origin: DefectOrigin.MACHINE,
    deltaE: 0.5,
    wasteCost: 4.20,
    wasteMeters: 0.2
  },
  {
    id: '3',
    type: ErrorType.SCRATCH,
    severity: ErrorSeverity.CRITICAL,
    timestamp: '09:53',
    meter: 22,
    status: ErrorStatus.ACTIVE,
    xPosition: 40,
    origin: DefectOrigin.MACHINE,
    deltaE: 4.5,
    wasteCost: 45.00,
    wasteMeters: 3.0,
    correctiveActions: ['Stop printer immediately'],
  },
  {
    id: '4',
    type: ErrorType.GRAIN,
    severity: ErrorSeverity.MEDIUM,
    timestamp: '09:42',
    meter: 15,
    status: ErrorStatus.ACTIVE,
    xPosition: 80,
    origin: DefectOrigin.FILE,
    deltaE: 0.2,
    wasteCost: 0,
    wasteMeters: 0
  },
  {
    id: '5',
    type: ErrorType.MISREGISTRATION,
    severity: ErrorSeverity.HIGH,
    timestamp: '09:12',
    meter: 5,
    status: ErrorStatus.ACTIVE,
    xPosition: 30,
    origin: DefectOrigin.MACHINE,
    deltaE: 2.8,
    wasteCost: 8.50,
    wasteMeters: 0.4
  }
];