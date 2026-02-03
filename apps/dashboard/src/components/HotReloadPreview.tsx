import React, { useEffect, useState, useRef } from "react";

interface HotReloadPreviewProps {
  runId: string;
  deployedUrl?: string;
  status: string;
  buildLogs?: string[];
}

export function HotReloadPreview({ runId, deployedUrl, status, buildLogs = [] }: HotReloadPreviewProps) {
  const [previewKey, setPreviewKey] = useState(0);
  const [lastDeployTime, setLastDeployTime] = useState<Date | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const normalizedStatus = status.toUpperCase();

  // Hot reload: refresh iframe when deployedUrl changes
  useEffect(() => {
    if (deployedUrl) {
      setPreviewKey((k) => k + 1);
      setLastDeployTime(new Date());
    }
  }, [deployedUrl]);

  // Poll for updates during build
  useEffect(() => {
    if (normalizedStatus === "RUNNING") {
      const interval = setInterval(() => {
        if (iframeRef.current && deployedUrl) {
          iframeRef.current.src = deployedUrl;
        }
      }, 5000); // Refresh every 5s during build
      return () => clearInterval(interval);
    }
  }, [normalizedStatus, deployedUrl]);

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      {/* Header with status */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Live Preview</h3>
          {normalizedStatus === "RUNNING" && (
            <span className="flex items-center gap-1 text-yellow-400 text-sm">
              <span className="animate-pulse">●</span> Building...
            </span>
          )}
          {normalizedStatus === "COMPLETED" && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              ● Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastDeployTime && (
            <span className="text-xs text-gray-500">
              Last updated: {lastDeployTime.toLocaleTimeString()}
            </span>
          )}
          {deployedUrl && (
            <a
              href={deployedUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Open ↗
            </a>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Panel */}
        <div className="flex-1 relative">
          {normalizedStatus === "RUNNING" && !deployedUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-400"></div>
                <span className="absolute inset-0 flex items-center justify-center text-2xl">🚀</span>
              </div>
              <p className="mt-4 text-gray-400">Building & Deploying...</p>
              <p className="text-xs text-gray-600 mt-1">Preview will auto-refresh when ready</p>
            </div>
          ) : deployedUrl ? (
            <iframe
              ref={iframeRef}
              key={previewKey}
              src={deployedUrl}
              title="Live Preview"
              className="w-full h-full bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No deployment available
            </div>
          )}

          {/* Hot reload indicator */}
          {normalizedStatus === "RUNNING" && deployedUrl && (
            <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <span className="animate-pulse">●</span> Hot Reloading
            </div>
          )}
        </div>

        {/* Build Logs Panel (collapsible) */}
        {normalizedStatus === "RUNNING" && buildLogs.length > 0 && (
          <div className="w-80 border-l border-gray-700 bg-gray-950 overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-gray-700 text-sm text-gray-400">
              Build Logs
            </div>
            <div className="flex-1 overflow-y-auto p-2 font-mono text-xs text-gray-500">
              {buildLogs.map((log, idx) => (
                <div key={idx} className="py-0.5">{log}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
