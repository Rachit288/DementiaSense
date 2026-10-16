import Link from "next/link";
import { HEADLINE, SETS } from "@/lib/research";

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
          Academic ML prototype
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight">
          Score a table row. Do not diagnose a person.
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">{HEADLINE}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {SETS.map((s) => (
          <article key={s.id} className="panel p-5">
            <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">{s.short}</p>
            <h2 className="mt-1 text-[15px] font-medium">{s.name}</h2>
            <p className="mt-4 font-mono text-2xl tabular-nums">{s.testPrAuc.toFixed(3)}</p>
            <p className="text-[12px] text-[var(--muted)]">Held-out test PR-AUC · {s.algorithm}</p>
            <p className="mt-3 text-[13px] leading-5 text-[var(--muted)]">{s.meaning}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="panel p-5">
          <h2 className="text-[15px] font-medium">What the model can say</h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-6 text-[var(--muted)]">
            <li>A score from the saved sklearn pipeline for the inputs you submit.</li>
            <li>Whether that score sits above the training-set recall threshold (0.90 target).</li>
            <li>How Set A, B and C compared on a synthetic Kaggle table (n = 2,149).</li>
          </ul>
        </article>
        <article className="panel p-5">
          <h2 className="text-[15px] font-medium">What it cannot say</h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-6 text-[var(--muted)]">
            <li>Whether a real patient has Alzheimer’s disease.</li>
            <li>That Set A is a usable community screen — test PR-AUC 0.40, gain CI includes zero.</li>
            <li>That a high Set C score is “early detection”: MMSE/ADL are late, clinic-style inputs.</li>
          </ul>
        </article>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/assess" className="btn btn-primary">
          Start an assessment
        </Link>
        <Link href="/insights" className="btn btn-ghost">
          Read the experiment findings
        </Link>
      </div>
    </div>
  );
}
