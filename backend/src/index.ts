import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { runsRouter } from "./api/runs";
import { artifactsRouter } from "./api/artifacts";
import { logsRouter } from "./api/logs";
import { previewRouter } from "./api/preview";
import { healthRouter } from "./api/health";

const app = express();

app.use(cors({ origin: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "autoshop-backend", time: Date.now() });
});

app.use("/api/runs", runsRouter);
app.use("/api/runs", artifactsRouter);
app.use("/api/runs", logsRouter);
app.use("/preview", previewRouter);
app.use("/api/health", healthRouter);

// Mount preview router for serving generated app builds
app.use("/preview", previewRouter);

app.listen(env.PORT, () => {
  console.log(`✅ AutoShip backend running on http://localhost:${env.PORT}`);
});
