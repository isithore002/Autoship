import express from "express"
import cors from "cors"
import { env } from "../config/env"
import runsRouter from "./routes/runs"

export function startServer() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get("/health", (_req, res) => {
    res.json({ ok: true })
  })

  app.use("/api/runs", runsRouter)

  app.listen(env.PORT, () => {
    console.log(`🚀 AutoShip backend running on :${env.PORT}`)
  })
}
