import fs from "fs/promises"
import path from "path"
import { z } from "zod"
import { callGemini } from "../llm/geminiClient"

export interface ScaffoldResult {
  success: boolean
  reason?: string
}


const ScaffoldSchema = z.object({
  packageJson: z.object({
    name: z.string(),
    version: z.string(),
    scripts: z.record(z.string())
  }),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string()
    })
  )
})

export async function scaffoldingAgent(
  workspace: string,
  goal: string
): Promise<ScaffoldResult> {
  console.info("[Scaffold] Starting scaffolding agent")
  console.debug("[Scaffold] Workspace:", workspace)
  console.debug("[Scaffold] Goal:", goal)

  try {
    await fs.mkdir(workspace, { recursive: true })

    const files = await fs.readdir(workspace)
    if (files.length > 0) {
      console.info("[Scaffold] Workspace already initialized")
      return { success: true }
    }

    const prompt = `
You are a scaffolding agent.

STRICT RULES:
- Output ONLY valid JSON
- No markdown
- No explanations
- No trailing commas
- No comments
- Must be parseable by JSON.parse

Goal: ${goal}

Return exactly:

{
  "packageJson": {
    "name": "string",
    "version": "string",
    "scripts": {
      "dev": "string",
      "build": "string",
      "test": "string"
    }
  },
  "files": [
    {
      "path": "string",
      "content": "string"
    }
  ]
}
`

    let raw: string
    try {
      raw = await callGeminiWithRetry(prompt)
      console.debug("[Scaffold] Raw LLM output:", raw)
    } catch (err) {
      console.error("[Scaffold] Gemini failed after retries", err)
      return { success: false, reason: "LLM failed" }
    }

    let parsedJson: unknown
    try {
      const extracted = extractJson(raw)
      parsedJson = JSON.parse(extracted)
    } catch (err) {
      console.error("[Scaffold] JSON parse failed")
      console.error(raw)
      return { success: false, reason: "Invalid JSON from LLM" }
    }

    const validated = ScaffoldSchema.safeParse(parsedJson)
    if (!validated.success) {
      console.error("[Scaffold] Zod validation failed")
      console.error(validated.error.format())
      return { success: false, reason: "LLM JSON schema invalid" }
    }

    const result = validated.data

    await fs.writeFile(
      path.join(workspace, "package.json"),
      JSON.stringify(result.packageJson, null, 2)
    )

    for (const f of result.files) {
      const filePath = path.join(workspace, f.path)
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, f.content)
    }

    console.info("[Scaffold] Scaffolding completed successfully")
    return { success: true }

  } catch (err) {
    console.error("[Scaffold] Unexpected error", err)
    return { success: false, reason: "Scaffolding error" }
  }
}

async function callGeminiWithRetry(prompt: string): Promise<string> {
  const temps = [0.2, 0.6] // retry once with higher creativity

  let lastError: unknown

  for (let i = 0; i < temps.length; i++) {
    try {
      console.debug(`[Scaffold] Gemini attempt ${i + 1}, temp=${temps[i]}`)
      return await callGemini(prompt, temps[i], undefined)
    } catch (err) {
      lastError = err
    }
  }

  throw lastError
}
function extractJson(raw: string): string {
  const first = raw.indexOf("{")
  const last = raw.lastIndexOf("}")
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found in LLM output")
  }
  return raw.slice(first, last + 1)
}
