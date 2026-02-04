import { runStore } from "../runs/runStore"
import { createWorkspace } from "../execution/workspace"
import { runCommand } from "../execution/commandRunner"
import { appendLog } from "../telemetry/logger"
import { updateStepStatus } from "../telemetry/timeline"
import { fixerAgent } from "../agents/fixerAgent"
import { collectDiff } from "../artifacts/collectors/diff"
import { collectTestResults } from "../artifacts/collectors/testResults"
import { collectBuildOutput } from "../artifacts/collectors/buildOutput"


type Telemetry = {
  stepsExecuted: number
  autoInstalls: number
  autoInstallFailures: number
  skippedSteps: number
}

function normalizeCommand(cmd: string) {
  if (cmd === "npm" || cmd === "yarn") return "pnpm"
  return cmd
}

export async function startWorkflow(runId: string) {
  const telemetry: Telemetry = {
    stepsExecuted: 0,
    autoInstalls: 0,
    autoInstallFailures: 0,
    skippedSteps: 0
  }

  runStore.update(runId, r => {
    r.status = "running"
    r.updatedAt = Date.now()
  })

  appendLog(runId, "workflow started")

  const workspace = await createWorkspace(runId)

  try {
    while (true) {
      const run = runStore.get(runId)
      if (!run) return

      const step = run.timelineSteps.find(s => s.status === "pending")
      if (!step) break

      const normalizedId = normalizeCommand(step.id)

      updateStepStatus(runId, step.id, "running")
      appendLog(runId, `▶ ${step.label}`)

      const result = await runCommand({
        command: normalizedId,
        args: step.args ?? [],
        cwd: workspace,
        onLog: line => {
          appendLog(runId, line)
          runStore.appendStepLog(runId, step.id, line)
        }
      })

      telemetry.stepsExecuted++

      if (result.exitCode === 0) {
        updateStepStatus(runId, step.id, "completed")
        appendLog(runId, `✅ ${step.label}`)
        continue
      }

      updateStepStatus(runId, step.id, "failed")
      appendLog(runId, `❌ ${step.label}`)

      if (step.canFail && step.retries && step.retries > 0) {
        appendLog(runId, "🧠 Fixer agent engaged")

        await fixerAgent({
          runId,
          workspace,
          logs: run.logs,
          failedStep: {
            id: step.id,
            label: step.label,
            logs: step.logs
          },
          artifactRoot: ""
        })

        step.retries -= 1
        updateStepStatus(runId, step.id, "pending")
        continue
      }

      throw new Error(`Step failed: ${step.label}`)
    }

    runStore.update(runId, r => {
      r.status = "completed"
      r.updatedAt = Date.now()
    })

    appendLog(runId, `telemetry ${JSON.stringify(telemetry)}`)
    appendLog(runId, "workflow completed")

  } catch (err: any) {
    appendLog(runId, `💥 ${err.message}`)
    appendLog(runId, `telemetry ${JSON.stringify(telemetry)}`)

    runStore.update(runId, r => {
      r.status = "failed"
      r.updatedAt = Date.now()
    })
  } finally {
    const run = runStore.get(runId)
    collectDiff(runId, workspace)
    collectTestResults(runId, run?.logs ?? [])
    collectBuildOutput(runId, run?.logs ?? [])
  }
}
