# ENV Guide

## Dashboard env (apps/dashboard/.env)
- Optional: backend URL override

Example:
VITE_BACKEND_URL=http://localhost:5050

## Backend env (backend/.env)
Required:
- PORT=5050
- SIMULATION_MODE=true
- MAX_FIX_RETRIES=3

Gemini settings (only needed later):
- GEMINI_API_KEY=...
- GEMINI_MODEL=gemini-3-pro

Notes:
- Simulation mode does NOT require GEMINI_API_KEY.
- Do not commit secrets.
- Always read env variables using backend/src/config/env.ts (Zod validated).
