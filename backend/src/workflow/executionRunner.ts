SIMULATION_MODE=false
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3-flash-preview
VERCEL_TOKEN=

// Find where pnpm build is executed and update it:
const previewBase = `/preview/${runId}/`;

await runCommand(
  "pnpm",
  ["build"],
  {
    cwd: projectDir,
    env: {
      ...process.env,
      VITE_BASE_URL: previewBase,
    },
  }
);
