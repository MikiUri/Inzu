import { ErrorSeverity, ErrorStatus, ErrorType, PrintError, PrintJobStatus } from './types';

// Simulate a 50 meter roll (Viewport height)
export const ROLL_LENGTH_METERS = 50;
// Pixel height per meter for the visualization
export const PIXELS_PER_METER = 150; 

// Simulation Settings
export const SIMULATION_SPEED_METERS = 0.1; // 10cm per tick
export const ERROR_SPAWN_MIN_METERS = 6;
export const ERROR_SPAWN_MAX_METERS = 8;
export const MAX_SIMULATION_METERS = 80;

export const MOCK_JOB_STATUS: PrintJobStatus = {
  isPrinting: true,
  jobName: "Campaign_Summer_2025_XL_Banner",
  totalLengthMeters: 150, // Longer total job to allow simulation to run
  currentMeter: 42.5
};

export const INITIAL_ERRORS: PrintError[] = [
  {
    id: '1',
    type: ErrorType.BANDING,
    severity: ErrorSeverity.MEDIUM,
    timestamp: '10:32',
    meter: 38,
    status: ErrorStatus.ACTIVE,
    xPosition: 20
  },
  {
    id: '2',
    type: ErrorType.SMEARS,
    severity: ErrorSeverity.MEDIUM,
    timestamp: '10:02',
    meter: 28,
    status: ErrorStatus.ACTIVE,
    xPosition: 65
  },
  {
    id: '3',
    type: ErrorType.BANDING,
    severity: ErrorSeverity.HIGH,
    timestamp: '09:53',
    meter: 22,
    status: ErrorStatus.ACTIVE,
    xPosition: 40
  },
  {
    id: '4',
    type: ErrorType.GRAIN,
    severity: ErrorSeverity.MEDIUM,
    timestamp: '09:42',
    meter: 15,
    status: ErrorStatus.ACTIVE,
    xPosition: 80
  },
  {
    id: '5',
    type: ErrorType.SMEARS,
    severity: ErrorSeverity.MEDIUM,
    timestamp: '09:12',
    meter: 5,
    status: ErrorStatus.ACTIVE,
    xPosition: 30
  }
];