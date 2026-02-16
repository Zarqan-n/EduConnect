Render deployment steps
======================

Quick steps to deploy this project to Render:

- Link your Git repository to Render and enable "Deploy from Git".
- Render will detect `render.yaml` and use the defined service.
- The service uses these commands (already in `render.yaml`):
  - Build command: `npm ci --include=dev && npm run build`
  - Start command: `npm start`

Environment variables (set in Render or use `render.yaml`):
- `DATABASE_URL` — attach the Render Postgres database service (or set connection string).
- `SESSION_SECRET` — will be auto-generated if left unset (see `render.yaml`).
- `PORT` — Render sets this automatically; `render.yaml` currently sets 10000 for testing.

Notes
- The build installs devDependencies so `vite`, `esbuild`, and `tsx` are available to build the client and bundle the server.
- The `npm run build` step outputs the client build and a bundled `dist/index.cjs` server file which `npm start` runs.
- If you prefer to manage build env vars separately, adjust `render.yaml` or Render dashboard settings.

If you want, I can also:
- Run a local build to verify `npm run build` succeeds.
- Add a small health-check endpoint or Render liveness probe.
