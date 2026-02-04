import "dotenv/config"
import { z } from "zod"
import path from "node:path"
import os from "node:os"
import fs from "node:fs"

// Extend your environment schema
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce.number().default(5050),

  WORKSPACE_ROOT: z.string().default("workspaces"),
  ARTIFACT_ROOT: z.string().default("artifacts"),
  RUN_TIMEOUT_MS: z.coerce.number().default(5 * 60 * 1000),

  // Agent API keys
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  OPENAI_API_KEY: z.string().optional(),

  // Firebase config
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  FIREBASE_CLIENT_EMAIL: z.string().min(1, "FIREBASE_CLIENT_EMAIL is required"),
  FIREBASE_PRIVATE_KEY: z.string().min(1, "FIREBASE_PRIVATE_KEY is required"),
  FIREBASE_DATABASE_URL: z.string().min(1, "FIREBASE_DATABASE_URL is required")
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
  ARTIFACT_ROOT: path.resolve(data.ARTIFACT_ROOT),

  // Firebase needs the private key to replace literal "\n" with real newlines
  FIREBASE_PRIVATE_KEY: data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
}
