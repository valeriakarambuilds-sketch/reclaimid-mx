import { NextResponse } from "next/server";
import { generateStructuredJson } from "@/lib/gemini";
import { ExtractedEvidence } from "@/lib/types";
import { validateDescription, validateImage } from "@/lib/validation";

export const runtime = "nodejs";

const schema = {
  type: "OBJECT",
  properties: {
    imageContainsRelevantFinancialEvidence: { type: "BOOLEAN" },
    institution: { type: "STRING" }, date: { type: "STRING" },
    referenceNumber: { type: "STRING" }, amount: { type: "STRING" },
    incidentType: { type: "STRING" }, notes: { type: "STRING" },
  },
  required: ["imageContainsRelevantFinancialEvidence", "institution", "date", "referenceNumber", "amount", "incidentType", "notes"],
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
    const prompt = `You help organize a potential unauthorized-financial-activity report in Mexico. Analyze the uploaded image and return the requested JSON.

Determine imageContainsRelevantFinancialEvidence ONLY from content visibly present in the uploaded image. The user's written description must NOT be used to decide whether the image itself contains financial evidence. Do not populate institution, date, referenceNumber, amount, or incidentType from the user's description. Populate each of those fields only when the corresponding information is visibly present in the uploaded image. If the image is unrelated to banking, transactions, accounts, receipts, statements, or financial notifications, set imageContainsRelevantFinancialEvidence to false and leave institution, date, referenceNumber, amount, and incidentType empty. Do not use the description, notes, placeholders, assumptions, or inferred context as financial evidence.

Never decide whether fraud occurred or whether a document or identity is authentic. Use empty strings for information not visible. Preserve dates, currency, and reference numbers as shown. Notes may cautiously describe only relevant visible image content (for example, "appears to show"); notes must not affect imageContainsRelevantFinancialEvidence. Return only the requested JSON.

The user's written description is intentionally not included in this analysis because it is not evidence about the image's visible content.`;
    const result = await generateStructuredJson<ExtractedEvidence>([
      { text: prompt },
      { inlineData: { mimeType: file.type, data: base64 } },
    ], schema);
    const evidence = result.imageContainsRelevantFinancialEvidence
      ? result
      : { ...result, institution: "", date: "", referenceNumber: "", amount: "", incidentType: "" };
    return NextResponse.json({ evidence });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not analyze the evidence.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
