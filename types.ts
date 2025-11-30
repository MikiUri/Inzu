export enum ErrorSeverity {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
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

export interface PrintError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: string;
  meter: number; // Position on the roll in meters
  status: ErrorStatus;
  xPosition: number; // 0-100 percentage for horizontal position on roll
}

export interface PrintJobStatus {
  isPrinting: boolean;
  jobName: string;
  totalLengthMeters: number;
  currentMeter: number;
}