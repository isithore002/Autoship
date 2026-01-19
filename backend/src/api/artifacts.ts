import { Router } from "express";
import fs from "node:fs";
import archiver from "archiver";
import { artifactsDirForRun } from "../artifacts/artifactWriter";

export const artifactsRouter = Router();

/**
 * GET /api/runs/:id/artifacts.zip
 * Returns a zip file of all proof artifacts.
 */
artifactsRouter.get("/:id/artifacts.zip", async (req, res) => {
  const runId = req.params.id;

  const dir = artifactsDirForRun(runId);

  if (!fs.existsSync(dir)) {
    return res.status(404).json({ error: "Artifacts not found for run", runId });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${runId}-artifacts.zip"`);

  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => {
    console.error("ZIP error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Failed to create zip" });
  });

  archive.pipe(res);

  // Add the entire run artifact folder
  archive.directory(dir, `${runId}`);

  await archive.finalize();
});
