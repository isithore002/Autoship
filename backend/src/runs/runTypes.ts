export type RunStatus = "pending" | "running" | "completed" | "failed";

export type StepStatus = "pending" | "running" | "completed" | "failed";

export interface RunStep {
  id: string
  label: string
  status: StepStatus
  logs: string[]
  startedAt?: number
  endedAt?: number
  retries?: number
  outputs?: Record<string, unknown>
  canFail?: boolean
}


export interface RunArtifacts {
  planJson?: string;
  lintReport?: string;
  testReport?: string;
  buildReport?: string;
  installReport?: string;
  diffPatch?: string;
  screenshots?: string[];
}

export interface Run {
  id: string;

  userId?: string;

  goal: string;
  template: string;

  status: RunStatus;

  logs: string[];

  createdAt: number;
  updatedAt: number;

  deployedUrl?: string;
  previewUrl?: string;

  timelineSteps: RunStep[];

  artifacts: RunArtifacts;
}
