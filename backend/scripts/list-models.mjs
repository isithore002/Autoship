import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const key = process.env.GEMINI_API_KEY;
if (!key) {
  throw new Error("Missing GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(key);

const candidates = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-pro",
  "gemini-pro-vision",
];

for (const name of candidates) {
  try {
    const model = genAI.getGenerativeModel({ model: name });
    const res = await model.generateContent("Say OK");
    const preview = res.response?.text?.() ?? "";
    console.log("✅ works:", name, "->", preview.slice(0, 20));
  } catch (err) {
    const msg = err?.message || String(err);
    console.log("❌ fails:", name, "->", msg.slice(0, 160));
  }
}
