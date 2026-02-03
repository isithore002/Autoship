import type { Run as FrontendRun, RunStep, RunArtifacts } from "@/types/run"

// Backend (current agent-driven backend)
type BackendRunStatus = "pending" | "running" | "completed" | "failed"
type BackendStepStatus = "pending" | "running" | "completed" | "failed"

interface BackendStep {
  id: string
  label: string
  status: BackendStepStatus
  logs?: string[]
  startedAt?: string | number
  endedAt?: string | number
}

interface BackendArtifacts {
  planJson?: string
  testResults?: string
  buildOutput?: string
  installReport?: string
  lintReport?: string
  diff?: string
}

interface BackendRun {
  id: string
  status: BackendRunStatus
  goal?: string
  template?: string
  createdAt: number
  updatedAt?: number
  logs?: string[]
  steps?: BackendStep[]
  deployedUrl?: string
  previewUrl?: string
  artifacts?: BackendArtifacts
}

// status passthrough
function convertStatus(status: BackendRunStatus): FrontendRun["status"] {
  return status;
}

function convertStepStatus(status: BackendStepStatus): RunStep["status"] {
  return status;
}

function convertArtifacts(backend?: BackendArtifacts): RunArtifacts {
  return {
    planJson: backend?.planJson,
    testReport: backend?.testResults,
    buildReport: backend?.buildOutput,
    installReport: backend?.installReport,
    lintReport: backend?.lintReport,
    diffPatch: backend?.diff,
  }
}

export function adaptBackendRun(backend: BackendRun): FrontendRun {
  const timelineSteps: RunStep[] = (backend.steps ?? []).map(step => ({
    id: step.id,
    name: step.label,
    status: convertStepStatus(step.status),
    logs: step.logs ?? [],
    startedAt: step.startedAt
      ? new Date(step.startedAt).getTime()
      : undefined,
    endedAt: step.endedAt
      ? new Date(step.endedAt).getTime()
      : undefined,
    outputs: {},
  }))

  return {
    id: backend.id,
    goal: backend.goal ?? "",
    template: backend.template ?? "",
    logs: backend.logs ?? [],
    status: convertStatus(backend.status),
    createdAt: new Date(backend.createdAt).getTime(),
    updatedAt: new Date(
      backend.updatedAt ?? backend.createdAt
    ).getTime(),
    deployedUrl: backend.deployedUrl,
    previewUrl: backend.previewUrl,
    timelineSteps,
    artifacts: convertArtifacts(backend.artifacts),
  }
}

// kept for compatibility, backend ignores template now
export function convertTemplateToBackend(_template: string): string {
  return ""
}
