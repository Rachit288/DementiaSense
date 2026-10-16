"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import demos from "@/lib/demos.json";
import { MODE_COPY, type Mode } from "@/lib/fields";
import { loadResult, type StoredResult } from "@/lib/session";

function pct(p: number) {
  return `${Math.round(p * 100)}%`;
}

export function Results() {
  const [stored, setStored] = useState<StoredResult | null>(null);
  useEffect(() => {
    setStored(loadResult());
  }, []);

  if (!stored) {
    return (
      <div className="panel max-w-xl p-6">
        <h1 className="text-[18px] font-semibold">No result yet</h1>
        <p className="mt-2 text-[13px] text-[var(--muted)]">
          Run an assessment first. Nothing is hardcoded on this page.
        </p>
        <Link href="/assess" className="btn btn-primary mt-4">
          New assessment
        </Link>
      </div>
    );
  }

  const { assessment, response } = stored;
  const primary = response.primary;
  if (!primary) {
    return (
      <div className="panel p-6 text-[13px] text-red-200">
        The API returned no primary score. {response.error}
      </div>
    );
  }

  const demo = demos.find((d) => d.id === assessment.patientId);
  const cut = pct(primary.threshold);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">Patient results</p>
          <h1 className="text-[22px] font-semibold tracking-tight">
            {assessment.patientName}
            {assessment.demo ? (
              <span className="ml-2 font-mono text-[12px] font-normal text-[var(--muted)]">
                {assessment.patientId}
              </span>
            ) : null}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/assess" className="btn btn-ghost">
            Edit assessment
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="panel grid place-items-center p-6">
          <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">Model score</p>
          <p className="mt-3 text-4xl font-semibold tabular-nums">{pct(primary.probability)}</p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">P(label = 1) from {primary.algorithm}</p>
        </div>
        <div className="panel p-6">
          <span
            className={`rounded-full px-2.5 py-1 text-[12px] ${
              primary.flagged
                ? "bg-[var(--warn-soft)] text-[var(--warn)]"
                : "bg-emerald-950/40 text-[var(--ok)]"
            }`}
          >
            {primary.flagged ? "Above threshold · refer in this demo" : "Below threshold · monitor in this demo"}
          </span>
          <p className="mt-4 text-[15px] leading-6">
            {primary.flagged
              ? `The saved ${primary.algorithm} on ${MODE_COPY[primary.mode].title} estimated ${pct(primary.probability)}, which is at or above the ${cut} cut-off chosen on training out-of-fold scores to target 90% recall.`
              : `The saved ${primary.algorithm} estimated ${pct(primary.probability)}, below the ${cut} cut-off. In this prototype that maps to routine monitoring — not a medical all-clear.`}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-[12px] text-[var(--muted)] sm:grid-cols-4">
            <div>
              <dt>Input set</dt>
              <dd className="text-[var(--foreground)]">{primary.mode}</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd className="text-[var(--foreground)]">{primary.algorithm}</dd>
            </div>
            <div>
              <dt>Threshold</dt>
              <dd className="text-[var(--foreground)]">{primary.threshold.toFixed(3)}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd className="text-[var(--foreground)]">joblib Stage 11</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="panel p-5">
          <h2 className="text-[14px] font-medium">What this result means</h2>
          <p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">
            It is a ranking score for one row on a synthetic educational table. The threshold was
            not chosen on the test set. For Set A, held-out PR-AUC is 0.40 and the bootstrap CI of
            the gain over the baseline includes zero — so a “refer” flag here is mostly a high-recall
            operating point, not evidence of disease.
          </p>
        </article>
        <article className="panel p-5">
          <h2 className="text-[14px] font-medium">What this result does not mean</h2>
          <p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">
            It is not a diagnosis, a risk of developing dementia, or a recommendation for a real
            patient. It was not validated on a clinical cohort. Do not change care from this screen.
          </p>
        </article>
      </div>

      <article className="panel p-5">
        <h2 className="text-[14px] font-medium">Inputs used</h2>
        <p className="mt-2 text-[12px] text-[var(--muted)]">
          {primary.features_used.length} columns in the frozen feature list. Training-set imputation
          (median / most frequent) filled {primary.imputed_fields.length} blank field
          {primary.imputed_fields.length === 1 ? "" : "s"}
          {primary.imputed_fields.length ? `: ${primary.imputed_fields.join(", ")}` : "."}
        </p>
      </article>

      {primary.contributions ? (
        <article className="panel p-5">
          <h2 className="text-[14px] font-medium">Largest linear contributions</h2>
          <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">{primary.contribution_note}</p>
          <ul className="mt-3 space-y-2 text-[13px]">
            {primary.contributions.map((c) => (
              <li key={c.feature} className="flex justify-between gap-3">
                <span>{c.feature}</span>
                <span className={c.weight >= 0 ? "text-[var(--warn)]" : "text-sky-300"}>
                  {c.weight >= 0 ? "raises" : "lowers"} {Math.abs(c.weight).toFixed(3)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ) : (
        <article className="panel p-5 text-[13px] text-[var(--muted)]">
          {primary.contribution_note}
        </article>
      )}

      {assessment.compare && (response.comparisons?.length || response.skipped?.length) ? (
        <article className="panel p-5">
          <h2 className="text-[14px] font-medium">Compatible saved models</h2>
          <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">
            These are separate scoring heads on nested input sets. They are not interchangeable
            measures of clinical risk.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="py-2">Set</th>
                  <th>Model</th>
                  <th>Score</th>
                  <th>Threshold</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                {response.comparisons?.map((row) => (
                  <tr key={row!.mode} className="border-t border-[var(--border)]">
                    <td className="py-2">{MODE_COPY[row!.mode as Mode].title}</td>
                    <td>{row!.algorithm}</td>
                    <td className="tabular-nums">{pct(row!.probability)}</td>
                    <td className="tabular-nums">{row!.threshold.toFixed(2)}</td>
                    <td>{row!.flagged ? "Refer" : "Monitor"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {response.skipped?.length ? (
            <ul className="mt-3 space-y-1 text-[12px] text-[var(--muted)]">
              {response.skipped.map((s) => (
                <li key={s.mode}>
                  {s.mode}: {s.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ) : null}

      {demo ? (
        <details className="panel p-5 text-[13px]">
          <summary className="cursor-pointer font-medium">
            Evaluation context only (not sent to the model)
          </summary>
          <p className="mt-2 leading-6 text-[var(--muted)]">
            This demo wraps a held-out table row. The dataset label was{" "}
            <strong className="text-[var(--foreground)]">
              {demo.evaluationLabel === 1 ? "1 (diagnosed in the table)" : "0 (not diagnosed in the table)"}
            </strong>
            . That label was not an input to <code>predict_proba</code>.
          </p>
        </details>
      ) : null}
    </div>
  );
}
