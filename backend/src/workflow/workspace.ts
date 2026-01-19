import fs from "node:fs";
import path from "node:path";

const GENERATED_ROOT = path.resolve(process.cwd(), "..", "apps", "generated");

export function getWorkspacePath(runId: string) {
  return path.join(GENERATED_ROOT, runId);
}

export function ensureWorkspace(runId: string) {
  const dir = getWorkspacePath(runId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeWorkspaceFile(runId: string, relPath: string, content: string) {
  const root = ensureWorkspace(runId);
  const filePath = path.join(root, relPath);

  // ensure parent dirs exist
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

export function readWorkspaceFile(runId: string, relPath: string) {
  const root = getWorkspacePath(runId);
  const filePath = path.join(root, relPath);
  return fs.readFileSync(filePath, "utf-8");
}

export function workspaceExists(runId: string) {
  return fs.existsSync(getWorkspacePath(runId));
}
