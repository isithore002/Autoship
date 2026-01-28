import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().default(5050),

  // ✅ MUST be coerce boolean (NOT z.boolean)
  SIMULATION_MODE: z
    .preprocess((val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") {
        const v = val.trim().toLowerCase();
        if (v === "true") return true;
        if (v === "false") return false;
        if (v === "1") return true;
        if (v === "0") return false;
        if (v === "yes") return true;
        if (v === "no") return false;
      }
      return val;
    }, z.boolean())
    .default(true),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3-flash-preview"),

  VERCEL_TOKEN: z.string().optional(),
  VERCEL_SCOPE: z.string().optional(),
});

export const env = envSchema.parse(process.env);

console.log("[ENV FILE]", import.meta.url);
console.log("[ENV] SIMULATION_MODE =", env.SIMULATION_MODE);
console.log("[ENV RAW] SIMULATION_MODE =", process.env.SIMULATION_MODE);
console.log("[ENV] VERCEL_TOKEN =", env.VERCEL_TOKEN ? "✅ configured" : "❌ not set (will use simulated deploy)");
console.log("[ENV] GEMINI_API_KEY =", env.GEMINI_API_KEY ? "✅ configured" : "❌ not set");
