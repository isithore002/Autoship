import express, { Router } from "express";
import path from "path";
import fs from "fs";

export const previewRouter: Router = express.Router();

// Serve preview files from generated project dist
previewRouter.get("/:runId/*", (req, res) => {
  const { runId } = req.params;
  const relPath = req.params[0] || "index.html";

  const distDir = path.join(
    process.cwd(),
    "apps",
    "generated",
    runId,
    "dist"
  );

  const filePath = path.join(distDir, relPath);

  // Set correct content types
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: Record<string, string> = {
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".json": "application/json",
  };

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    if (contentTypes[ext]) {
      res.setHeader("Content-Type", contentTypes[ext]);
    }
    return res.sendFile(filePath);
  }

  // SPA fallback - serve index.html for client-side routing
  const indexFile = path.join(distDir, "index.html");
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }

  res.status(404).send(`
    <html>
      <body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:#1a1a2e;color:#fff;margin:0;">
        <div style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🔨</div>
          <p style="margin:0;font-size:18px;">Preview not available yet</p>
          <p style="color:#888;font-size:14px;margin-top:8px;">Build may still be in progress...</p>
        </div>
      </body>
    </html>
  `);
});

// Handle root path without trailing wildcard
previewRouter.get("/:runId", (req, res) => {
  res.redirect(`/preview/${req.params.runId}/`);
});
