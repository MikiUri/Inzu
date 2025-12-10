export enum ErrorSeverity {
  HIGH = 'High Severity',
  MEDIUM = 'Medium Severity',
  LOW = 'Low Severity'
}

export enum ErrorType {
  BANDING = 'Banding',
  SMEARS = 'Smears',
  GRAIN = 'Grain',
  INK_DROP = 'Ink Drop'
}

export enum ErrorStatus {
  ACTIVE = 'Active',
  DISMISSED = 'Dismissed'
}

export enum DefectOrigin {
  MACHINE = 'Machine',
  FILE = 'File'
}

export interface ThresholdConfig {
  deltaE: number; // Tolerance for color deviation
  minDefectSizeMM: number; // Minimum size to trigger detection
  highSeverityPercentage: number; // Threshold to classify as High Severity
}

export type QualityProfileType = 'High Quality (1200dpi)' | 'Standard (600dpi)' | 'Draft (300dpi)' | 'Eco Mode';

export interface PrintError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: string;
  meter: number; // Position on the roll in meters
  status: ErrorStatus;
  xPosition: number; // 0-100 percentage for horizontal position on roll
  
  // New Fields
  origin: DefectOrigin;
  deltaE?: number;
  probableCauses?: string[];
  correctiveActions?: string[];
  ignoreReason?: string;
  materialWasteMeters?: number;
  autoMarked?: boolean;
}

export interface PrintJobStatus {
  isPrinting: boolean;
  jobName: string;
  jobId: string;
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