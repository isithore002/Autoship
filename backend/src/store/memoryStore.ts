import type { Run } from "../types/run";

class MemoryStore {
  private runs = new Map<string, Run>();

  createRun(run: Run) {
    this.runs.set(run.id, run);
    return run;
  }

  getRun(id: string) {
    return this.runs.get(id) ?? null;
  }

  updateRun(id: string, partial: Partial<Run>) {
    const current = this.getRun(id);
    if (!current) return null;
    const updated: Run = {
      ...current,
      ...partial,
      updatedAt: Date.now(),
    };
    this.runs.set(id, updated);
    return updated;
  }

  listRuns() {
    return Array.from(this.runs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }
}

export const memoryStore = new MemoryStore();

