import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";

export function getGenAI() {
  if (!env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in backend/.env");
  }

  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}
