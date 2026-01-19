# Architecture

## Overview

AutoShop Agent is a monorepo containing:

1. **Dashboard** (`apps/dashboard`) - React frontend for monitoring and controlling agent runs
2. **Backend** (`backend`) - Express server with agent orchestration logic
3. **Generated Apps** (`apps/generated`) - Output directory for generated projects
4. **Artifacts** (`artifacts`) - Proof bundles and deployment artifacts

## System Flow

```
User Request → Dashboard → Backend API → Agent Orchestrator
                                         ↓
                    Planner → Builder → Tester → Fixer → Deployer
                                         ↓
                              Generated App + Artifacts
```

## Components

### Dashboard
- React + Vite
- React Router for navigation
- TanStack Query for data fetching
- shadcn/ui components

### Backend
- Express.js REST API
- Agent orchestration engine
- Tool runners (read/write/list/run_command/deploy)
- Firebase Admin for persistence

### Agent Workflow
1. **Planning** - Break down user goal into steps
2. **Building** - Generate code using AI
3. **Testing** - Run tests and validate
4. **Fixing** - Iterate on failures
5. **Deployment** - Deploy to hosting provider

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **AI**: Google Gemini API
- **Database**: Firebase Firestore
- **Deployment**: Vercel (configurable)

