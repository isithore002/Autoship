import { Run } from '@/types/run'
import { adaptBackendRun } from './runAdapter'

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050"

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `API error ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`)
    return res.ok
  } catch {
    return false
  }
}

export const api = {
  health: checkHealth,

  createRun: async (goal: string) => {
    return fetchApi<{ runId: string }>("/api/runs", {
      method: "POST",
      body: JSON.stringify({ prompt: goal })
    })
  },

  startRun: async (runId: string) => {
    return fetchApi<{ ok: boolean }>(`/api/runs/${runId}/start`, {
      method: "POST"
    })
  },

  getRun: async (runId: string): Promise<Run> => {
    const { run } = await fetchApi<{ run: any }>(`/api/runs/${runId}`)
    return adaptBackendRun(run)
  },

  getAllRuns: async (): Promise<Run[]> => {
    const { runs } = await fetchApi<{ runs: any[] }>("/api/runs")
    return runs.map(adaptBackendRun)
  }
}
