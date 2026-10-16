import { readFileSync, existsSync } from "fs";
import path from "path";

function outputsDir() {
  return path.resolve(process.cwd(), "..", "outputs");
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells: string[] = [];
    let cur = "";
    let q = false;
    for (const ch of line) {
      if (ch === '"') {
        q = !q;
        continue;
      }
      if (ch === "," && !q) {
        cells.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    cells.push(cur);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
}

function load(name: string) {
  const p = path.join(outputsDir(), name);
  if (!existsSync(p)) throw new Error(`Missing ${name}`);
  return parseCsv(readFileSync(p, "utf8"));
}

export async function GET() {
  try {
    const thresholds = JSON.parse(
      readFileSync(path.join(outputsDir(), "thresholds.json"), "utf8")
    );
    return Response.json({
      source: "outputs/",
      thresholds,
      baselineCv: load("stage8_baseline_cv.csv"),
      modelCv: load("stage9_model_comparison_cv.csv"),
      tuning: load("stage10_tuning_summary.csv"),
      trainCvTest: load("stage11_train_cv_test.csv"),
      testVsBaseline: load("stage11_final_vs_baseline_test.csv"),
      bootstrap: load("stage11_test_bootstrap_ci.csv"),
      robustness: load("stage12_missing_data_robustness.csv"),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read outputs.";
    return Response.json({ error: message }, { status: 500 });
  }
}
