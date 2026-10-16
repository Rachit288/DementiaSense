export type Mode = "A_screening" | "B_plus_symptoms" | "C_plus_cognitive_tests";

export type FieldKind = "number" | "binary" | "select";

export type FieldSpec = {
  key: string;
  label: string;
  kind: FieldKind;
  group: string;
  unit?: string;
  help: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: number; label: string }[];
  sets: Mode[];
};

const all: Mode[] = ["A_screening", "B_plus_symptoms", "C_plus_cognitive_tests"];
const bc: Mode[] = ["B_plus_symptoms", "C_plus_cognitive_tests"];
const cOnly: Mode[] = ["C_plus_cognitive_tests"];
const yn = [
  { value: 0, label: "No" },
  { value: 1, label: "Yes" },
];

export const FIELDS: FieldSpec[] = [
  { key: "Age", label: "Age", kind: "number", group: "Demographics", unit: "years", help: "60–90 in the training table.", min: 60, max: 90, step: 1, sets: all },
  {
    key: "Gender",
    label: "Gender",
    kind: "select",
    group: "Demographics",
    help: "Coded as in the dataset (0 = male, 1 = female).",
    options: [
      { value: 0, label: "Male (0)" },
      { value: 1, label: "Female (1)" },
    ],
    sets: all,
  },
  {
    key: "Ethnicity",
    label: "Ethnicity",
    kind: "select",
    group: "Demographics",
    help: "Dataset codes, not a clinical ethnicity assessment.",
    options: [
      { value: 0, label: "Caucasian (0)" },
      { value: 1, label: "African American (1)" },
      { value: 2, label: "Asian (2)" },
      { value: 3, label: "Other (3)" },
    ],
    sets: all,
  },
  {
    key: "EducationLevel",
    label: "Education",
    kind: "select",
    group: "Demographics",
    help: "Ordinal code from the data card.",
    options: [
      { value: 0, label: "None (0)" },
      { value: 1, label: "High school (1)" },
      { value: 2, label: "Bachelor’s (2)" },
      { value: 3, label: "Higher (3)" },
    ],
    sets: all,
  },
  { key: "BMI", label: "BMI", kind: "number", group: "Lifestyle", unit: "kg/m²", help: "Body mass index.", min: 15, max: 40, step: 0.1, sets: all },
  { key: "Smoking", label: "Smoking", kind: "select", group: "Lifestyle", help: "Current smoking flag.", options: yn, sets: all },
  { key: "AlcoholConsumption", label: "Alcohol consumption", kind: "number", group: "Lifestyle", help: "Dataset scale, roughly 0–20.", min: 0, max: 20, step: 0.1, sets: all },
  { key: "PhysicalActivity", label: "Physical activity", kind: "number", group: "Lifestyle", help: "Dataset scale, roughly 0–10.", min: 0, max: 10, step: 0.1, sets: all },
  { key: "DietQuality", label: "Diet quality", kind: "number", group: "Lifestyle", help: "Dataset scale, roughly 0–10.", min: 0, max: 10, step: 0.1, sets: all },
  { key: "SleepQuality", label: "Sleep quality", kind: "number", group: "Lifestyle", help: "Dataset scale, roughly 4–10.", min: 4, max: 10, step: 0.1, sets: all },
  { key: "FamilyHistoryAlzheimers", label: "Family history of Alzheimer’s", kind: "select", group: "History", help: "Binary history flag.", options: yn, sets: all },
  { key: "CardiovascularDisease", label: "Cardiovascular disease", kind: "select", group: "History", help: "Binary history flag.", options: yn, sets: all },
  { key: "Diabetes", label: "Diabetes", kind: "select", group: "History", help: "Binary history flag.", options: yn, sets: all },
  { key: "Depression", label: "Depression", kind: "select", group: "History", help: "Binary history flag.", options: yn, sets: all },
  { key: "HeadInjury", label: "Head injury", kind: "select", group: "History", help: "Binary history flag.", options: yn, sets: all },
  { key: "Hypertension", label: "Hypertension", kind: "select", group: "History", help: "Binary history flag.", options: yn, sets: all },
  { key: "SystolicBP", label: "Systolic blood pressure", kind: "number", group: "Clinical measurements", unit: "mmHg", help: "Training range about 90–179.", min: 90, max: 179, step: 1, sets: all },
  { key: "DiastolicBP", label: "Diastolic blood pressure", kind: "number", group: "Clinical measurements", unit: "mmHg", help: "Training range about 60–119.", min: 60, max: 119, step: 1, sets: all },
  { key: "CholesterolTotal", label: "Total cholesterol", kind: "number", group: "Clinical measurements", unit: "mg/dL", help: "Training range about 150–300.", min: 150, max: 300, step: 0.1, sets: all },
  { key: "CholesterolLDL", label: "LDL cholesterol", kind: "number", group: "Clinical measurements", unit: "mg/dL", help: "Training range about 50–200.", min: 50, max: 200, step: 0.1, sets: all },
  { key: "CholesterolHDL", label: "HDL cholesterol", kind: "number", group: "Clinical measurements", unit: "mg/dL", help: "Training range about 20–100.", min: 20, max: 100, step: 0.1, sets: all },
  { key: "CholesterolTriglycerides", label: "Triglycerides", kind: "number", group: "Clinical measurements", unit: "mg/dL", help: "Training range about 50–400.", min: 50, max: 400, step: 0.1, sets: all },
  { key: "MemoryComplaints", label: "Memory complaints", kind: "select", group: "Reported symptoms", help: "Patient-reported flag. Set B and C only.", options: yn, sets: bc },
  { key: "BehavioralProblems", label: "Behavioral problems", kind: "select", group: "Reported symptoms", help: "Patient-reported flag. Set B and C only.", options: yn, sets: bc },
  { key: "Confusion", label: "Confusion", kind: "select", group: "Reported symptoms", help: "Patient-reported flag. Set B and C only.", options: yn, sets: bc },
  { key: "Disorientation", label: "Disorientation", kind: "select", group: "Reported symptoms", help: "Patient-reported flag. Set B and C only.", options: yn, sets: bc },
  { key: "PersonalityChanges", label: "Personality changes", kind: "select", group: "Reported symptoms", help: "Patient-reported flag. Set B and C only.", options: yn, sets: bc },
  { key: "DifficultyCompletingTasks", label: "Difficulty completing tasks", kind: "select", group: "Reported symptoms", help: "Patient-reported flag. Set B and C only.", options: yn, sets: bc },
  { key: "Forgetfulness", label: "Forgetfulness", kind: "select", group: "Reported symptoms", help: "Patient-reported flag. Set B and C only.", options: yn, sets: bc },
  { key: "MMSE", label: "MMSE", kind: "number", group: "Cognitive assessment", unit: "0–30", help: "Mini-Mental State Examination. Set C only — not used for cheap screening.", min: 0, max: 30, step: 0.1, sets: cOnly },
  { key: "FunctionalAssessment", label: "Functional assessment", kind: "number", group: "Cognitive assessment", help: "Dataset scale ~0–10. Set C only.", min: 0, max: 10, step: 0.1, sets: cOnly },
  { key: "ADL", label: "ADL", kind: "number", group: "Cognitive assessment", help: "Activities of daily living, dataset scale ~0–10. Set C only.", min: 0, max: 10, step: 0.1, sets: cOnly },
];

export const MODE_COPY: Record<
  Mode,
  { title: string; blurb: string; model: string }
> = {
  A_screening: {
    title: "Set A · cheap screening",
    blurb: "What a GP might collect without a memory-clinic workup. On the held-out test set this model is not demonstrably better than default logistic regression.",
    model: "Logistic regression, threshold 0.39",
  },
  B_plus_symptoms: {
    title: "Set B · screening + symptoms",
    blurb: "Adds seven reported symptom flags. Ranking improves versus Set A, but a 90% recall threshold still produces many false alarms.",
    model: "Logistic regression, threshold 0.29",
  },
  C_plus_cognitive_tests: {
    title: "Set C · cognitive tests",
    blurb: "Adds MMSE, functional assessment and ADL. Stronger numbers — because these inputs are already close to how diagnosis is described in the table.",
    model: "Random forest, threshold 0.52",
  },
};

export const GROUPS = [
  "Demographics",
  "Lifestyle",
  "History",
  "Clinical measurements",
  "Reported symptoms",
  "Cognitive assessment",
];

export function fieldsFor(mode: Mode) {
  return FIELDS.filter((f) => f.sets.includes(mode));
}

export type PatientValues = Record<string, number | null>;

export function emptyValues(): PatientValues {
  const v: PatientValues = {};
  for (const f of FIELDS) v[f.key] = null;
  return v;
}

export function validate(mode: Mode, values: PatientValues): string[] {
  const errors: string[] = [];
  for (const f of fieldsFor(mode)) {
    const val = values[f.key];
    if (val == null) continue;
    if (typeof val !== "number" || Number.isNaN(val)) {
      errors.push(`${f.label} is not a number.`);
      continue;
    }
    if (f.min != null && val < f.min) errors.push(`${f.label} is below ${f.min}.`);
    if (f.max != null && val > f.max) errors.push(`${f.label} is above ${f.max}.`);
  }
  if (mode === "C_plus_cognitive_tests") {
    for (const key of ["MMSE", "FunctionalAssessment", "ADL"]) {
      if (values[key] == null) errors.push(`${key} is required for Set C. Empty cognitive scores are not filled in.`);
    }
  }
  return errors;
}
