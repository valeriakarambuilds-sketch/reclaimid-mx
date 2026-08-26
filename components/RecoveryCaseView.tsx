import { RecoveryCase } from "@/lib/types";

export function RecoveryCaseView({ recoveryCase, onStartOver }: { recoveryCase: RecoveryCase; onStartOver: () => void }) {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-8">
        <div className="mb-3 inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">Recovery case ready</div>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Your recovery case</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Review this organized record before sharing it with an institution or authority.</p>
      </header>

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-900">
        AI can organize evidence, but it cannot confirm that a document or identity is authentic.
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Section title="Incident Summary"><p className="leading-7 text-slate-700">{recoveryCase.incidentSummary}</p></Section>
        <Section title="Evidence Collected">
          <dl className="space-y-3">{recoveryCase.evidenceCollected.map((item, index) => <div key={`${item.label}-${index}`}><dt className="text-sm font-semibold text-slate-500">{item.label}</dt><dd className="mt-1 text-slate-800">{item.value}</dd></div>)}</dl>
        </Section>
        <Section title="Timeline">
          <ol className="space-y-4">{recoveryCase.timeline.map((item, index) => <li className="border-l-2 border-brand-100 pl-4" key={`${item.date}-${index}`}><p className="text-sm font-semibold text-brand-700">{item.date || "Date not available"}</p><p className="mt-1 text-slate-700">{item.event}</p></li>)}</ol>
        </Section>
        <Section title="Information Still Missing"><List items={recoveryCase.missingInformation} empty="No missing information was identified." /></Section>
        <Section title="Recommended Next Steps" wide><List items={recoveryCase.nextSteps} numbered /></Section>
        <Section title="Limitations" wide><p className="leading-7 text-slate-700">{recoveryCase.limitations}</p></Section>
      </div>

      <button onClick={onStartOver} className="mt-8 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-700">Start Over</button>
    </main>
  );
}

function Section({ title, children, wide = false }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-card ${wide ? "md:col-span-2" : ""}`}><h2 className="mb-4 text-lg font-bold text-ink">{title}</h2>{children}</section>;
}

function List({ items, numbered = false, empty = "None listed." }: { items: string[]; numbered?: boolean; empty?: string }) {
  if (!items.length) return <p className="text-slate-500">{empty}</p>;
  const Tag = numbered ? "ol" : "ul";
  return <Tag className={`space-y-3 text-slate-700 ${numbered ? "list-decimal" : "list-disc"} pl-5`}>{items.map((item, index) => <li className="pl-1 leading-6" key={`${item}-${index}`}>{item}</li>)}</Tag>;
}
