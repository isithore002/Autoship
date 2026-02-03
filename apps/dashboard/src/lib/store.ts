import type { Run } from "@/types/run"

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050"

// ---------- Helpers ----------

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ---------- Backend → Frontend mapping ----------

function mapBackendRunToFrontend(run: any): Run {
  return {
    id: run.id,
    status: run.status,
    goal: run.goal ?? "",
    template: run.template ?? "",
    createdAt: new Date(run.createdAt).getTime(),
    updatedAt: new Date(
      run.updatedAt ?? run.createdAt
    ).getTime(),
    deployedUrl: run.deployedUrl,
    previewUrl: run.previewUrl,
    logs: run.logs ?? [],

    timelineSteps: Array.isArray(run.steps)
      ? run.steps.map((s: any) => ({
          id: s.id,
          name: s.label,
          status: s.status,
          logs: s.logs ?? [],
          startedAt: s.startedAt
            ? new Date(s.startedAt).toISOString()
            : undefined,
          endedAt: s.endedAt
            ? new Date(s.endedAt).toISOString()
            : undefined,
          outputs: {},
        }))
      : [],

    artifacts: {
      planJson: run.artifacts?.planJson,
      testReport: run.artifacts?.testResults,
      buildReport: run.artifacts?.buildOutput,
      diffPatch: run.artifacts?.diff,
      installReport: run.artifacts?.installReport,
      lintReport: run.artifacts?.lintReport,
    },
  }
}

// ---------- API ----------

export async function createRun(
  goal: string,
  _template?: string
): Promise<Run> {
  const { runId } = await http<{ runId: string }>("/api/runs", {
    method: "POST",
    body: JSON.stringify({ prompt: goal }),
  })

  const { run } = await http<{ run: any }>(`/api/runs/${runId}`)
  return mapBackendRunToFrontend(run)
}

export async function startRun(runId: string) {
  await http(`/api/runs/${runId}/start`, { method: "POST" })
}

export function pollRun(
  runId: string,
  onUpdate: (run: Run) => void,
  pollMs = 1500
) {
  let stopped = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const tick = async () => {
    if (stopped) return

    try {
      const { run } = await http<{ run: any }>(`/api/runs/${runId}`)
      const mapped = mapBackendRunToFrontend(run)
      onUpdate(mapped)

      if (mapped.status === "completed" || mapped.status === "failed") {
        stopped = true
        return
      }
    } catch {}

    if (!stopped) {
      timeoutId = setTimeout(tick, pollMs)
    }
  }

  tick()

  return () => {
    stopped = true
    if (timeoutId) clearTimeout(timeoutId)
  }
}

// ---------- Settings ----------

export interface Settings {
  deployProvider: "vercel" | "firebase" | "netlify"
  maxRetryCount: number
  modelChoice: "gemini-3-pro" | "gemini-3-flash"
}

export const defaultSettings: Settings = {
  deployProvider: "vercel",
  maxRetryCount: 3,
  modelChoice: "gemini-3-flash",
}

const SETTINGS_KEY = "autoship_settings"

export function getSettings(): Settings {
  try {
    if (typeof window === "undefined") return defaultSettings
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// ---------- Convenience ----------

export async function getRun(id: string): Promise<Run | undefined> {
  try {
    const { run } = await http<{ run: any }>(`/api/runs/${id}`)
    return mapBackendRunToFrontend(run)
  } catch {
    return undefined
  }
}

export async function getRuns(): Promise<Run[]> {
  try {
    const { runs } = await http<{ runs: any[] }>("/api/runs")
    return runs.map(mapBackendRunToFrontend)
  } catch {
    return []
  }
}

export function getArtifactsZipUrl(runId: string) {
  return `${BACKEND_URL.replace(/\/$/, "")}/api/runs/${runId}/artifacts.zip`
}
