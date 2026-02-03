import { Run } from "./runTypes";

const runs = new Map<string, Run>();

export const runStore = {
  create(run: Run) {
    runs.set(run.id, run);
  },

  get(id: string): Run | undefined {
    return runs.get(id);
  },

  list(): Run[] {
    return Array.from(runs.values());
  },

  update(id: string, updater: (run: Run) => void) {
    const run = runs.get(id);
    if (!run) return;
    updater(run);
    run.updatedAt = Date.now();
  },

  appendLog(runId: string, log: string) {
    const run = runs.get(runId);
    if (!run) return;
    run.logs.push(log);
    run.updatedAt = Date.now();
  },

  appendStepLog(runId: string, stepId: string, log: string) {
    const run = runs.get(runId);
    if (!run) return;

    const step = run.timelineSteps.find(s => s.id === stepId);
    if (!step) return;

    step.logs.push(log);
    run.updatedAt = Date.now();
  },

  updateStepStatus(
    runId: string,
    stepId: string,
    status: "pending" | "running" | "completed" | "failed"
  ) {
    const run = runs.get(runId);
    if (!run) return;

    const step = run.timelineSteps.find(s => s.id === stepId);
    if (!step) return;

    step.status = status;
    run.updatedAt = Date.now();
  },
};
