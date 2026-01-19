# Project Context

## Project name
AutoShip (Gemini 3 Hackathon) — Simulation-first Autonomous Dev Agent

## What this project is
- This is a monorepo project for an AI hackathon.
- AutoShip is an orchestrator dashboard + backend service that runs an autonomous workflow:
  Goal → Plan → Build → Test → Self-fix → Deploy → Browser QA → Proof-of-work artifacts.
- Currently the system runs in SIMULATION mode (no Gemini key needed).

## Current goal
- Make a fully working simulation demo:
  - Timeline updates
  - Live logs
  - Artifacts generated
  - Runs history and settings persist
  - Failure injection demo (Testing fails → VibeCoder fixes → Pass)

## Key features
- Dashboard UI (Vite + React Router) for starting and monitoring runs
- Backend Express service exposes run endpoints
- Simulation workflow runner generates logs, artifacts, and a deploy URL
- Artifacts written to /artifacts/<runId>/
- Settings page controls "injectFailure" and other knobs

## Tech stack
Frontend:
- Framework: Vite + React + TypeScript
- Routing: react-router-dom
- UI: Tailwind + Radix components
- State: local component state + polling (pollRun)

Backend:
- Framework: Node + Express + TypeScript
- Env validation: Zod
- Runner: simulation workflow in backend/src/workflow/
- Data: in-memory store (upgradeable to Firestore later)

## Folder structure
- /apps/dashboard -> Vite dashboard UI
  - src/pages/Dashboard.tsx (Start Run button)
  - src/lib/store.ts (ALL backend integration here)
  - src/components/Timeline.tsx, Terminal.tsx, ArtifactCard.tsx
  - src/types/run.ts defines frontend Run type
- /backend -> Express API + simulation runner
  - src/index.ts (server entry)
  - src/api/runs.ts (run endpoints)
  - src/workflow/simRunner.ts (simulation timeline, logs, artifacts)
  - src/store/memoryStore.ts (in-memory run storage)
  - src/artifacts/artifactWriter.ts (writes artifacts to disk)
- /artifacts -> generated proof bundles per run

## API contract (backend)
- GET /health
- POST /api/runs  -> { runId }
- POST /api/runs/:id/start  -> starts simulation
  - body: { injectFailure?: boolean }
- GET /api/runs/:id -> { run }
- GET /api/runs -> { runs[] } (summary list)

## How to run
From monorepo root (H:\\autoship-dashboard):

Backend:
- pnpm --filter @autoshop-agent/backend dev

Dashboard:
- pnpm --filter @autoshop-agent/dashboard dev

Backend URL:
- http://localhost:5050
Dashboard URL:
- http://localhost:5173

## Status
✅ Completed:
- Monorepo structure + pnpm workspace
- Backend server running
- Simulation run workflow works
- Dashboard UI created
- Frontend-backend polling integration in apps/dashboard/src/lib/store.ts
- Basic vitest health test in backend/tests

🚧 Working on:
- Failure injection WOW demo (injectFailure)
- Make run history page load correctly
- Improve artifacts (add diff.patch + screenshots placeholders)

❌ Known issues / constraints
- Do NOT rewrite UI design files unnecessarily
- Do NOT replace Vite dashboard with Next.js
- Only adjust integration logic in apps/dashboard/src/lib/store.ts and backend/src

## What I need next
- Implement injectFailure in backend simulation runner:
  Testing should fail → Fixing step runs → Testing passes.
- Ensure /api/runs list matches frontend type (summary list handling).
- Ensure timeline step status values match frontend expectations:
  pending/running/completed/failed.
