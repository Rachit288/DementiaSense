"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import demos from "@/lib/demos.json";
import {
  FIELDS,
  GROUPS,
  MODE_COPY,
  emptyValues,
  fieldsFor,
  validate,
  type Mode,
  type PatientValues,
} from "@/lib/fields";
import { saveAssessment, saveResult, type AssessmentState } from "@/lib/session";

function valuesFromDemo(id: string): PatientValues {
  const row = demos.find((d) => d.id === id);
  const next = emptyValues();
  if (!row) return next;
  for (const [k, v] of Object.entries(row.values)) next[k] = v as number;
  return next;
}

const DEFAULT_DEMO = demos[0]?.id ?? "new";

export function Assessment() {
  const router = useRouter();
  const [patientId, setPatientId] = useState(DEFAULT_DEMO);
  const [mode, setMode] = useState<Mode>("A_screening");
  const [compare, setCompare] = useState(true);
  const [values, setValues] = useState<PatientValues>(() => valuesFromDemo(DEFAULT_DEMO));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const demo = demos.find((d) => d.id === patientId);
  const visible = useMemo(() => fieldsFor(mode), [mode]);

  useEffect(() => {
    setError(null);
  }, [mode, patientId, values]);

  function selectPatient(id: string) {
    setPatientId(id);
    setValues(id === "new" ? emptyValues() : valuesFromDemo(id));
  }

  function setField(key: string, raw: string) {
    if (raw === "") {
      setValues((v) => ({ ...v, [key]: null }));
      return;
    }
    const n = Number(raw);
    setValues((v) => ({ ...v, [key]: Number.isNaN(n) ? null : n }));
  }

  async function analyze() {
    const errs = validate(mode, values);
    setFormErrors(errs);
    if (errs.length) return;
    const assessment: AssessmentState = {
      patientId,
      patientName: demo?.name ?? "New assessment",
      demo: patientId !== "new",
      mode,
      compare,
      values,
    };
    saveAssessment(assessment);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          compare,
          patient: values,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || "Prediction failed.");
        return;
      }
      saveResult({ at: new Date().toISOString(), assessment, response: json });
      router.push("/results");
    } catch {
      setError("Network error reaching /api/predict. Is the Next.js server running?");
    } finally {
      setBusy(false);
    }
  }

  const groups = GROUPS.filter((g) => visible.some((f) => f.group === g));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">New assessment</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-6 text-[var(--muted)]">
          A sample patient is already loaded. Click Analyze Patient — you do not need to type the
          form. Blank fields are imputed by the training pipeline; Set C still requires MMSE,
          functional assessment and ADL.
        </p>
      </div>

      <section className="panel p-5">
        <h2 className="text-[13px] font-medium">1 · Select a patient</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {demos.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => selectPatient(d.id)}
              className={`rounded-xl border px-3 py-3 text-left text-[13px] ${
                patientId === d.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] hover:border-[var(--accent)]/40"
              }`}
            >
              <p className="font-medium">
                {d.name}{" "}
                <span className="font-mono text-[11px] text-[var(--muted)]">{d.id}</span>
              </p>
              <p className="mt-1 text-[12px] text-[var(--muted)]">Prefilled sample · click Analyze</p>
            </button>
          ))}
          <button
            type="button"
            onClick={() => selectPatient("new")}
            className={`rounded-xl border px-3 py-3 text-left text-[13px] ${
              patientId === "new"
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] hover:border-[var(--accent)]/40"
            }`}
          >
            <p className="font-medium">Blank form</p>
            <p className="mt-1 text-[12px] text-[var(--muted)]">Optional. Empty fields are imputed.</p>
          </button>
        </div>
        {demo ? (
          <p className="mt-3 text-[12px] leading-5 text-[var(--muted)]">{demo.note}</p>
        ) : null}
      </section>

      <section className="panel p-5">
        <h2 className="text-[13px] font-medium">2 · Input set</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {(Object.keys(MODE_COPY) as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-xl border px-3 py-3 text-left ${
                mode === m
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] hover:border-[var(--accent)]/40"
              }`}
            >
              <p className="text-[13px] font-medium">{MODE_COPY[m].title}</p>
              <p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">{MODE_COPY[m].blurb}</p>
              <p className="mt-2 font-mono text-[11px] text-[var(--muted)]">{MODE_COPY[m].model}</p>
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-start gap-2 text-[12px] text-[var(--muted)]">
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
            className="mt-0.5"
          />
          Also score every compatible saved model. Set C is skipped unless MMSE, functional
          assessment and ADL are present. Scores from different input sets are not the same clinical
          risk scale.
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-[13px] font-medium">3 · Assessment data</h2>
        {groups.map((group) => (
          <div key={group} className="panel p-5">
            <h3 className="text-[12px] uppercase tracking-wider text-[var(--muted)]">{group}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible
                .filter((f) => f.group === group)
                .map((f) => (
                  <label key={f.key} className="block">
                    <span className="text-[12px] text-[var(--muted)]">
                      {f.label}
                      {f.unit ? ` · ${f.unit}` : ""}
                    </span>
                    {f.kind === "select" ? (
                      <select
                        className="field mt-1"
                        value={values[f.key] ?? ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                      >
                        <option value="">Not recorded</option>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="field mt-1"
                        type="number"
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        value={values[f.key] ?? ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                      />
                    )}
                    <span className="mt-1 block text-[11px] leading-4 text-[var(--muted)]">
                      {f.help}
                    </span>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </section>

      {formErrors.length ? (
        <div className="rounded-xl border border-amber-500/30 bg-[var(--warn-soft)] px-4 py-3 text-[13px] text-[var(--warn)]">
          {formErrors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-[13px] text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" disabled={busy} onClick={analyze}>
          {busy ? "Running sklearn pipeline…" : "Analyze Patient"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            selectPatient("new");
            setMode("A_screening");
          }}
        >
          Reset
        </button>
        <p className="text-[12px] text-[var(--muted)]">
          {visible.length} fields for this set · {FIELDS.length} defined in the dataset
        </p>
      </div>
    </div>
  );
}
