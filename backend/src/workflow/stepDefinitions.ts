import { WorkflowStep } from "./stepTypes"


export function createDefaultWorkflow(): WorkflowStep[] {
  return [
    {
      id: "npm",
      args: ["install"],
      label: "Install dependencies",
      status: "pending"
    },
    {
      id: "npm",
      args: ["test"],
      label: "Run tests",
      status: "pending",
      canFail: true,
      retries: 1
    },
    {
      id: "npm",
      args: ["run", "build"],
      label: "Build application",
      status: "pending"
    }
  ]
}
