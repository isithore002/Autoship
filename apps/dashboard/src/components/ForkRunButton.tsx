import React, { useState } from "react";

interface ForkRunButtonProps {
  runId: string;
  originalGoal: string;
  onFork: (newGoal: string) => Promise<void>;
}

export function ForkRunButton({ runId, originalGoal, onFork }: ForkRunButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(originalGoal);
  const [isForking, setIsForking] = useState(false);

  const handleFork = async () => {
    setIsForking(true);
    try {
      await onFork(newGoal);
      setIsOpen(false);
    } catch (err) {
      console.error("Fork failed:", err);
    } finally {
      setIsForking(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg flex items-center gap-2"
      >
        🍴 Fork & Modify
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Fork This Run</h2>
            <p className="text-gray-400 text-sm mb-4">
              Create a new run based on <code className="text-blue-400">#{runId.slice(0, 8)}</code>.
              Modify the goal below to customize.
            </p>

            <label className="block text-sm text-gray-400 mb-2">New Goal</label>
            <textarea
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-blue-500"
              placeholder="Describe what you want to build..."
            />

            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
              <span>💡</span>
              <span>Try: "Add dark mode" or "Change button colors to blue"</span>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleFork}
                disabled={isForking || !newGoal.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg flex items-center gap-2"
              >
                {isForking ? (
                  <>
                    <span className="animate-spin">⏳</span> Forking...
                  </>
                ) : (
                  <>🚀 Start New Run</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
