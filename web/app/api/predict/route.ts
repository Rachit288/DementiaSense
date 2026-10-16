import { spawn } from "child_process";
import path from "path";
import { existsSync } from "fs";

function pythonBin() {
  if (process.env.PYTHON_BIN) return process.env.PYTHON_BIN;
  const local = path.resolve(process.cwd(), "..", ".venv", "bin", "python");
  if (existsSync(local)) return local;
  return "python3";
}

function runPredict(payload: unknown): Promise<{ code: number; stdout: string; stderr: string }> {
  const script = path.join(process.cwd(), "scripts", "predict.py");
  const py = pythonBin();
  return new Promise((resolve, reject) => {
    const child = spawn(/* turbopackIgnore: true */ py, [script], {
      cwd: path.resolve(process.cwd(), ".."),
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Prediction timed out talking to the sklearn pipeline."));
    }, 25000);
    child.stdout.on("data", (d) => {
      stdout += String(d);
    });
    child.stderr.on("data", (d) => {
      stderr += String(d);
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? 1, stdout, stderr });
    });
    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  try {
    const { code, stdout, stderr } = await runPredict(body);
    const parsed = JSON.parse(stdout || "{}");
    if (code !== 0 || parsed.error) {
      return Response.json(
        {
          error: parsed.error || "The sklearn pipeline failed.",
          detail: stderr.slice(0, 800) || undefined,
        },
        { status: 500 }
      );
    }
    return Response.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown prediction error.";
    return Response.json(
      {
        error:
          "Could not run the saved joblib models. Start the app from the DementiaSense repo with the project virtualenv available.",
        detail: message,
      },
      { status: 503 }
    );
  }
}
