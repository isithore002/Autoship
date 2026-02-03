import { nanoid } from "nanoid"
import express, { Router } from "express"
import { runStore } from "../../runs/runStore"
import { Run } from "../../runs/runTypes"
import { startWorkflow } from "../../workflow/workflowEngine"
import { plannerAgent } from "../../agents/plannerAgent"
import { env } from "../../config/env"

const router: Router = express.Router()

router.post("/", async (req, res) => {
  const { prompt = "Build the application", template = "", userId } = req.body

  const runId = nanoid()

  const planResult = await plannerAgent(prompt, {
    runId,
    workspace: "",
    artifactRoot: env.ARTIFACT_ROOT,
    logs: []
  })

  if (!planResult.success || !planResult.output) {
    return res.status(500).json({ error: "Planning failed" })
  }

  const now = Date.now()

  const run: Run = {
    id: runId,
    userId,
    goal: prompt,
    template,
    status: "pending",
    logs: [],
    createdAt: now,
    updatedAt: now,
    deployedUrl: undefined,
    previewUrl: undefined,

    timelineSteps: planResult.output.map(step => ({
      id: step.id,
      label: step.label,
      status: "pending",
      logs: [],
      startedAt: undefined,
      endedAt: undefined,
      outputs: {},
      retries: step.canFail ? 1 : 0,
      canFail: step.canFail
    })),

    artifacts: {}
  }

  runStore.create(run)

  res.json({ run })
})

router.post("/:id/start", async (req, res) => {
  const run = runStore.get(req.params.id)
  if (!run) return res.status(404).json({ error: "Run not found" })
  if (run.status !== "pending") {
    return res.status(400).json({ error: "Run already started" })
  }

  startWorkflow(run.id)
  res.json({ ok: true })
})

router.get("/:id", (req, res) => {
  const run = runStore.get(req.params.id)
  if (!run) return res.status(404).json({ error: "Run not found" })
  res.json({ run })
})

router.get("/", (_req, res) => {
  res.json({ runs: runStore.list() })
})

export default router
