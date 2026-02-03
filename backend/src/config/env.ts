import { z } from "zod"
import path from "node:path"

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(5050),

  WORKSPACE_ROOT: z.string().default("workspaces"),
  ARTIFACT_ROOT: z.string().default("artifacts"),

  RUN_TIMEOUT_MS: z.coerce.number().default(5 * 60 * 1000),

  // Agent API keys
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional()
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("❌ Invalid environment variables")
  console.error(parsed.error.format())
  process.exit(1)
}

const data = parsed.data

// Resolve roots once — everywhere else uses absolute paths
export const env = {
  ...data,
  WORKSPACE_ROOT: path.resolve(data.WORKSPACE_ROOT),
  ARTIFACT_ROOT: path.resolve(data.ARTIFACT_ROOT)
}
