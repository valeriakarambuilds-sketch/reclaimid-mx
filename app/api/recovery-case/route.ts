import { NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/gemini";
import { ExtractedEvidence, hasMeaningfulFinancialEvidence, RecoveryCase } from "@/lib/types";
import { validateDescription } from "@/lib/validation";

const schema = {
  type: "OBJECT",
  properties: {
    incidentSummary: { type: "STRING" },
    evidenceCollected: { type: "ARRAY", items: { type: "OBJECT", properties: { label: { type: "STRING" }, value: { type: "STRING" } }, required: ["label", "value"] } },
    timeline: { type: "ARRAY", items: { type: "OBJECT", properties: { date: { type: "STRING" }, event: { type: "STRING" } }, required: ["date", "event"] } },
    missingInformation: { type: "ARRAY", items: { type: "STRING" } },
    nextSteps: { type: "ARRAY", items: { type: "STRING" } },
    limitations: { type: "STRING" },
  },
  required: ["incidentSummary", "evidenceCollected", "timeline", "missingInformation", "nextSteps", "limitations"],
};

function cleanEvidence(value: unknown): ExtractedEvidence | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const keys: Array<keyof ExtractedEvidence> = ["institution", "date", "referenceNumber", "amount", "incidentType", "notes"];
  const output = {} as ExtractedEvidence;
  for (const key of keys) {
    if (typeof input[key] !== "string" || input[key].length > 1000) return null;
    output[key] = input[key].trim();
  }
  return output;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const descriptionError = validateDescription(body?.description);
    const evidence = cleanEvidence(body?.evidence);
    if (descriptionError) return NextResponse.json({ error: descriptionError }, { status: 400 });
    if (!evidence) return NextResponse.json({ error: "Review the extracted evidence before continuing." }, { status: 400 });
    if (!hasMeaningfulFinancialEvidence(evidence)) {
      return NextResponse.json({ error: "No relevant financial evidence was detected. Upload another image and try again." }, { status: 400 });
    }

    const prompt = `Create a concise, structured recovery case for a person in Mexico based only on the supplied description and reviewed fields. Do not claim fraud, identity theft, document authenticity, or account falsity as certain. Clearly distinguish user-reported details from image-extracted details. Use cautious phrases such as "appears to show" and "the evidence suggests". Recommended next steps may include contacting the institution through verified channels, preserving records, requesting a folio, checking credit reports, and considering official Mexican consumer/financial authorities when relevant. Do not invent dates, facts, contacts, deadlines, or legal conclusions. State limitations clearly. Return only the requested JSON.\n\nUser description:\n${body.description.trim()}\n\nReviewed evidence fields:\n${JSON.stringify(evidence)}`;
    const result = await generateStructuredJson<RecoveryCase>([{ text: prompt }], schema);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the recovery case.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
