import fs from "fs"
import path from "path"
import { AgentContext, AgentResult, PlanStep } from "./agentTypes"
import { callGemini } from "../llm/geminiClient"

const FALLBACK_PLAN: PlanStep[] = [
  {
    id: "pnpm",
    args: ["install"],
    label: "Install dependencies",
    canFail: false,
    tools: []
  }
]

const ALLOWED_COMMANDS = new Set(["npm", "pnpm", "yarn"])
const ALLOWED_ARGS = new Set(["install", "test", "run", "build"])
const ALLOWED_TOOLS = new Set(["vitest", "jest", "vite"])

function extractJsonArray(raw: string): any[] | null {
  raw = raw.replace(/```json/g, "").replace(/```/g, "").trim()
  const start = raw.indexOf("[")
  const end = raw.lastIndexOf("]")
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(raw.slice(start, end + 1))
  } catch {
    return null
  }
}

function detectCapabilities(workspace: string) {
  const pkgPath = path.join(workspace, "package.json")
  if (!fs.existsSync(pkgPath)) {
    return { hasBuild: false, hasTest: false }
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
  return {
    hasBuild: Boolean(pkg.scripts?.build),
    hasTest: Boolean(pkg.scripts?.test)
  }
}

export async function plannerAgent(
  prompt: string,
  ctx: AgentContext
): Promise<AgentResult<PlanStep[]>> {
  const systemPrompt = `
Return ONLY a JSON array.

Each item:
{
  "command": "npm | pnpm | yarn",
  "args": ["install" | "test" | "run" | "build"],
  "label": "string",
  "canFail": boolean,
  "tools": ["vitest" | "jest" | "vite"]
}

Rules:
- install → tools: []
- test → tools: ["vitest"] unless jest is explicit
- build → tools: ["vite"] only if frontend build is needed
- never include lint

User goal:
${prompt}
`.trim()

  let raw: string
  try {
    raw = await callGemini(systemPrompt)
  } catch {
    return { success: true, output: FALLBACK_PLAN }
  }

  const parsed = extractJsonArray(raw)
  if (!Array.isArray(parsed)) {
    return { success: true, output: FALLBACK_PLAN }
  }

  const validated: PlanStep[] = []

  for (const step of parsed) {
    if (
      typeof step !== "object" ||
      typeof step.command !== "string" ||
      !ALLOWED_COMMANDS.has(step.command) ||
      !Array.isArray(step.args) ||
      step.args.some((a: string) => typeof a !== "string" || !ALLOWED_ARGS.has(a)) ||
      typeof step.label !== "string" ||
      (step.tools && !Array.isArray(step.tools)) ||
      (step.tools && step.tools.some((t: string) => !ALLOWED_TOOLS.has(t)))
    ) {
      continue
    }

    validated.push({
      id: step.command === "npm" || step.command === "yarn" ? "pnpm" : step.command,
      args: step.args,
      label: step.label,
      canFail: Boolean(step.canFail),
      tools: step.tools ?? []
    })
  }

  const caps = detectCapabilities(ctx.workspace)

  const filtered = validated.filter(step => {
    if (step.args.includes("build") && !caps.hasBuild) return false
    if (step.args.includes("test") && !caps.hasTest) return false
    return true
  })

  return {
    success: true,
    output: filtered.length ? filtered : FALLBACK_PLAN,
    meta: {
      llmPlan: parsed,
      finalPlan: filtered.length ? filtered : FALLBACK_PLAN
    }
  }
}
