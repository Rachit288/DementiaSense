"use client";

import { useEffect, useState } from "react";
import { HEADLINE, SETS, STAGE9_C, TUNING } from "@/lib/research";

function Bars({
  items,
}: {
  items: { label: string; value: number; hint?: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i.label}>
          <div className="mb-1 flex justify-between text-[12px]">
            <span>{i.label}</span>
            <span className="font-mono tabular-nums text-[var(--muted)]">
              {i.value.toFixed(3)}
              {i.hint ? ` ${i.hint}` : ""}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--track)]">
            <div
              className="h-2 rounded-full bg-[var(--accent)]"
              style={{ width: `${(i.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Insights() {
  const [live, setLive] = useState<string>("Checking outputs/…");
  useEffect(() => {
    fetch("/api/insights")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error);
        setLive(`Live files loaded from ${j.source}`);
      })
      .catch((e) => setLive(`Could not read outputs/ (${e.message}). Showing notebook snapshot.`));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">What our experiments found</h1>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[var(--muted)]">{HEADLINE}</p>
        <p className="mt-2 text-[12px] text-[var(--muted)]">{live}</p>
      </div>

      <section className="panel p-5">
        <h2 className="text-[15px] font-medium">A · Screening inputs versus cognitive tests</h2>
        <p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">
          Held-out PR-AUC rises from 0.404 (Set A, LogReg) to 0.558 (Set B, LogReg) to 0.915 (Set C,
          Random Forest). The useful finding is not that “trees are magic”: on Set A no algorithm
          beat the baseline beyond fold noise. Performance appeared when the table was allowed to
          use MMSE, functional assessment and ADL — inputs collected late in a clinical pathway.
          Feature engineering and top-15 selection were tested and dropped (mean PR-AUC gain 0.000,
          fold SD 0.026; <code>outputs/stage7_feature_experiment.csv</code>).
        </p>
        <div className="mt-4">
          <Bars
            items={SETS.map((s) => ({
              label: `${s.short} test PR-AUC`,
              value: s.testPrAuc,
            }))}
          />
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-[15px] font-medium">B · Input sets</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="py-2">Set</th>
                <th>Model</th>
                <th>Thr</th>
                <th>Test PR-AUC</th>
                <th>95% CI</th>
                <th>Recall</th>
                <th>Precision</th>
              </tr>
            </thead>
            <tbody>
              {SETS.map((s) => (
                <tr key={s.id} className="border-t border-[var(--border)]">
                  <td className="py-2 pr-3">
                    <div className="font-medium text-[var(--foreground)]">{s.short}</div>
                    <div className="max-w-xs text-[12px] text-[var(--muted)]">{s.meaning}</div>
                  </td>
                  <td>{s.algorithm}</td>
                  <td className="tabular-nums">{s.threshold.toFixed(2)}</td>
                  <td className="tabular-nums">{s.testPrAuc.toFixed(3)}</td>
                  <td className="tabular-nums text-[12px]">{s.testPrAucCi}</td>
                  <td className="tabular-nums">{s.testRecall.toFixed(3)}</td>
                  <td className="tabular-nums">{s.testPrecision.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] text-[var(--muted)]">
          Source: outputs/stage11_final_vs_baseline_test.csv and stage11_test_bootstrap_ci.csv
        </p>
      </section>

      <section className="panel p-5">
        <h2 className="text-[15px] font-medium">C · Models and tuning</h2>
        <p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">
          Baseline <code>LogReg_default</code> CV PR-AUC: A 0.393, B 0.600, C 0.847
          (outputs/stage8_baseline_cv.csv). Dummy models sit at the prevalence (~0.35). Untuned Set
          C trees beat that baseline; Set A/B models did not. Hyperparameter search (15 random
          draws, PR-AUC) barely moved the needle — LogReg gain 0.000 on A and B; Set C HistGB +0.005
          inside its SD. The 1-SE rule then kept LogReg on A/B and Random Forest on C.
        </p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[12px] text-[var(--muted)]">Set C untuned CV PR-AUC</p>
            <Bars items={STAGE9_C.map((m) => ({ label: m.model, value: m.pr }))} />
          </div>
          <div>
            <p className="mb-2 text-[12px] text-[var(--muted)]">Tuning gain (CV PR-AUC)</p>
            <Bars
              items={TUNING.filter((t) => t.set === "C").map((t) => ({
                label: t.model,
                value: t.tuned,
                hint: `(Δ ${t.gain >= 0 ? "+" : ""}${t.gain})`,
              }))}
            />
          </div>
        </div>
        <p className="mt-3 text-[12px] text-[var(--muted)]">
          Source: outputs/stage9_model_comparison_cv.csv, stage10_tuning_summary.csv
        </p>
      </section>

      <section className="panel p-5">
        <h2 className="text-[15px] font-medium">D · Evaluation</h2>
        <p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">
          PR-AUC (average precision) is the headline because the labelled class is about 35% of
          rows. A no-skill ranker scores ~0.35. Accuracy is not used: always predicting “no
          diagnosis” looks ~65% accurate while catching nobody. Cross-validation chose models;
          the test set only reports. Train → CV → test PR-AUC for Set C Random Forest is 0.985 →
          0.930 → 0.915 (outputs/stage11_train_cv_test.csv). Set A/B final-vs-baseline gain CIs
          include 0; Set C does not ([0.038, 0.143], 99.9% of bootstraps &gt; 0).
        </p>
      </section>

      <section className="panel p-5">
        <h2 className="text-[15px] font-medium">E · Limitations</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[13px] leading-6 text-[var(--muted)]">
          <li>Synthetic educational data, one split, no external cohort.</li>
          <li>Set A at 90% recall flags most people (test specificity 0.068) — unusable as a clinic queue.</li>
          <li>Set C looks strong because cognitive tests are close to the label, not because we detected disease early.</li>
          <li>Coefficients on Set A can have the “wrong” clinical sign. They are dataset artefacts.</li>
          <li>Subgroup slices are small; they are not a fairness study.</li>
        </ul>
      </section>
    </div>
  );
}
