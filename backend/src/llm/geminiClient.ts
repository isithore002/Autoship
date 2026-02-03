import { env } from "../config/env"

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"

export async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `${GEMINI_ENDPOINT}?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      })
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${err}`)
  }

  const data = await res.json()

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error("Empty Gemini response")
  }

  return text
}
