import { NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/gemini";
import { ExtractedEvidence, hasRelevantEvidence } from "@/lib/types";
import { validateDescription, validateImage } from "@/lib/validation";

export const runtime = "nodejs";

const schema = {
  type: "OBJECT",
  properties: {
    institution: { type: "STRING" }, date: { type: "STRING" },
    referenceNumber: { type: "STRING" }, amount: { type: "STRING" },
    incidentType: { type: "STRING" }, notes: { type: "STRING" },
  },
  required: ["institution", "date", "referenceNumber", "amount", "incidentType", "notes"],
};

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const description = form.get("description");
    const image = form.get("image");
    const error = validateDescription(description) || validateImage(image);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const file = image as File;
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const prompt = `You help organize a potential unauthorized-financial-activity report in Mexico. Extract only information visible in the uploaded image, interpreted alongside the user's description. Never decide whether fraud occurred or whether a document or identity is authentic. Use empty strings for information not visible. Preserve dates, currency, and reference numbers as shown. Use cautious wording in notes (for example, "appears to show"). Return only the requested JSON.\n\nUser description:\n${String(description).trim()}`;
    const result = await generateStructuredJson<ExtractedEvidence>([
      { text: prompt },
      { inlineData: { mimeType: file.type, data: base64 } },
    ], schema);
    return NextResponse.json({
      evidence: result,
      hasRelevantEvidence: hasRelevantEvidence(result),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not analyze the evidence.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
