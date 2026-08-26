export type ExtractedEvidence = {
  imageContainsRelevantFinancialEvidence: boolean;
  institution: string;
  date: string;
  referenceNumber: string;
  amount: string;
  incidentType: string;
  notes: string;
};

export type RecoveryCase = {
  incidentSummary: string;
  evidenceCollected: Array<{ label: string; value: string }>;
  timeline: Array<{ date: string; event: string }>;
  missingInformation: string[];
  nextSteps: string[];
  limitations: string;
};
