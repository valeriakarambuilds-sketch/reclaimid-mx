type Schema = Record<string, unknown>;
type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

export async function generateStructuredJson<T>(parts: GeminiPart[], schema: Schema): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini is not configured. Add GEMINI_API_KEY to the server environment.");

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error("Gemini API error", response.status, detail.slice(0, 500));
    throw new Error("The evidence service could not complete the request. Please try again.");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") throw new Error("The evidence service returned an unexpected response.");

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("The evidence service returned invalid structured data.");
  }
}
