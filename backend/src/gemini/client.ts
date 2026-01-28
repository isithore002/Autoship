import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { env } from "../config/env";

let cachedClient: GoogleGenerativeAI | null = null;
let cachedModel: GenerativeModel | null = null;

/**
 * Check if Gemini is available (API key configured)
 */
export function isGeminiAvailable(): boolean {
  return !!env.GEMINI_API_KEY;
}

/**
 * Get the GoogleGenerativeAI client instance.
 * Throws if GEMINI_API_KEY is not configured.
 */
export function getGenAI(): GoogleGenerativeAI {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!cachedClient) {
    cachedClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  return cachedClient;
}

/**
 * Get a GenerativeModel instance for the specified model.
 * Throws if GEMINI_API_KEY is not configured.
 */
export function getGeminiModel(modelName = env.GEMINI_MODEL): GenerativeModel {
  const client = getGenAI();
  return client.getGenerativeModel({ model: modelName });
}

/**
 * Create and validate a Gemini client.
 * Fails fast if API key is missing or model is invalid.
 * This is the recommended way to initialize Gemini for agents.
 */
export function createGeminiClient(): GenerativeModel {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY missing - cannot initialize Gemini");
  }

  const modelName = env.GEMINI_MODEL;
  if (!modelName) {
    throw new Error("GEMINI_MODEL missing - cannot initialize Gemini");
  }

  const client = getGenAI();
  const model = client.getGenerativeModel({ model: modelName });

  if (!model || typeof model.generateContent !== "function") {
    throw new Error(`Gemini model "${modelName}" is not usable - generateContent method missing`);
  }

  return model;
}

type CallGeminiJsonArgs = {
  purpose: "planner" | "fixer";
  prompt: string;
  schema: any;
  temperature?: number;
};

export async function callGeminiJson<T>(args: CallGeminiJsonArgs): Promise<T> {
  // Use createGeminiClient for fail-fast validation
  let model;
  try {
    model = createGeminiClient();
  } catch (err) {
    throw new Error(`[Gemini ${args.purpose}] Init failed: ${(err as Error).message}`);
  }

  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: args.prompt }] }],
    generationConfig: {
      temperature: args.temperature ?? 0.2,
      responseMimeType: "application/json",
      responseSchema: args.schema,
    },
  } as any);

  const text = res.response?.text() ?? "";

  if (!text) {
    throw new Error(`[Gemini ${args.purpose}] Empty response from model`);
  }

  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`[Gemini ${args.purpose}] Failed to parse JSON output. Raw response:\n${text}`);
  }
}
