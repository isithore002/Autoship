export type StepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"

export interface WorkflowStep {
  
  id: string

  args: string[]

 
  label: string

  status: StepStatus

  logs?: string[]

  canFail?: boolean

  retries?: number

  startedAt?: number
  endedAt?: number
}
