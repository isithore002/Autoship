import React, { useState } from "react";

interface Artifact {
  name: string;
  type: "log" | "code" | "screenshot" | "config";
  content?: string;
  url?: string;
}

interface ProofBundlePreviewProps {
  runId: string;
  artifacts: Artifact[];
  deployedUrl?: string;
}

export function ProofBundlePreview({ runId, artifacts, deployedUrl }: ProofBundlePreviewProps) {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "artifacts">("preview");

  const getIcon = (type: Artifact["type"]) => {
    switch (type) {
      case "log": return "📄";
      case "code": return "💻";
      case "screenshot": return "🖼️";
      case "config": return "⚙️";
      default: return "📁";
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "preview"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          🚀 Live Preview
        </button>
        <button
          onClick={() => setActiveTab("artifacts")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "artifacts"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          📦 Proof Bundle ({artifacts.length})
        </button>
        {deployedUrl && (
          <a
            href={deployedUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto px-4 py-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Open in new tab ↗
          </a>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "preview" ? (
          deployedUrl ? (
            <iframe
              src={deployedUrl}
              title="Live Preview"
              className="w-full h-full bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No deployment available
            </div>
          )
        ) : (
          <div className="flex h-full">
            {/* Artifact List */}
            <div className="w-64 border-r border-gray-700 overflow-y-auto">
              {artifacts.map((artifact, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedArtifact(artifact)}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-800 ${
                    selectedArtifact === artifact ? "bg-gray-800 text-white" : "text-gray-400"
                  }`}
                >
                  <span>{getIcon(artifact.type)}</span>
                  <span className="truncate">{artifact.name}</span>
                </button>
              ))}
            </div>
            {/* Artifact Content */}
            <div className="flex-1 overflow-auto p-4">
              {selectedArtifact ? (
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {selectedArtifact.content || "No content available"}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select an artifact to view
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Download Bundle Button */}
      <div className="p-2 border-t border-gray-700">
        <button
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded"
          onClick={() => window.open(`/api/runs/${runId}/proof-bundle`, "_blank")}
        >
          ⬇️ Download Proof Bundle
        </button>
      </div>
    </div>
  );
}
