const ALLOWED_COMMANDS = [
  "npm install",
  "npm test",
  "npm run build"
]

export function assertCommandAllowed(cmd: string) {
  const allowed = ALLOWED_COMMANDS.some(allowed =>
    cmd.startsWith(allowed)
  )

  if (!allowed) {
    throw new Error(`Command not allowed: ${cmd}`)
  }
}
