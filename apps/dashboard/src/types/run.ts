export type StepStatus = "pending" | "running" | "completed" | "failed";

export interface RunStep {
  id: string;          // command id (ex: "npm install")
  name: string;        // human label
  status: StepStatus;
  startedAt?: number;
  endedAt?: number;
  logs: string[];
  outputs?: Record<string, unknown>;
}

export interface RunArtifacts {
  planJson?: string;
  lintReport?: string;
  testReport?: string;
  buildReport?: string;
  installReport?: string;
  diffPatch?: string;
}

export interface Run {
  id: string;
  goal: string;
  template: string;

  status: "pending" | "running" | "completed" | "failed";

  logs: string[];

  createdAt: number;
  updatedAt: number;

  deployedUrl?: string;
  previewUrl?: string;

  timelineSteps: RunStep[];
  artifacts: RunArtifacts;
}

export interface Settings {
  deployProvider: "vercel" | "firebase" | "netlify";
  maxRetryCount: number;
  modelChoice: "gemini-3-pro" | "gemini-3-flash";
}

export const TEMPLATES = [
  { value: "nextjs-website", label: "Next.js Website" },
  { value: "nextjs-firebase", label: "Next.js + Firebase App" },
  { value: "mern-crud", label: "MERN CRUD App" },
] as const;
