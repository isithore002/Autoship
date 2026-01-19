import { getGenAI } from "../gemini/client";
import { env } from "../config/env";

export type PlanJson = {
  title: string;
  summary: string;
  milestones: Array<{
    name: string;
    tasks: string[];
  }>;
};

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text.trim();
}

export async function generatePlan(goal: string, template: string): Promise<PlanJson> {
  const genAI = getGenAI();

  const res = await genAI.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Return ONLY valid JSON plan. No markdown, no commentary.\n\nSchema:\n{\n  "title": string,\n  "summary": string,\n  "milestones": [\n    {\n      "name": string,\n      "tasks": string[]\n    }\n  ]\n}\n\nGoal: ${goal}\nTemplate: ${template}\n\nRules:\n- 4 to 7 milestones\n- Each milestone has 3 to 6 tasks\n- Tasks must be engineering actions (scaffold UI, implement API, add tests, deploy, etc.)`,
          },
        ],
      },
    ],
  });

  const raw = res.text ?? "";

  const jsonText = extractJson(raw);
  const parsed = JSON.parse(jsonText) as PlanJson;

  if (!parsed.title) parsed.title = "AutoShip Plan";
  if (!parsed.milestones || !Array.isArray(parsed.milestones)) {
    throw new Error("Planner returned invalid JSON milestones");
  }

  return parsed;
}
