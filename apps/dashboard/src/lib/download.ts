const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050"

/**
 * Downloads run artifacts as a ZIP file (backend-generated)
 */
export function downloadArtifactsZip(run: { id: string }) {
  const url = `${BACKEND_URL.replace(/\/$/, "")}/api/runs/${run.id}/artifacts.zip`

  const a = document.createElement("a")
  a.href = url
  a.download = `run-${run.id}-artifacts.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
