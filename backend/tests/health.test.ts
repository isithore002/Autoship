import { describe, it, expect } from "vitest"
import request from "supertest"
import express from "express"
import runsRouter from "../src/server/routes/runs"

const app = express()
app.use(express.json())
app.use("/api/runs", runsRouter)

describe("Health check", () => {
  it("GET /api/runs returns empty list initially", async () => {
    const res = await request(app).get("/api/runs")
    expect(res.status).toBe(200)
    expect(res.body.runs).toBeInstanceOf(Array)
    expect(res.body.runs.length).toBe(0)
  })

  it("POST /api/runs creates a run", async () => {
    const res = await request(app)
      .post("/api/runs")
      .send({ prompt: "Test app" })

    expect(res.status).toBe(200)
    expect(res.body.runId).toBeTruthy()
  })

  it("GET /api/runs/:id returns created run", async () => {
    const create = await request(app)
      .post("/api/runs")
      .send({ prompt: "Test app" })

    const runId = create.body.runId
    const get = await request(app).get(`/api/runs/${runId}`)

    expect(get.status).toBe(200)
    expect(get.body.run.id).toBe(runId)
    expect(get.body.run.steps.length).toBeGreaterThan(0)
  })
})
