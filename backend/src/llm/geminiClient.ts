import { env } from "../config/env"

const DEFAULT_MODEL = "gemini-3-flash-preview" 
export async function callGemini(prompt: string, temperature = 0.2, model = DEFAULT_MODEL): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment")
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`

  let res: Response
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: 4096 }
      })
    })
  } catch (err) {
    throw new Error(`Failed to call Gemini API: ${(err as Error).message}`)
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gemini API error [${res.status}]: ${text}`)
  }

  let data: any
  try {
    data = await res.json()
  } catch (err) {
    throw new Error(`Invalid JSON from Gemini API: ${(err as Error).message}`)
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    console.error("Full Gemini response:", JSON.stringify(data, null, 2))
    throw new Error("Gemini returned empty content")
  }

  return text
}
