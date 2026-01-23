
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
  affectedConfig?: string;
  affectedDevices?: string[];
}

export interface SuccessfulCheck {
  category: string;
  title: string;
  description: string;
  validatedConfig: string;
  affectedDevices: string[];
}

export interface BestPractice {
  category: string;
  title: string;
  rationale: string;
  recommendation: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface RealTimeVulnerability {
  id: string;
  title: string;
  summary: string;
  url: string;
}

export interface AnalysisResult {
  summary: string;
  deviceCount: number;
  detectedDevices: string[];
  issues: AnalysisIssue[];
  networkWideIssues: AnalysisIssue[];
  successfulChecks: SuccessfulCheck[];
  bestPractices: BestPractice[];
  securityScore: number;
  topologySummary: string;
  realTimeVulnerabilities: RealTimeVulnerability[];
  sources: GroundingSource[];
}

export interface ConfigFile {
  name: string;
  content: string;
  id: string;
}

export interface AppState {
  files: ConfigFile[];
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
