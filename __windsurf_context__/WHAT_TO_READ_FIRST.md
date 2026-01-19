# What Windsurf should read first

1) __windsurf_context__/PROJECT_CONTEXT.md
2) pnpm-workspace.yaml and root package.json
3) apps/dashboard/package.json
4) apps/dashboard/src/pages/Dashboard.tsx
5) apps/dashboard/src/lib/store.ts
6) apps/dashboard/src/types/run.ts
7) backend/package.json
8) backend/src/index.ts
9) backend/src/api/runs.ts
10) backend/src/workflow/simRunner.ts
11) backend/src/store/memoryStore.ts
12) backend/src/artifacts/artifactWriter.ts

Important:
- Do NOT rewrite the UI.
- Only touch integration and workflow logic.
- Prefer minimal changes and patch specific files.
