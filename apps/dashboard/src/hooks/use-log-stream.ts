import { useState, useEffect, useCallback, useRef } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050';

export type SSEStepUpdate = {
  name: string;
  status: string;
  startedAt?: number;
  endedAt?: number;
};

export type SSEMessage = {
  type: 'initial' | 'update' | 'complete' | 'error';
  logs?: string[];
  status?: string;
  steps?: SSEStepUpdate[];
  deployedUrl?: string;
  error?: string;
  message?: string;
};

export type UseLogStreamOptions = {
  onLog?: (log: string) => void;
  onComplete?: (status: string, deployedUrl?: string) => void;
  onError?: (error: string) => void;
  onStepUpdate?: (steps: SSEStepUpdate[]) => void;
};

export function useLogStream(runId: string | null, options: UseLogStreamOptions = {}) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [steps, setSteps] = useState<SSEStepUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    if (!runId) return;
    
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${BACKEND_URL}/api/runs/${runId}/logs/stream`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case 'initial':
            if (data.logs) {
              setLogs(data.logs);
            }
            if (data.steps) {
              setSteps(data.steps);
              optionsRef.current.onStepUpdate?.(data.steps);
            }
            break;
            
          case 'update':
            if (data.logs) {
              setLogs(prev => [...prev, ...data.logs!]);
              data.logs.forEach(log => optionsRef.current.onLog?.(log));
            }
            if (data.steps) {
              setSteps(data.steps);
              optionsRef.current.onStepUpdate?.(data.steps);
            }
            break;
            
          case 'complete':
            setIsComplete(true);
            setIsConnected(false);
            optionsRef.current.onComplete?.(data.status || 'COMPLETED', data.deployedUrl);
            eventSource.close();
            break;
            
          case 'error':
            setError(data.message || 'Unknown error');
            optionsRef.current.onError?.(data.message || 'Unknown error');
            break;
        }
      } catch (e) {
        console.error('Failed to parse SSE message:', e);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      // Don't set error for normal close (when run completes)
      if (!isComplete) {
        setError('Connection lost. Retrying...');
      }
    };
  }, [runId, isComplete]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setIsComplete(false);
    setError(null);
  }, []);

  // Auto-connect when runId changes
  useEffect(() => {
    if (runId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [runId, connect, disconnect]);

  return {
    logs,
    steps,
    isConnected,
    isComplete,
    error,
    connect,
    disconnect,
    clearLogs,
  };
}
