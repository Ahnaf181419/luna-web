export type CandidateStatus = 
  | 'CONFIRMED ANCHOR'
  | 'HIGH CONFIDENCE'
  | 'PLAUSIBLE SAG'
  | 'INSPECTION BACKLOG'
  | 'DEFERRED DTM GAP';

export interface Candidate {
  id: string;
  siteId: string;
  siteName: string;
  lat: number;
  lon: number;
  morphology: string;
  score: number; // 0.00 to 1.00
  status: CandidateStatus;
  dtmProduct: string;
  resolution: string;
  depthMeters?: number;
  spanMeters?: number;
  cprRatio: number; // Circular Polarized Ratio anomaly contrast
  bouguerMGal: number; // GRAIL Bouguer anomaly in mGal
  isBacklog: boolean;
  notes: string;
}

export interface SiteDossier {
  id: string;
  name: string;
  lat: number;
  lon: number;
  dtmResolution: string;
  geologicalUnit: 'Mare' | 'Highland' | 'Impact Melt' | 'Polar';
  candidateCount: number;
  primaryAnchor?: boolean;
  description: string;
}

export interface GateCriterion {
  id: string;
  name: string;
  verdict: 'PASS' | 'PARTIAL' | 'DEMONSTRATION' | 'DEFERRED' | 'PENDING';
  detail: string;
}

export interface GateReport {
  id: string;
  title: string;
  status: 'PASSED' | 'DRAFT-FOR-REVIEW' | 'UPCOMING';
  sessionCompleted?: number;
  spend: number;
  criteria: GateCriterion[];
  summary: string;
}

export interface BudgetRecord {
  tier: string;
  allocation: number;
  spent: number;
  status: string;
  description: string;
}
