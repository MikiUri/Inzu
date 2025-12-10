

export enum ErrorSeverity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum ErrorType {
  BANDING = 'Banding',
  NOZZLE_DROPOUT = 'Nozzle drop-out',
  HEAD_STRIKE = 'Head strikes/scratches',
  MEDIA_CREASE = 'Media wrinkles/creases',
  SUBSTRATE_CONTAMINATION = 'Substrate contamination',
  INK_ADHESION = 'Ink adhesion issues',
  REGISTRATION = 'Registration errors',
  GRADIENT_STEPPING = 'Gradient stepping',
  SMEARS = 'Ink Smears', // Legacy support
  GRAIN = 'Grain/Noise', // Legacy support
  INK_DROP = 'Ink Drop', // Legacy support
  SCRATCH = 'Scratch', // Legacy support
  MISREGISTRATION = 'Misregistration' // Legacy support
}

export enum ErrorStatus {
  ACTIVE = 'Active',
  DISMISSED = 'Dismissed',
  REPORTED = 'Reported'
}

export enum DefectOrigin {
  MACHINE = 'Machine',
  FILE = 'File'
}

export interface ThresholdConfig {
  deltaE: number; 
  minDefectSizeMM: number; 
  highSeverityPercentage: number; 
}

export type QualityProfileType = 'High Quality (1200dpi)' | 'Standard (600dpi)' | 'Draft (300dpi)' | 'Eco Mode';

export interface DashboardWidgetConfig {
  efficiency: boolean;
  activeJobs: boolean;
  defects: boolean;
  cost: boolean;
}

export interface PrintError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: string; // HH:MM format
  meter: number; // Position on the roll in meters
  status: ErrorStatus;
  xPosition: number; // 0-100 percentage
  
  origin: DefectOrigin;
  deltaE?: number;
  wasteCost?: number; // Cost in Euros
  wasteMeters?: number; // Length wasted
  
  // New Fields
  wasteAmount?: number; // Linear meters
  associatedPrinter?: string;
  operatorShift?: string;
  jobId?: string;

  probableCauses?: string[];
  correctiveActions?: string[];
  ignoreReason?: string;
  operatorId?: string;
  autoMarked?: boolean;
}

export interface PrintJobStatus {
  isPrinting: boolean;
  isPaused: boolean;
  jobName: string;
  jobId: string;
  machineId: string;
  machineName: string;
  totalLengthMeters: number;
  currentMeter: number;
  printSpeed: number; // m/min
  qualityProfile: QualityProfileType;
}

export interface PredictiveAlert {
  id: string;
  title: string;
  trend: string;
  severity: 'warning' | 'info';
}

export type ViewType = 'dashboard' | 'activeJob' | 'reports' | 'training' | 'settings';

export interface Machine {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'paused' | 'error';
}