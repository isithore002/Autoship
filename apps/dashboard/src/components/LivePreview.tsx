import React from "react";

export type PreviewState = {
  status: "idle" | "loading" | "ready";
  url?: string;
};

interface LivePreviewProps {
  preview: PreviewState;
}

export function LivePreview({ preview }: LivePreviewProps) {
  const isReady = preview.status === "ready" && !!preview.url;

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">Live Preview</h3>
          {isReady && (
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Live
            </span>
          )}
          {preview.status === "loading" && !preview.url && (
            <span className="flex items-center gap-1.5 text-xs text-blue-300/80 bg-blue-500/10 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-ping"></span>
              Preparing
            </span>
          )}
        </div>
        {preview.url && (
          <a href={preview.url} target="_blank" rel="noopener" className="text-xs text-blue-400 hover:text-blue-300">
            Open ↗
          </a>
        )}
      </div>
      <div className="flex-1 relative bg-white">
        {isReady ? (
          <iframe src={preview.url} title="Live Preview" className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-950">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">
                {preview.status === "loading" ? "Preparing preview..." : "Awaiting run start"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
