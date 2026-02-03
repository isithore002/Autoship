import { AgentContext, AgentResult, PlanStep } from "./agentTypes"
import { callGemini } from "../llm/geminiClient"

const ALLOWED_COMMANDS = new Set([
  "npm",
  "pnpm",
  "yarn"
])

const ALLOWED_ARGS = new Set([
  "install",
  "test",
  "run",
  "build",
  "lint"
])

export async function plannerAgent(
  prompt: string,
  _ctx: AgentContext
): Promise<AgentResult<PlanStep[]>> {
  const systemPrompt = `
You are an autonomous planning agent for a Node.js build system.

Your task:
- Analyze the user goal
- Generate an execution plan as JSON

Environment:
- Node.js project
- Commands run in an isolated workspace
- Package managers may include npm, pnpm, or yarn

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations
- JSON must be an array of steps
- Each step must include:
  - command: string (npm | pnpm | yarn)
  - args: string[] (safe arguments only)
  - label: string
  - canFail: boolean (optional)

User goal:
${prompt}
`

  let raw: string
  try {
    raw = await callGemini(systemPrompt)
  } catch (err) {
    return { success: false, reason: "LLM call failed" }
  }

  let steps: any[]
  try {
    steps = JSON.parse(raw)
  } catch {
    return { success: false, reason: "Invalid JSON from LLM" }
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    return { success: false, reason: "Empty plan" }
  }

  const validated: PlanStep[] = []

  for (const step of steps) {
    if (
      typeof step.command !== "string" ||
      !ALLOWED_COMMANDS.has(step.command)
    ) {
      continue
    }

    if (
      !Array.isArray(step.args) ||
      step.args.some(
        (a: string) => typeof a !== "string" || !ALLOWED_ARGS.has(a)
      )
    ) {
      continue
    }

    if (typeof step.label !== "string") {
      continue
    }

    validated.push({
      id: step.command,
      args: step.args,
      label: step.label,
      canFail: !!step.canFail
    })
  }

  if (validated.length === 0) {
    return { success: false, reason: "No safe steps generated" }
  }

  return {
    success: true,
    output: validated
  }
}
