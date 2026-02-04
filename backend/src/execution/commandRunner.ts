import { spawn } from "child_process"
import { assertCommandAllowed } from "./sandbox"
import { env } from "../config/env"
import os from "os"

function resolveCommand(command: string, args: string[]) {
  if (os.platform() === "win32") {
    if (command === "pnpm") {
      return { cmd: "cmd.exe", args: ["/c", "pnpm", ...args] }
    }
    if (command === "npm") {
      return { cmd: "cmd.exe", args: ["/c", "npm", ...args] }
    }
    if (command === "yarn") {
      return { cmd: "cmd.exe", args: ["/c", "yarn", ...args] }
    }
  }

  return { cmd: command, args }
}

export function runCommand({
  command,
  args,
  cwd,
  onLog
}: {
  command: string
  args: string[]
  cwd: string
  onLog: (line: string) => void
}) {
  assertCommandAllowed(command)

  const resolved = resolveCommand(command, args)

  return new Promise<{ exitCode: number }>((resolve) => {
    const child = spawn(resolved.cmd, resolved.args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
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

    child.on("error", err => {
      clearTimeout(timeout)
      onLog(`💥 spawn error: ${err.message}`)
      resolve({ exitCode: 1 })
    })
  })
}
