import React, { useEffect, useState } from "react";
import { checkHealth } from "../lib/api";

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [checking, setChecking] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    const healthy = await checkHealth();
    setIsConnected(healthy);
    setChecking(false);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isConnected) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-3 z-50">
      <span className="animate-pulse">●</span>
      <span>Backend not reachable (localhost:5050)</span>
      <button
        onClick={checkConnection}
        disabled={checking}
        className="px-3 py-1 bg-red-700 hover:bg-red-800 rounded text-sm"
      >
        {checking ? "Checking..." : "Retry"}
      </button>
      <span className="text-red-200 text-sm ml-2">
        Run: <code className="bg-red-700 px-1 rounded">pnpm --filter @autoshop-agent/backend dev</code>
      </span>
    </div>
  );
}
