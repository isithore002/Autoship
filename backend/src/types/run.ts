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
  testReport?: string;
  buildLog?: string;
  deployUrl?: string;
  diffPatch?: string;
};

export type Run = {
  id: string;
  goal: string;
  template: "nextjs_basic" | "nextjs_firebase" | "mern_crud";
  status: RunStatus;
  createdAt: number;
  updatedAt: number;
  injectFailure?: boolean;

  steps: RunStep[];
  liveLogs: string[];

  deployedUrl?: string;
  artifacts: RunArtifacts;

  error?: string;
};
