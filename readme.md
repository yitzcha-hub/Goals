# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Development

- **`npm run dev`** – Vite only (port 8080). Use when working on the frontend; `/api` is proxied to `http://localhost:5000`.
- **`npm run dev:api`** – Vercel dev + Vite on port 5000 (full app + serverless API). If you see `ECONNRESET` and the process exits, use the two-terminal workflow below.
- **`npm run dev:api-only`** – Vercel dev on port 5001 (API only). Use with the two-terminal workflow.

### If you see `Error: read ECONNRESET`

This can happen when `vercel dev` proxies to the Vite dev server and a TCP connection is closed (browser refresh, HMR, or health checks). The app may still work; if the process keeps exiting:

1. **Terminal 1:** `npm run dev:api-only` (Vercel on 5001)
2. **Terminal 2:** `VITE_API_URL=http://localhost:5001 npm run dev` (Vite on 8080; API calls go to 5001). On Windows PowerShell: `$env:VITE_API_URL="http://localhost:5001"; npm run dev`
