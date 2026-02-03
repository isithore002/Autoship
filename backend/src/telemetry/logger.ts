import { runStore } from "../runs/runStore"

export function appendLog(runId: string, line: string) {
  runStore.update(runId, r => {
    r.logs.push(line)
    r.updatedAt = Date.now()
  })
}
