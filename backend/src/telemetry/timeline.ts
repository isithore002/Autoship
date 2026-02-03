import { runStore } from "../runs/runStore"
import { StepStatus } from "../runs/runTypes"

export function updateStepStatus(
  runId: string,
  stepId: string,
  status: StepStatus
) {
  runStore.update(runId, run => {
    const step = run.timelineSteps.find(s => s.id === stepId)
    if (!step) return

    step.status = status

    if (status === "running") {
      step.startedAt = Date.now()
    }

    if (status === "completed" || status === "failed") {
      step.endedAt = Date.now()
    }
  })
}
