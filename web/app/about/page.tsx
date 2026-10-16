export default function AboutPage() {
  return (
    <div className="max-w-3xl space-y-6 text-[14px] leading-7 text-[var(--muted)]">
      <h1 className="text-[22px] font-semibold tracking-tight text-[var(--foreground)]">
        About the research
      </h1>
      <p>
        DementiaSense is a university machine-learning assignment on the Kaggle Alzheimer’s Disease
        Dataset (Rabie El Kharoua, 2024; DOI 10.34740/KAGGLE/DSV/8668279; CC BY 4.0). The data card
        describes the table as <strong className="text-[var(--foreground)]">synthetically generated</strong>{" "}
        for education — not real clinical records.
      </p>
      <p>
        Stages 2–6 split the table 80/20 (seed 42) before fitting. Stages 7–12 choose features, a
        baseline, four candidate models, randomised hyperparameters and a recall-oriented threshold
        using <em>training-set cross-validation only</em>. The 430-row test set is scored once in
        Stage 11.
      </p>
      <p>
        This web app loads the saved Stage 11 <code className="text-[var(--foreground)]">.joblib</code>{" "}
        pipelines (LogReg for Sets A and B, Random Forest for Set C) through a Python API. It does
        not re-split data, re-tune models, or treat probabilities from different input sets as the
        same clinical quantity.
      </p>
      <p>
        Screening estimates are not medical diagnoses. There is no external validation, no
        regulatory clearance, and no claim of real-world impact.
      </p>
    </div>
  );
}
