import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import { memoryStore } from "../store/memoryStore";
import type { Run } from "../types/run";
import { getRunner } from "../workflow";

export const runsRouter: RouterType = Router();

const CreateRunSchema = z.object({
  goal: z.string().min(3),
  template: z.enum(["nextjs_basic", "nextjs_firebase", "mern_crud"]).default("nextjs_basic"),
});

function createDefaultSteps() {
  return [
    { name: "Planning", status: "PENDING", logs: [] },
    { name: "Scaffolding", status: "PENDING", logs: [] },
    { name: "Building", status: "PENDING", logs: [] },
    { name: "Testing", status: "PENDING", logs: [] },
    { name: "Fixing (VibeCoder)", status: "PENDING", logs: [] },
    { name: "Deploying", status: "PENDING", logs: [] },
    { name: "Browser QA", status: "PENDING", logs: [] },
    { name: "Proof Bundle", status: "PENDING", logs: [] },
  ] as Run["steps"];
}

runsRouter.get("/", (req, res) => {
  const runs = memoryStore.listRuns().map((r) => ({
    id: r.id,
    goal: r.goal,
    template: r.template,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    deployedUrl: r.deployedUrl ?? null,
  }));
  res.json({ runs });
});

runsRouter.post("/", (req, res) => {
  const parsed = CreateRunSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }

  const { goal, template } = parsed.data;

  const runId = `run_${Date.now()}`;
  const now = Date.now();

  const run: Run = {
    id: runId,
    goal,
    template,
    status: "CREATED",
    createdAt: now,
    updatedAt: now,
    injectFailure: false,
    steps: createDefaultSteps(),
    liveLogs: [],
    artifacts: {},
  };

  memoryStore.createRun(run);
  res.json({ runId });
});

runsRouter.get("/:id", (req, res) => {
  const run = memoryStore.getRun(req.params.id);
  if (!run) return res.status(404).json({ error: "Run not found" });

  res.json({ run });
});

runsRouter.post("/:id/start", async (req, res) => {
  const run = memoryStore.getRun(req.params.id);
  if (!run) return res.status(404).json({ error: "Run not found" });

  const injectFailure = !!req.body?.injectFailure;

  memoryStore.updateRun(run.id, { injectFailure });

  // Start async (don't await)
  getRunner().start(run.id);
  res.json({ ok: true, status: "RUNNING", injectFailure });
});
