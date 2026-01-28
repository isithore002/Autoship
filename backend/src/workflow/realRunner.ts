import type { Runner } from "./runner";
import { memoryStore } from "../store/memoryStore";
import { ensureWorkspace } from "./workspace";
import { env } from "../config/env";
import { generatePlan } from "../agents/planner";
import { writeArtifacts } from "../artifacts/artifactWriter";
import { pushLog, setStepStatus } from "./simRunnerUtils";
import { generateFallbackPlan, startExecutionRun } from "./simRunner";

export const realRunner: Runner = {
  async start(runId: string) {
    const run = memoryStore.getRun(runId);
    if (!run) return;
    if (run.status === "RUNNING") return;

    memoryStore.updateRun(runId, { status: "RUNNING" });

    const workspacePath = ensureWorkspace(runId);
    pushLog(runId, `[Workspace] Created workspace at apps/generated/${runId}`);
    pushLog(runId, `[Planning] Calling Gemini planner...`);
    pushLog(runId, `[Planning] Using model: ${env.GEMINI_MODEL}`);

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

      pushLog(runId, `[Execution] ✅ Planning complete — starting execution pipeline (real commands)...`);

      await startExecutionPipeline(runId);

      return;
    } catch (error: any) {
      const message = error?.message ?? "Unknown error";
      pushLog(runId, `[Planning] ❌ Gemini planner failed: ${message}`);
      pushLog(runId, `[Planning] Falling back to deterministic planner...`);

      try {
        const fallbackPlan = generateFallbackPlan(run);
        const fallbackJson = JSON.stringify(fallbackPlan, null, 2);

        const current = memoryStore.getRun(runId);
        memoryStore.updateRun(runId, {
          artifacts: {
            ...(current?.artifacts ?? {}),
            planJson: fallbackJson,
          },
        });

        pushLog(runId, `[Planning] ✅ Fallback plan.json generated`);
        setStepStatus(runId, "Planning", "PASS");

        const updatedRun = memoryStore.getRun(runId);
        if (updatedRun) {
          writeArtifacts(updatedRun);
        }

        pushLog(runId, `[Execution] ✅ Fallback applied — starting execution pipeline (real commands)...`);

        await startExecutionPipeline(runId);

        return;
      } catch (fallbackError: any) {
        const fallbackMessage = fallbackError?.message ?? "Unknown error";
        pushLog(runId, `[Planning] ❌ Fallback planner failed: ${fallbackMessage}`);
        setStepStatus(runId, "Planning", "FAIL");
        memoryStore.updateRun(runId, {
          status: "FAILED",
          error: `${message}; fallback error: ${fallbackMessage}`,
        });
      }
    }
  },
};

async function startExecutionPipeline(runId: string) {
  memoryStore.updateRun(runId, { status: "RUNNING" });

  try {
    pushLog(runId, "[Execution] ▶ Starting execution runner (real commands)...");
    await startExecutionRun(runId, { skipPlanning: true });
    pushLog(runId, "[Execution] ✅ Execution completed successfully");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    pushLog(runId, `[Execution] ❌ Execution runner failed: ${errorMessage}`);
    console.error("Execution runner error:", err);
    memoryStore.updateRun(runId, { status: "FAILED", error: errorMessage });
    throw err;
  }
}
