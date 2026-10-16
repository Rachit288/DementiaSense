/** Numbers copied from outputs/*.csv after Stages 7–12. Do not treat as clinical performance. */

export const SETS = [
  {
    id: "A_screening",
    short: "Set A",
    name: "Cheap screening inputs",
    meaning:
      "Demographics, lifestyle, medical history, blood pressure and cholesterol. No reported symptoms and no cognitive tests.",
    algorithm: "LogReg",
    threshold: 0.391,
    testPrAuc: 0.404,
    testPrAucCi: "0.404 [0.336, 0.486]",
    testRoc: 0.528,
    testRecall: 0.914,
    testPrecision: 0.349,
    baselinePrAuc: 0.403,
    gainCi: "[−0.004, 0.006]",
    cvLogReg: 0.394,
    source: "outputs/stage11_final_vs_baseline_test.csv, stage11_test_bootstrap_ci.csv",
  },
  {
    id: "B_plus_symptoms",
    short: "Set B",
    name: "Screening + reported symptoms",
    meaning:
      "Set A plus MemoryComplaints, BehavioralProblems, Confusion, Disorientation, PersonalityChanges, DifficultyCompletingTasks, Forgetfulness.",
    algorithm: "LogReg",
    threshold: 0.288,
    testPrAuc: 0.558,
    testPrAucCi: "0.558 [0.480, 0.646]",
    testRoc: 0.678,
    testRecall: 0.908,
    testPrecision: 0.371,
    baselinePrAuc: 0.559,
    gainCi: "[−0.004, 0.002]",
    cvLogReg: 0.6,
    source: "outputs/stage11_final_vs_baseline_test.csv, stage11_test_bootstrap_ci.csv",
  },
  {
    id: "C_plus_cognitive_tests",
    short: "Set C",
    name: "Cognitive assessment inputs",
    meaning:
      "Set B plus MMSE, FunctionalAssessment and ADL — scores typically collected in a clinic, not a cheap community screen.",
    algorithm: "RandomForest",
    threshold: 0.515,
    testPrAuc: 0.915,
    testPrAucCi: "0.915 [0.859, 0.960]",
    testRoc: 0.939,
    testRecall: 0.921,
    testPrecision: 0.946,
    baselinePrAuc: 0.827,
    gainCi: "[+0.038, +0.143]",
    cvLogReg: 0.846,
    source: "outputs/stage11_final_vs_baseline_test.csv, stage11_test_bootstrap_ci.csv",
  },
] as const;

export const BASELINE = [
  { set: "A", model: "Dummy_prior", pr: 0.354 },
  { set: "A", model: "LogReg_default", pr: 0.393 },
  { set: "B", model: "Dummy_prior", pr: 0.354 },
  { set: "B", model: "LogReg_default", pr: 0.6 },
  { set: "C", model: "Dummy_prior", pr: 0.354 },
  { set: "C", model: "LogReg_default", pr: 0.847 },
] as const;

export const TUNING = [
  { set: "A", model: "LogReg", def: 0.394, tuned: 0.394, gain: 0 },
  { set: "A", model: "SVM_RBF", def: 0.386, tuned: 0.4, gain: 0.014 },
  { set: "A", model: "RandomForest", def: 0.394, tuned: 0.396, gain: 0.002 },
  { set: "A", model: "HistGB", def: 0.362, tuned: 0.386, gain: 0.024 },
  { set: "B", model: "LogReg", def: 0.6, tuned: 0.6, gain: 0 },
  { set: "B", model: "SVM_RBF", def: 0.569, tuned: 0.592, gain: 0.023 },
  { set: "B", model: "RandomForest", def: 0.566, tuned: 0.59, gain: 0.024 },
  { set: "B", model: "HistGB", def: 0.546, tuned: 0.573, gain: 0.027 },
  { set: "C", model: "LogReg", def: 0.846, tuned: 0.847, gain: 0.001 },
  { set: "C", model: "SVM_RBF", def: 0.842, tuned: 0.847, gain: 0.005 },
  { set: "C", model: "RandomForest", def: 0.937, tuned: 0.936, gain: -0.001 },
  { set: "C", model: "HistGB", def: 0.943, tuned: 0.948, gain: 0.005 },
] as const;

export const STAGE9_C = [
  { model: "LogReg", pr: 0.846 },
  { model: "SVM_RBF", pr: 0.842 },
  { model: "RandomForest", pr: 0.937 },
  { model: "HistGB", pr: 0.943 },
] as const;

export const HEADLINE =
  "On this table, cheap screening inputs barely beat chance (test PR-AUC 0.40). Adding clinic cognitive scores jumps performance (test PR-AUC 0.92). That is a finding about input timing, not a claim that the algorithm is a medical device.";
