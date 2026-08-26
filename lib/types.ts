export type ExtractedEvidence = {
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

export function hasMeaningfulFinancialEvidence(evidence: ExtractedEvidence): boolean {
  return [
    evidence.institution,
    evidence.referenceNumber,
    evidence.amount,
    evidence.incidentType,
  ].some((value) => value.trim().length > 0);
}
