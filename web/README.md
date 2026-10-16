# DementiaSense web prototype

Academic screening UI over the saved Stage 11 sklearn pipelines. Not a medical device.

## Run

From the repository root (needs `outputs/models/*.joblib` and `.venv`):

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

`Analyze Patient` calls `POST /api/predict`, which runs `.venv/bin/python web/scripts/predict.py` against `outputs/models/final_*.joblib`. If Python or the joblib files are missing, the UI shows an error instead of a fake score.

Insights charts use `outputs/*.csv` via `GET /api/insights`, with the same numbers also snapshotted in `lib/research.ts`.
