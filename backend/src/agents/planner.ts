import { env } from "../config/env";
import { createGeminiClient, isGeminiAvailable } from "../gemini/client";

export type PlanJson = {
  title: string;
  summary: string;
  milestones: Array<{ name: string; tasks: string[] }>;
};

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) return text.slice(first, last + 1).trim();

  return text.trim();
}

export async function generatePlan(goal: string, template: string): Promise<PlanJson> {
  // Fail fast: check Gemini availability before attempting
  if (!isGeminiAvailable()) {
    throw new Error("Gemini API key not configured - cannot generate plan");
  }

  // Create and validate the Gemini client (fails fast if model invalid)
  let model;
  try {
    model = createGeminiClient();
  } catch (err) {
    throw new Error(`Gemini init failed: ${(err as Error).message}`);
  }

  const prompt = `
You are AutoShip Planner.
Return ONLY valid JSON. No markdown.

Schema:
{
  "title": string,
  "summary": string,
  "milestones": [
    { "name": string, "tasks": string[] }
  ]
}

Goal: ${goal}
Template: ${template}

Rules:
- 4–7 milestones
- Each milestone has 3–6 tasks
- Tasks must be engineering steps
`;

  // Use the correct SDK method: model.generateContent()
  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
    },
  });

  const text = res.response?.text() ?? "";
  
  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  const jsonText = extractJson(text);

  try {
    return JSON.parse(jsonText) as PlanJson;
  } catch (parseErr) {
    throw new Error(`Failed to parse Gemini response as JSON: ${jsonText.slice(0, 200)}...`);
  }
}
