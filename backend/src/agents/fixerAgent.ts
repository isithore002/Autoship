import fs from "fs"
import path from "path"
import { AgentContext, AgentResult } from "./agentTypes"
import { callGemini } from "../llm/geminiClient"


export async function fixerAgent(
  ctx: AgentContext
): Promise<AgentResult<void>> {
  if (!ctx.failedStep) {
    return { success: false, reason: "No failed step provided" }
  }

  const errorLogs = ctx.failedStep.logs?.join("\n") ?? ""
  const workspaceSnapshot = snapshotWorkspace(ctx.workspace)
  const artifactSnapshot = snapshotArtifacts(ctx.artifactRoot, ctx.runId)

  const prompt = `
You are an autonomous code-fixing agent.

A workflow step FAILED.

=== STEP ERROR LOGS ===
${errorLogs}

=== ARTIFACT OUTPUTS ===
${artifactSnapshot}

=== PROJECT FILES ===
${workspaceSnapshot}

TASK:
- Identify the most likely cause of failure
- Propose ONE minimal fix
- Return ONLY valid JSON:
{
  "filePath": "<relative path from workspace root>",
  "newContent": "<full file contents>"
}

Rules:
- Do not explain
- Do not include markdown
- Do not modify dependency versions unless required
`

  let llmResponse: string
  try {
    llmResponse = await callGemini(prompt)
  } catch {
    return { success: false, reason: "LLM call failed" }
  }

  let patch: { filePath: string; newContent: string }
  try {
    patch = JSON.parse(llmResponse)
  } catch {
    return { success: false, reason: "Invalid LLM JSON response" }
  }

  const targetPath = path.join(ctx.workspace, patch.filePath)

  // Safety guard: no escaping workspace
  if (!targetPath.startsWith(ctx.workspace)) {
    return { success: false, reason: "Unsafe file path" }
  }

  fs.writeFileSync(targetPath, patch.newContent, "utf-8")

  return { success: true }
}

function snapshotWorkspace(workspace: string): string {
  const files = [
    "src/index.ts",
    "package.json",
    "tsconfig.json",
    "tests/sample.test.ts"
  ]

  return files
    .map((file) => {
      const fullPath = path.join(workspace, file)
      if (!fs.existsSync(fullPath)) return ""
      return `--- ${file} ---\n${fs.readFileSync(fullPath, "utf-8")}`
    })
    .filter(Boolean)
    .join("\n\n")
}
function snapshotArtifacts(artifactRoot: string, runId: string): string {
  const runArtifactsDir = path.join(artifactRoot, runId)

  if (!fs.existsSync(runArtifactsDir)) return "No artifacts found."

  const files = [
    "test-results.txt",
    "build-output.txt"
  ]

  return files
    .map((file) => {
      const fullPath = path.join(runArtifactsDir, file)
      if (!fs.existsSync(fullPath)) return ""
      return `--- ${file} ---\n${fs.readFileSync(fullPath, "utf-8")}`
    })
    .filter(Boolean)
    .join("\n\n")
}

