import type { Run, RunArtifacts, RunStepName } from "../types/run";
import { memoryStore } from "../store/memoryStore";
import { writeArtifacts } from "../artifacts/artifactWriter";
import type { Runner } from "./runner";
import { runCommand } from "../tools/runCommand";
import { ensureWorkspace } from "./workspace";

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export const simulationRunner: Runner = {
  start: startSimulationRun,
};

function pushLog(runId: string, message: string) {
  const run = memoryStore.getRun(runId);
  if (!run) return;
  run.liveLogs.push(message);
  run.updatedAt = Date.now();
}

function setStepStatus(runId: string, stepName: RunStepName, status: "PENDING" | "RUNNING" | "PASS" | "FAIL") {
  const run = memoryStore.getRun(runId);
  if (!run) return;

  const step = run.steps.find((s) => s.name === stepName);
  if (!step) return;

  step.status = status;
  if (status === "RUNNING") step.startedAt = Date.now();
  if (status === "PASS" || status === "FAIL") step.endedAt = Date.now();

  run.updatedAt = Date.now();
}

function updateArtifacts(runId: string, artifacts: Partial<RunArtifacts>) {
  const run = memoryStore.getRun(runId);
  if (!run) return;

  memoryStore.updateRun(runId, {
    artifacts: {
      ...run.artifacts,
      ...artifacts,
    },
  });
}

function fakePlan(run: Run) {
  return {
    goal: run.goal,
    template: run.template,
    tech_stack: {
      frontend: "Next.js + TypeScript + Tailwind",
      backend: "Next.js API Routes / Node tool runner",
      db: run.template === "nextjs_firebase" ? "Firebase Firestore" : "None",
      deployment: "Vercel",
    },
    milestones: [
      {
        id: "M1",
        title: "Setup",
        tasks: [
          { id: "T1", action: "Scaffold project", tool: "run_command", success_criteria: "Next.js boots" },
          { id: "T2", action: "Add lint + basic build", tool: "run_command", success_criteria: "Build passes" },
        ],
      },
      {
        id: "M2",
        title: "Core Features",
        tasks: [
          { id: "T3", action: "Implement UI pages", tool: "write_file", success_criteria: "Pages render" },
          { id: "T4", action: "Add API routes", tool: "write_file", success_criteria: "API responds" },
          { id: "T5", action: "Add tests", tool: "write_file", success_criteria: "Tests pass" },
        ],
      },
    ],
    success_criteria: ["Lint passes", "Tests pass", "Build passes", "Deployed preview works"],
  };
}

export async function startSimulationRun(runId: string) {
  const run = memoryStore.getRun(runId);
  if (!run) return;

  if (run.status === "RUNNING") return;

  memoryStore.updateRun(runId, { status: "RUNNING" });
  const activeRun = memoryStore.getRun(runId);
  const shouldInjectFailure = !!activeRun?.injectFailure;

  const workspaceCwd = ensureWorkspace(runId);
  pushLog(runId, `[Workspace] Created workspace at apps/generated/${runId}`);

  pushLog(runId, "[Tool] Running command: node -v");
  const result = await runCommand("node -v", {
    cwd: workspaceCwd,
    onLine: (line) => pushLog(runId, `[run_command] ${line}`),
  });
  pushLog(runId, `[Tool] run_command finished code=${result.code} (${result.durationMs}ms)`);

  pushLog(runId, `[AutoShip] Starting run ${runId}`);
  pushLog(runId, `[Goal] ${run.goal}`);
  if (shouldInjectFailure) {
    pushLog(runId, `[Demo Mode] Failure injection enabled - Testing step will fail and self-fix`);
  }

  try {
    // 1) Planning
    setStepStatus(runId, "Planning", "RUNNING");
    pushLog(runId, "[Planning] Analyzing goal and generating milestone plan...");
    await sleep(1800);

    const planObj = fakePlan(run);
    const planJson = JSON.stringify(planObj, null, 2);

    updateArtifacts(runId, { planJson });

    pushLog(runId, "[Planning] ✅ Plan generated (plan.json)");
    setStepStatus(runId, "Planning", "PASS");

    // 2) Scaffolding
    setStepStatus(runId, "Scaffolding", "RUNNING");
    pushLog(runId, "[Scaffolding] Creating project structure...");
    await sleep(1600);
    pushLog(runId, "[Scaffolding] ✅ Workspace ready");
    setStepStatus(runId, "Scaffolding", "PASS");

    // 3) Building
    setStepStatus(runId, "Building", "RUNNING");
    pushLog(runId, "[Building] Generating application code...");
    await sleep(2000);
    pushLog(runId, "[Building] ✅ Core modules generated");
    setStepStatus(runId, "Building", "PASS");

    // 4) Testing
    setStepStatus(runId, "Testing", "RUNNING");
    pushLog(runId, "[Testing] Running lint + unit tests...");
    await sleep(1600);

    const runState = memoryStore.getRun(runId)!;
    const shouldInjectFailure = !!runState.injectFailure;

    if (shouldInjectFailure) {
      const failingTestReport = [
        "✖ 1 test failed",
        "✓ 11 tests passed",
        "",
        "FAIL  tests/api.timetable.test.ts",
        "  ● Timetable API should generate a schedule",
        "    Expected status 200 but received 500",
        "",
        "Error: Generator returned null schedule",
        "Stack: /src/core/generator.ts:81",
        "",
        "Hint: Fix null guard clause in generator",
      ].join("\n");

      memoryStore.updateRun(runId, {
        artifacts: {
          ...memoryStore.getRun(runId)!.artifacts,
          testReport: failingTestReport,
        },
      });

      pushLog(runId, "[Testing] ❌ Tests failed (1 failing test)");
      pushLog(runId, "[Testing] Escalating to Fixing (VibeCoder)...");
      setStepStatus(runId, "Testing", "FAIL");

      // 5) Fixing (VibeCoder)
      setStepStatus(runId, "Fixing (VibeCoder)", "RUNNING");
      pushLog(runId, "[Fixing (VibeCoder)] Reading failure stack trace...");
      await sleep(900);

      pushLog(runId, "[Fixing (VibeCoder)] Root cause: generator returns null when subjects list is empty");
      await sleep(1100);

      const diffPatch = [
        "diff --git a/src/core/generator.ts b/src/core/generator.ts",
        "index 1a2b3c4..9d8e7f6 100644",
        "--- a/src/core/generator.ts",
        "+++ b/src/core/generator.ts",
        "@@ -78,7 +78,12 @@ export function generateTimetable(subjects: Subject[]) {",
        "-  if (!subjects) return null;",
        "+  // Guard clause: prevent null schedule generation",
        "+  if (!subjects || subjects.length === 0) {",
        "+    return createDefaultSchedule();",
        "+  }",
        "",
        "   const schedule = buildSchedule(subjects);",
        "   return schedule;",
        " }",
        "",
      ].join("\n");

      memoryStore.updateRun(runId, {
        artifacts: {
          ...memoryStore.getRun(runId)!.artifacts,
          diffPatch,
        },
      });

      pushLog(runId, "[Fixing (VibeCoder)] Applying patch (guard clause + default schedule fallback)...");
      await sleep(1400);

      pushLog(runId, "[Fixing (VibeCoder)] ✅ Patch applied (diff.patch generated)");
      setStepStatus(runId, "Fixing (VibeCoder)", "PASS");

      setStepStatus(runId, "Testing", "RUNNING");
      pushLog(runId, "[Testing] Re-running unit tests after patch...");
      await sleep(1500);

      const passingTestReport = [
        "✔ 12 tests passed",
        "✔ 0 tests failed",
        "✔ Coverage: 94%",
        "",
        "Suite: api",
        "Suite: components",
        "Suite: utils",
      ].join("\n");

      memoryStore.updateRun(runId, {
        artifacts: {
          ...memoryStore.getRun(runId)!.artifacts,
          testReport: passingTestReport,
        },
      });

      pushLog(runId, "[Testing] ✅ All tests passed after fix");
      setStepStatus(runId, "Testing", "PASS");
    } else {
      const testReport = [
        "✔ 12 tests passed",
        "✔ 0 tests failed",
        "✔ Coverage: 94%",
        "",
        "Suite: api",
        "Suite: components",
        "Suite: utils",
      ].join("\n");

      memoryStore.updateRun(runId, {
        artifacts: {
          ...memoryStore.getRun(runId)!.artifacts,
          testReport,
        },
      });

      pushLog(runId, "[Testing] ✅ All tests passed (test-report.txt)");
      setStepStatus(runId, "Testing", "PASS");

      setStepStatus(runId, "Fixing (VibeCoder)", "RUNNING");
      pushLog(runId, "[Fixing (VibeCoder)] No critical errors detected");
      await sleep(800);
      pushLog(runId, "[Fixing (VibeCoder)] ✅ No fixes needed");
      setStepStatus(runId, "Fixing (VibeCoder)", "PASS");
    }

    // 6) Deploying
    setStepStatus(runId, "Deploying", "RUNNING");
    pushLog(runId, "[Deploying] Preparing deployment bundle...");
    await sleep(1400);
    pushLog(runId, "[Deploying] Uploading to Vercel...");
    await sleep(1600);

    const deployedUrl = `https://autoship-demo.vercel.app`;

    updateArtifacts(runId, { deployUrl: deployedUrl });
    memoryStore.updateRun(runId, {
      deployedUrl,
    });

    pushLog(runId, `[Deploying] ✅ Deployed to ${deployedUrl}`);
    setStepStatus(runId, "Deploying", "PASS");

    // 7) Browser QA
    setStepStatus(runId, "Browser QA", "RUNNING");
    pushLog(runId, "[Browser QA] Launching headless browser...");
    await sleep(1000);
    pushLog(runId, "[Browser QA] Running smoke tests...");
    await sleep(1600);
    pushLog(runId, "[Browser QA] Checking responsive layouts...");
    await sleep(800);
    pushLog(runId, "[Browser QA] Capturing screenshots...");
    await sleep(900);
    pushLog(runId, "[Browser QA] ✅ QA passed: 5/5 checks");
    setStepStatus(runId, "Browser QA", "PASS");

    // 8) Proof Bundle
    setStepStatus(runId, "Proof Bundle", "RUNNING");
    pushLog(runId, "[Proof Bundle] Generating proof artifacts...");
    await sleep(1500);

    const buildLog = [
      "✔ Build completed in 12.4s",
      "✔ Bundle size: 142kb gzipped",
      "✔ No blocking warnings",
    ].join("\n");

    updateArtifacts(runId, { buildLog });
    memoryStore.updateRun(runId, {
      status: "COMPLETED",
    });

    // write to disk
    writeArtifacts(memoryStore.getRun(runId)!);

    pushLog(runId, "[Proof Bundle] ✅ Artifacts saved to /artifacts/<runId>/");
    setStepStatus(runId, "Proof Bundle", "PASS");

    pushLog(runId, "[AutoShip] ✅ Run completed successfully.");
  } catch (err: any) {
    const message = err?.message ?? "Unknown error";
    memoryStore.updateRun(runId, { status: "FAILED", error: message });
    pushLog(runId, `[AutoShip] ❌ Run failed: ${message}`);

    // mark any running step as FAIL
    const r = memoryStore.getRun(runId);
    if (r) {
      for (const s of r.steps) {
        if (s.status === "RUNNING") s.status = "FAIL";
      }
    }
  } finally {
    const r = memoryStore.getRun(runId);
    if (r) r.updatedAt = Date.now();
  }
}

