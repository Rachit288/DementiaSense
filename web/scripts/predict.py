#!/usr/bin/env python3
"""Score one patient with the saved Stage 11 sklearn pipelines. Not a diagnosis."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "outputs"
MODEL_DIR = OUT / "models"
MODES = ("A_screening", "B_plus_symptoms", "C_plus_cognitive_tests")
COGNITIVE = ("MMSE", "FunctionalAssessment", "ADL")
SYMPTOMS = (
    "MemoryComplaints",
    "BehavioralProblems",
    "Confusion",
    "Disorientation",
    "PersonalityChanges",
    "DifficultyCompletingTasks",
    "Forgetfulness",
)


def _repo_features():
    cfg = json.loads((OUT / "feature_config.json").read_text())
    return cfg["continuous"] + cfg["binary"] + cfg["ordinal"] + cfg["nominal"], cfg


def provided(patient: dict, key: str) -> bool:
    v = patient.get(key, None)
    if v is None or v == "":
        return False
    if isinstance(v, float) and np.isnan(v):
        return False
    return True


def compatible(mode: str, patient: dict, requested: str) -> tuple[bool, str]:
    if mode == "A_screening":
        return True, ""
    if mode == "B_plus_symptoms":
        if requested == "A_screening":
            return False, "Set B needs reported-symptom fields. Switch the input set to include symptoms."
        return True, ""
    if requested != "C_plus_cognitive_tests":
        return False, "Set C needs MMSE, functional assessment and ADL. Those scores are not invented when missing."
    missing = [k for k in COGNITIVE if not provided(patient, k)]
    if missing:
        return False, f"Set C was not scored because these cognitive fields were empty: {', '.join(missing)}."
    return True, ""


def row_from_patient(patient: dict, all_features: list[str]) -> tuple[pd.DataFrame, list[str]]:
    cleaned = {}
    missing = []
    for col in all_features:
        if provided(patient, col):
            cleaned[col] = pd.to_numeric(patient[col], errors="coerce")
            if pd.isna(cleaned[col]):
                missing.append(col)
        else:
            cleaned[col] = np.nan
            missing.append(col)
    return pd.DataFrame([cleaned], columns=all_features), missing


def contributions(est, X: pd.DataFrame) -> list[dict] | None:
    if "clf" not in est.named_steps:
        return None
    clf = est.named_steps["clf"]
    if not hasattr(clf, "coef_"):
        return None
    prep = est.named_steps["prep"]
    Xt = prep.transform(X)
    names = list(prep.get_feature_names_out())
    if "select" in est.named_steps:
        names = list(np.array(names)[est.named_steps["select"].get_support()])
    coef = clf.coef_[0]
    x = np.asarray(Xt)[0]
    items = []
    for name, c, xv in zip(names, coef, x):
        items.append({"feature": str(name), "weight": float(c * xv), "coefficient": float(c)})
    items.sort(key=lambda d: abs(d["weight"]), reverse=True)
    return items[:8]


def score_one(mode: str, frame: pd.DataFrame) -> dict:
    path = MODEL_DIR / f"final_{mode}.joblib"
    if not path.exists():
        raise FileNotFoundError(f"Saved model missing: {path}")
    art = joblib.load(path)
    feats = list(art["features"])
    est = art["model"]
    X = frame[feats]
    proba = float(est.predict_proba(X)[:, 1][0])
    thr = float(art["threshold"])
    used_missing = [c for c in feats if X.iloc[0][c] != X.iloc[0][c]]
    return {
        "mode": mode,
        "algorithm": art["algorithm"],
        "probability": round(proba, 6),
        "threshold": thr,
        "flagged": proba >= thr,
        "sklearn_version": art.get("sklearn_version"),
        "features_used": feats,
        "imputed_fields": used_missing,
        "contributions": contributions(est, X),
        "contribution_note": (
            "Logistic regression contributions are coefficient × standardised value for this row. "
            "They are not causal and can disagree with clinical knowledge on this synthetic table."
            if art["algorithm"] == "LogReg"
            else "The saved Random Forest is not given per-patient causal attributions here."
        ),
    }


def main() -> int:
    raw = json.loads(sys.stdin.read())
    patient = raw.get("patient") or {}
    requested = raw.get("mode") or "A_screening"
    compare = bool(raw.get("compare"))
    if requested not in MODES:
        print(json.dumps({"error": f"Unknown mode {requested}"}))
        return 1
    all_features, _cfg = _repo_features()
    frame, missing_all = row_from_patient(patient, all_features)
    modes = MODES if compare else (requested,)
    results = []
    skipped = []
    for mode in modes:
        ok, reason = compatible(mode, patient, requested)
        if not ok:
            skipped.append({"mode": mode, "reason": reason})
            continue
        results.append(score_one(mode, frame))
    if not results:
        print(json.dumps({"error": skipped[0]["reason"] if skipped else "No compatible model."}))
        return 1
    primary = next((r for r in results if r["mode"] == requested), results[0])
    print(
        json.dumps(
            {
                "ok": True,
                "source": "outputs/models joblib (Stage 11)",
                "note": "Screening estimate only. Not a medical diagnosis. A clinician makes the decision.",
                "requested_mode": requested,
                "primary": primary,
                "comparisons": results,
                "skipped": skipped,
                "fields_blank_in_request": missing_all,
            }
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001 — surface pipeline errors to the API
        print(json.dumps({"error": str(exc)}))
        raise SystemExit(1)
