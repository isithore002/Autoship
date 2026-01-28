SIMULATION_MODE=false
GEMINI_API_KEY=AIzaSyASToOhGv2Rx6x_KtW8z6ahDShqYQhLyQw
GEMINI_MODEL=gemini-3-flash-preview
VERCEL_TOKEN=zv3zsiStHyGsU0PElE4mKC8n

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