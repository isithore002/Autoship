const ALLOWED_COMMANDS = new Set([
  "npm",
  "pnpm",
  "yarn"
])

export function assertCommandAllowed(command: string) {
  if (!ALLOWED_COMMANDS.has(command)) {
    throw new Error(`Command not allowed: ${command}`)
  }
}
