import { spawn } from "child_process"
import { assertCommandAllowed } from "./sandbox"
import { env } from "../config/env"

export function runCommand({
  command,
  cwd,
  onLog
}: {
  command: string
  cwd: string
  onLog: (line: string) => void
}) {
  assertCommandAllowed(command)

  return new Promise<{ exitCode: number }>((resolve) => {
    const child = spawn(command, {
      shell: true,
      cwd
    })

    const timeout = setTimeout(() => {
      onLog("⏱️ Command timed out")
      child.kill("SIGKILL")
    }, env.RUN_TIMEOUT_MS)

    child.stdout.on("data", d => onLog(d.toString()))
    child.stderr.on("data", d => onLog(d.toString()))

    child.on("close", code => {
      clearTimeout(timeout)
      resolve({ exitCode: code ?? 1 })
    })
  })
}
