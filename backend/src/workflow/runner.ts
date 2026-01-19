export interface Runner {
  start(runId: string): Promise<void>;
}
