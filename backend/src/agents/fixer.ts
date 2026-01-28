import type { PlanJson } from "./planner";
import { callGeminiJson } from "../gemini/client";

export type FixerInput = {
  goal: string;
  template: string;
  plan?: PlanJson;
  failingCommand: string;
  errorLog: string;
  filesHint?: string[];
};

export type FixerOutput = {
  summary: string;
  diffPatch: string;
};

/**
 * Gemini Fixer Agent
 * Returns a unified diff patch ONLY touching files in the generated workspace.
 */
export async function geminiFixer(input: FixerInput): Promise<FixerOutput> {
  const prompt = `
You are AutoShip Fixer.

Task:
- A build/test command failed in a generated Vite + React + TS app.
- You MUST return a unified git diff patch to fix it.
- Keep changes minimal. Do NOT add new dependencies unless necessary.

Constraints:
- ONLY modify files under the generated workspace (examples: src/**, package.json, tsconfig.json, vite config).
- The output must be a valid unified diff patch starting with: diff --git ...
- No markdown. No explanation besides the JSON fields.

Goal:
${input.goal}

Template:
${input.template}

Failing command:
${input.failingCommand}

Error log:
${input.errorLog}

Files hint:
${(input.filesHint || []).slice(0, 30).join("\n")}
`;

  const schema = {
    type: "object",
    properties: {
      summary: { type: "string" },
      diffPatch: { type: "string" },
    },
    required: ["summary", "diffPatch"],
  } as const;

  const out = await callGeminiJson<FixerOutput>({
    purpose: "fixer",
    prompt,
    schema,
    temperature: 0.2,
  });

  if (!out?.diffPatch || !out.diffPatch.includes("diff --git")) {
    throw new Error("Gemini Fixer did not return a valid unified diff patch.");
  }

  return out;
}
