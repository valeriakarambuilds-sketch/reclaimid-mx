"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { RecoveryCaseView } from "@/components/RecoveryCaseView";
import { Spinner } from "@/components/Spinner";
import { ExtractedEvidence, hasMeaningfulFinancialEvidence, RecoveryCase } from "@/lib/types";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/validation";

const emptyEvidence: ExtractedEvidence = { institution: "", date: "", referenceNumber: "", amount: "", incidentType: "", notes: "" };
const fields: Array<{ key: keyof ExtractedEvidence; label: string; placeholder: string }> = [
  { key: "institution", label: "Financial institution", placeholder: "e.g. Banco Ejemplo" },
  { key: "date", label: "Date", placeholder: "As shown in the evidence" },
  { key: "referenceNumber", label: "Reference number", placeholder: "Transaction or account reference" },
  { key: "amount", label: "Amount", placeholder: "Include the currency if visible" },
  { key: "incidentType", label: "Type of incident", placeholder: "e.g. Unrecognized transaction" },
];

export default function Home() {
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [evidence, setEvidence] = useState<ExtractedEvidence | null>(null);
  const [evidenceDetected, setEvidenceDetected] = useState(false);
  const [recoveryCase, setRecoveryCase] = useState<RecoveryCase | null>(null);
  const [loading, setLoading] = useState<"analyze" | "case" | null>(null);
  const [error, setError] = useState("");
  const hasRelevantEvidence = evidence !== null && evidenceDetected;

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = event.target.files?.[0] || null;
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { setError("Upload a JPG, PNG, WEBP, HEIC, or HEIF image."); event.target.value = ""; return; }
    if (file.size > MAX_FILE_SIZE) { setError("The image must be 5 MB or smaller."); event.target.value = ""; return; }
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setEvidence(null);
    setEvidenceDetected(false);
  }

  async function analyze(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!description.trim()) { setError("Describe what happened before continuing."); return; }
    if (!imageFile) { setError("Choose an evidence image before continuing."); return; }
    setLoading("analyze");
    try {
      const form = new FormData();
      form.append("description", description.trim());
      form.append("image", imageFile);
      const response = await fetch("/api/extract", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not analyze the evidence.");
      setEvidence(data);
      setEvidenceDetected(hasMeaningfulFinancialEvidence(data));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not analyze the evidence."); }
    finally { setLoading(null); }
  }

  async function createCase() {
    if (!evidence || !description.trim()) return;
    setError(""); setLoading("case");
    try {
      const response = await fetch("/api/recovery-case", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: description.trim(), evidence }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create the recovery case.");
      setRecoveryCase(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create the recovery case."); }
    finally { setLoading(null); }
  }

  function startOver() {
    if (preview) URL.revokeObjectURL(preview);
    setDescription(""); setImageFile(null); setPreview(""); setEvidence(null); setEvidenceDetected(false); setRecoveryCase(null); setError("");
  }

  if (recoveryCase) return <RecoveryCaseView recoveryCase={recoveryCase} onStartOver={startOver} />;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-lg shadow-blue-200">R</div>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">ReclaimID MX</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">Turn scattered fraud evidence into a clear recovery case.</p>
      </header>

      <div className="mb-6 flex items-center justify-center gap-3 text-sm font-semibold"><span className="rounded-full bg-brand-600 px-3 py-1 text-white">1</span><span className="text-ink">Describe & analyze</span><span className="h-px w-10 bg-slate-300"/><span className="rounded-full bg-slate-200 px-3 py-1 text-slate-500">2</span><span className="text-slate-500">Recovery case</span></div>

      <form onSubmit={analyze} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-5 flex items-start gap-4"><Step number="1"/><div><h2 className="text-xl font-bold text-ink">What happened?</h2><p className="mt-1 text-sm text-slate-500">Describe what you noticed and why it concerns you.</p></div></div>
          <label htmlFor="description" className="sr-only">Incident description</label>
          <textarea id="description" value={description} onChange={(e) => { setDescription(e.target.value); setEvidence(null); }} maxLength={5000} rows={6} placeholder="Example: I noticed an account on my credit report that I don't recognize. I contacted the institution on August 12 and saved this screenshot…" className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-brand-500" />
          <p className="mt-2 text-right text-xs text-slate-400">{description.length} / 5,000</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="mb-5 flex items-start gap-4"><Step number="2"/><div><h2 className="text-xl font-bold text-ink">Add Evidence</h2><p className="mt-1 text-sm text-slate-500">Upload one screenshot or photo. It is analyzed temporarily and not stored by this app.</p></div></div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-brand-500 hover:bg-brand-50">
            <span className="font-semibold text-brand-700">Choose an image</span><span className="mt-1 text-sm text-slate-500">PNG, JPG, WEBP or another image format · up to 5 MB</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={chooseImage} className="sr-only" />
          </label>
          {preview && <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"><Image src={preview} alt="Preview of selected evidence" width={1000} height={600} unoptimized className="max-h-80 w-full object-contain"/><p className="border-t border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">{imageFile?.name}</p></div>}
        </section>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800">{error}</div>}
        <button disabled={!!loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">{loading === "analyze" && <Spinner/>}{loading === "analyze" ? "Analyzing evidence…" : "Analyze Evidence"}</button>
      </form>

      {evidence && <section className={`mt-8 rounded-2xl border bg-white p-6 shadow-card sm:p-8 ${hasRelevantEvidence ? "border-brand-100" : "border-amber-200"}`}>
        {hasRelevantEvidence ? (
          <div className="mb-6"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">Analysis complete</span><h2 className="mt-3 text-2xl font-bold text-ink">Review extracted information</h2><p className="mt-2 text-sm text-slate-500">The following information was extracted from the uploaded image. Correct anything that is incomplete or inaccurate.</p></div>
        ) : (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5" role="status"><span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">Review needed</span><h2 className="mt-3 text-xl font-bold text-amber-950">No relevant financial evidence detected.</h2><p className="mt-2 text-sm leading-6 text-amber-900">The uploaded image does not appear to contain usable financial evidence. Please upload another screenshot or document.</p></div>
        )}
        <div className="grid gap-5 sm:grid-cols-2">{fields.map(({ key, label, placeholder }) => <label className="block" key={key}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input value={evidence[key]} onChange={(e) => setEvidence({ ...evidence, [key]: e.target.value })} placeholder={placeholder} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500" /></label>)}</div>
        <label className="mt-5 block"><span className="mb-2 block text-sm font-semibold text-slate-700">Analysis notes</span><textarea value={evidence.notes} onChange={(e) => setEvidence({ ...evidence, notes: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-brand-500" /></label>
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">This extraction organizes visible details only. It does not verify authenticity or confirm fraud.</div>
        {hasRelevantEvidence && <button type="button" onClick={createCase} disabled={!!loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">{loading === "case" && <Spinner/>}{loading === "case" ? "Creating recovery case…" : "Create Recovery Case"}</button>}
      </section>}
      <footer className="mt-10 text-center text-xs leading-5 text-slate-500">ReclaimID MX helps organize user-provided information. It does not verify identity, authenticate documents, or determine whether fraud occurred.</footer>
    </main>
  );
}

function Step({ number }: { number: string }) { return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">{number}</span>; }
