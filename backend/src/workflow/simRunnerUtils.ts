import type { RunStepName } from "../types/run";
import { memoryStore } from "../store/memoryStore";

export function pushLog(runId: string, message: string) {
  const run = memoryStore.getRun(runId);
  if (!run) return;
  run.liveLogs.push(message);
  run.updatedAt = Date.now();
}

export function setStepStatus(
  runId: string,
  stepName: RunStepName,
  status: "PENDING" | "RUNNING" | "PASS" | "FAIL"
) {
  const run = memoryStore.getRun(runId);
  if (!run) return;

  const step = run.steps.find((s) => s.name === stepName);
  if (!step) return;

  step.status = status;
  if (status === "RUNNING") step.startedAt = Date.now();
  if (status === "PASS" || status === "FAIL") step.endedAt = Date.now();

  run.updatedAt = Date.now();
}
