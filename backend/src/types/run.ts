export type RunStatus = "CREATED" | "RUNNING" | "COMPLETED" | "FAILED";

export type StepStatus = "PENDING" | "RUNNING" | "PASS" | "FAIL";

export type RunStepName =
  | "Planning"
  | "Scaffolding"
  | "Building"
  | "Testing"
  | "Fixing (VibeCoder)"
  | "Deploying"
  | "Browser QA"
  | "Proof Bundle";

export type RunStep = {
  name: RunStepName;
  status: StepStatus;
  startedAt?: number;
  endedAt?: number;
  logs: string[];
};

export type RunArtifacts = {
  planJson?: string; // JSON string
  lintReport?: string;
  testReport?: string;
  buildLog?: string;
  buildReport?: string;
  deployUrl?: string;
  diffPatch?: string;
  installReport?: string;
};

export interface Run {
  id: string;
  goal: string;
  template: "nextjs_basic" | "nextjs_firebase" | "mern_crud";
  status: RunStatus;
  createdAt: number;
  updatedAt: number;
  injectFailure?: boolean;

  steps: RunStep[];
  liveLogs: string[];

  deployedUrl?: string; // Final deployed URL
  previewUrl?: string; // Live dev server URL during build
  previewPid?: number; // PID of the dev server process

  artifacts: RunArtifacts;

  error?: string;
};
