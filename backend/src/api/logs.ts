import { Router, type Router as RouterType } from "express";
import { memoryStore } from "../store/memoryStore";

export const logsRouter: RouterType = Router();

/**
 * GET /api/runs/:id/logs/stream
 * Server-Sent Events endpoint for live log streaming
 */
logsRouter.get("/:id/logs/stream", (req, res) => {
  const runId = req.params.id as string;
  const run = memoryStore.getRun(runId);

  if (!run) {
    return res.status(404).json({ error: "Run not found" });
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.flushHeaders();

  // Send initial logs
  let lastSentIndex = 0;
  const currentRun = memoryStore.getRun(runId);
  if (currentRun && currentRun.liveLogs.length > 0) {
    const initialData = {
      type: "initial",
      logs: currentRun.liveLogs,
      status: currentRun.status,
      steps: currentRun.steps.map((s) => ({
        name: s.name,
        status: s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
      })),
    };
    res.write(`data: ${JSON.stringify(initialData)}\n\n`);
    lastSentIndex = currentRun.liveLogs.length;
  }

  // Poll for new logs every 200ms
  const intervalId = setInterval(() => {
    const latestRun = memoryStore.getRun(runId);
    if (!latestRun) {
      res.write(`data: ${JSON.stringify({ type: "error", message: "Run not found" })}\n\n`);
      clearInterval(intervalId);
      res.end();
      return;
    }

    // Send new logs if any
    if (latestRun.liveLogs.length > lastSentIndex) {
      const newLogs = latestRun.liveLogs.slice(lastSentIndex);
      const updateData = {
        type: "update",
        logs: newLogs,
        status: latestRun.status,
        steps: latestRun.steps.map((s) => ({
          name: s.name,
          status: s.status,
          startedAt: s.startedAt,
          endedAt: s.endedAt,
        })),
      };
      res.write(`data: ${JSON.stringify(updateData)}\n\n`);
      lastSentIndex = latestRun.liveLogs.length;
    }

    // End stream when run is complete or failed
    if (latestRun.status === "COMPLETED" || latestRun.status === "FAILED") {
      const finalData = {
        type: "complete",
        status: latestRun.status,
        deployedUrl: latestRun.deployedUrl,
        error: latestRun.error,
      };
      res.write(`data: ${JSON.stringify(finalData)}\n\n`);
      clearInterval(intervalId);
      res.end();
    }
  }, 200);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(intervalId);
  });
});

/**
 * GET /api/runs/:id/timeline
 * Get the full timeline with durations for replay
 */
logsRouter.get("/:id/timeline", (req, res) => {
  const runId = req.params.id as string;
  const run = memoryStore.getRun(runId);

  if (!run) {
    return res.status(404).json({ error: "Run not found" });
  }

  const timeline = run.steps.map((step) => {
    const duration = step.startedAt && step.endedAt 
      ? step.endedAt - step.startedAt 
      : null;

    return {
      step: step.name,
      status: step.status,
      startedAt: step.startedAt,
      endedAt: step.endedAt,
      durationMs: duration,
      durationFormatted: duration ? formatDuration(duration) : null,
      logs: step.logs,
    };
  });

  res.json({
    runId,
    status: run.status,
    createdAt: run.createdAt,
    timeline,
    totalDuration: calculateTotalDuration(run.steps),
  });
});

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

type StepWithTiming = {
  startedAt?: number;
  endedAt?: number;
};

function calculateTotalDuration(steps: StepWithTiming[]): string | null {
  const firstStart = steps.find(s => s.startedAt)?.startedAt;
  const lastEnd = [...steps].reverse().find(s => s.endedAt)?.endedAt;
  
  if (firstStart && lastEnd) {
    return formatDuration(lastEnd - firstStart);
  }
  return null;
}
