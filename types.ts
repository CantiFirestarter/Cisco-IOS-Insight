
export enum Severity {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  INFO = 'INFO'
}

export interface AnalysisIssue {
  severity: Severity;
  category: string;
  title: string;
  description: string;
  remediation: string;
  iosVersions?: string[]; // e.g., ["IOS XE 17.9.4", "IOS 15.6(2)T"]
  affectedConfig?: string;
  affectedDevices?: string[];
}

export interface SuccessfulCheck {
  category: string;
  title: string;
  description: string;
  validatedConfig: string;
  iosVersions?: string[]; // e.g., ["IOS XE 17.x", "IOS 15.x"]
  affectedDevices: string[];
}

export interface BestPractice {
  category: string;
  title: string;
  rationale: string;
  recommendation: string;
}

export interface VerificationStep {
  title: string;
  command: string;
  expectedResult: string;
  category: string;
  affectedDevices: string[];
}

export interface AnalysisResult {
  summary: string;
  deviceCount: number;
  detectedDevices: string[];
  detectedPlatforms: string[]; // Unique list of Cisco OS types and versions detected
  issues: AnalysisIssue[];
  networkWideIssues: AnalysisIssue[];
  successfulChecks: SuccessfulCheck[];
  bestPractices: BestPractice[];
  verificationSteps: VerificationStep[];
  securityScore: number;
}

export interface ConfigFile {
  name: string;
  content: string;
  id: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AppState {
  files: ConfigFile[];
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
