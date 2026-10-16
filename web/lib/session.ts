import type { Mode, PatientValues } from "./fields";

const ASSESS = "ds.assessment";
const RESULT = "ds.result";

export type AssessmentState = {
  patientId: string;
  patientName: string;
  demo: boolean;
  mode: Mode;
  compare: boolean;
  values: PatientValues;
};

export type PredictResponse = {
  ok?: boolean;
  error?: string;
  detail?: string;
  source?: string;
  note?: string;
  requested_mode?: Mode;
  primary?: {
    mode: Mode;
    algorithm: string;
    probability: number;
    threshold: number;
    flagged: boolean;
    features_used: string[];
    imputed_fields: string[];
    contributions: { feature: string; weight: number; coefficient: number }[] | null;
    contribution_note: string;
  };
  comparisons?: PredictResponse["primary"][];
  skipped?: { mode: string; reason: string }[];
  fields_blank_in_request?: string[];
};

export type StoredResult = {
  at: string;
  assessment: AssessmentState;
  response: PredictResponse;
};

export function loadAssessment(): AssessmentState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ASSESS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AssessmentState;
  } catch {
    return null;
  }
}

export function saveAssessment(state: AssessmentState) {
  sessionStorage.setItem(ASSESS, JSON.stringify(state));
}

export function loadResult(): StoredResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RESULT);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredResult;
  } catch {
    return null;
  }
}

export function saveResult(result: StoredResult) {
  sessionStorage.setItem(RESULT, JSON.stringify(result));
}

export function clearAll() {
  sessionStorage.removeItem(ASSESS);
  sessionStorage.removeItem(RESULT);
}
