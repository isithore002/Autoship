import fs from "node:fs";
import path from "node:path";

type ApplyPatchResult = {
  appliedFiles: string[];
};

/**
 * Minimal unified diff applier for hackathon demo purposes.
 * Applies patches relative to the generated workspace directory.
 */
export function applyUnifiedDiff(workspaceDir: string, diffPatch: string): ApplyPatchResult {
  const lines = diffPatch.split(/\r?\n/);
  let i = 0;
  const appliedFiles: string[] = [];

  const readFileSafe = (p: string) => {
    try {
      return fs.readFileSync(p, "utf8");
    } catch {
      return "";
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.startsWith("diff --git ")) {
      i++;
      continue;
    }

    const parts = line.split(" ");
    const bPath = parts[3]?.replace(/^b\//, "");
    if (!bPath) {
      i++;
      continue;
    }

    const targetRel = bPath;
    const targetAbs = path.join(workspaceDir, targetRel);
    i++;

    while (i < lines.length && !lines[i].startsWith("--- ")) i++;
    if (i < lines.length) i++;
    while (i < lines.length && !lines[i].startsWith("+++ ")) i++;
    if (i < lines.length) i++;

    const original = readFileSafe(targetAbs).split(/\r?\n/);
    const output: string[] = [];
    let origIndex = 0;

    while (i < lines.length && lines[i].startsWith("@@")) {
      const header = lines[i];
      const match = header.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (!match) {
        throw new Error(`Unsupported hunk header: ${header}`);
      }
      const startOld = parseInt(match[1], 10);

      while (origIndex < startOld - 1) {
        output.push(original[origIndex] ?? "");
        origIndex++;
      }
      i++;

      while (i < lines.length) {
        const hunkLine = lines[i];
        if (hunkLine.startsWith("@@") || hunkLine.startsWith("diff --git ")) {
          break;
        }
        if (hunkLine.startsWith("+")) {
          output.push(hunkLine.slice(1));
        } else if (hunkLine.startsWith("-")) {
          origIndex++;
        } else if (hunkLine.startsWith(" ")) {
          output.push(original[origIndex] ?? hunkLine.slice(1));
          origIndex++;
        } else if (hunkLine.startsWith("\\ No newline")) {
          // ignore
        } else {
          output.push(hunkLine);
          origIndex++;
        }
        i++;
      }
    }

    while (origIndex < original.length) {
      output.push(original[origIndex] ?? "");
      origIndex++;
    }

    fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
    fs.writeFileSync(targetAbs, output.join("\n"), "utf8");
    appliedFiles.push(targetRel);
  }

  return { appliedFiles };
}
