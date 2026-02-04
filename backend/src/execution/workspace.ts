import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { env } from "../config/env"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.resolve(__dirname, "..", "..", env.WORKSPACE_ROOT)
const TEMPLATE = path.resolve(__dirname, "..", "..", "template")


export async function createWorkspace(runId: string) {
  const dir = path.join(ROOT, runId)

  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
  }

  fs.mkdirSync(dir, { recursive: true })

  // Copy template project
  copyDir(TEMPLATE, dir)

  return dir
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true })

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}
