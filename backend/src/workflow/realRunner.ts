import type { Runner } from "./runner";
import { memoryStore } from "../store/memoryStore";
import { ensureWorkspace } from "./workspace";
import { generatePlan } from "../agents/planner";
import { writeArtifacts } from "../artifacts/artifactWriter";
import { pushLog, setStepStatus } from "./simRunnerUtils";

export const realRunner: Runner = {
  async start(runId: string) {
    const run = memoryStore.getRun(runId);
    if (!run) return;
    if (run.status === "RUNNING") return;

    memoryStore.updateRun(runId, { status: "RUNNING" });

    const workspacePath = ensureWorkspace(runId);
    pushLog(runId, `[Workspace] Created workspace at apps/generated/${runId}`);
    pushLog(runId, `[Planning] (Real Mode) Calling Gemini planner...`);

    setStepStatus(runId, "Planning", "RUNNING");

    try {
      const plan = await generatePlan(run.goal, run.template);
      const planJson = JSON.stringify(plan, null, 2);

      const current = memoryStore.getRun(runId);
      memoryStore.updateRun(runId, {
        artifacts: {
          ...(current?.artifacts ?? {}),
          planJson,
        },
      });

      pushLog(runId, `[Planning] ✅ Gemini plan.json generated`);
      setStepStatus(runId, "Planning", "PASS");

      const updatedRun = memoryStore.getRun(runId);
      if (updatedRun) {
        writeArtifacts(updatedRun);
      }

      memoryStore.updateRun(runId, { status: "COMPLETED" });
      pushLog(runId, `[RealRunner] ✅ Day 18 complete (planning only).`);
    } catch (error: any) {
      const message = error?.message ?? "Unknown error";
      pushLog(runId, `[Planning] ❌ Gemini planner failed: ${message}`);
      setStepStatus(runId, "Planning", "FAIL");
      memoryStore.updateRun(runId, { status: "FAILED", error: message });
    }
  },
};
