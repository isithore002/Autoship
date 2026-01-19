# Setup Instructions

## Quick Fixes Applied ✅

1. **.gitignore updated** - `.env.example` is now allowed (`.env` is still ignored)
2. **OS-safe scripts added** - Root `package.json` now has `dev:dashboard` and `dev:backend` for Windows compatibility
3. **Backend API endpoints created** - Ready for dashboard integration

## Important: Create .env.example

The `.env.example` file creation was blocked. Please create it manually at the root with:

```bash
# Gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3-pro

# Backend
PORT=5050
SIMULATION_MODE=true
MAX_FIX_RETRIES=3

# Firebase Admin (optional for now)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create Local .env

Copy `.env.example` to `.env` and fill in your values (or leave defaults for simulation mode).

### 3. Start Backend

```bash
# Windows/Mac/Linux
pnpm dev:backend

# Or using script (Linux/Mac)
./scripts/dev.sh
```

Verify backend is running:
- Open http://localhost:5050/health
- Should return: `{ "ok": true, "service": "backend" }`

### 4. Start Dashboard

In a second terminal:

```bash
# Windows/Mac/Linux
pnpm dev:dashboard

# Or using script (Linux/Mac)
./scripts/dev.sh
```

### 5. Test API Endpoints

The backend now has these endpoints:

- `POST /api/runs/create` - Create a new run
- `POST /api/runs/:id/start` - Start workflow
- `GET /api/runs/:id` - Get run status

## Clean Up Old Directory

After verifying everything works, you can delete the old `autoship-dashboard/` directory:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force autoship-dashboard

# Linux/Mac
rm -rf autoship-dashboard
```

## Next Steps

1. ✅ Backend endpoints created
2. ✅ Simulation mode implemented
3. ➡️ Connect dashboard to backend API
4. ➡️ Test full workflow end-to-end

