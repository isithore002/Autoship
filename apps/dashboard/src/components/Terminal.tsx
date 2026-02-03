import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Terminal as TerminalIcon, Circle, Copy, Download, Pause, Play, ChevronDown } from 'lucide-react';

interface TerminalProps {
  logs: string[];
  className?: string;
  title?: string;
  isLive?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
}

export function Terminal({ 
  logs, 
  className, 
  title = 'Execution Logs',
  isLive = false,
}: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (scrollRef.current && autoScroll && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isPaused]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.join('\n'));
  };

  const handleDownload = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoship-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setAutoScroll(true);
    }
  };

  return (
    <div className={cn('flex flex-col glass-card rounded-2xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/80 hover:bg-destructive transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-warning/80 hover:bg-warning transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-success/80 hover:bg-success transition-colors cursor-pointer" />
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Control buttons */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            title="Copy logs"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            title="Download logs"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          {isLive && (
            <div className="flex items-center gap-2">
              <Circle className="w-2 h-2 fill-success text-success animate-pulse" />
              <span className="text-xs text-success font-medium">Live</span>
            </div>
          )}
          {!isLive && logs.length > 0 && (
            <span className="text-xs text-muted-foreground">{logs.length} lines</span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 p-4 bg-terminal-bg font-mono text-sm overflow-auto terminal-scrollbar min-h-[200px] max-h-[400px] relative"
      >
        {logs.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-primary animate-pulse">▋</span>
            <span>Waiting for execution...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2',
                  !isPaused && i === logs.length - 1 && 'animate-fade-in',
                )}
              >
                <span className="text-muted-foreground/50 select-none text-xs w-6 text-right shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={cn(
                    // Success indicators
                    (log.includes('✓') || log.includes('✅') || log.includes('PASS')) && 'text-success',
                    // Error indicators
                    (log.includes('✗') || log.includes('❌') || log.includes('FAIL') || log.includes('Error')) && 'text-destructive',
                    // Info/action indicators
                    (log.startsWith('→') || log.startsWith('[')) && 'text-terminal-text',
                    // Warning indicators
                    (log.includes('⚠') || log.includes('warning')) && 'text-warning',
                    // Default
                    !log.match(/[✓✗→⚠✅❌]/) && !log.includes('PASS') && !log.includes('FAIL') && 'text-terminal-text/80'
                  )}
                >
                  {log}
                </span>
              </div>
            ))}
            {/* Cursor */}
            {isLive && !isPaused && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground/50 select-none text-xs w-6 text-right shrink-0">
                  {String(logs.length + 1).padStart(2, '0')}
                </span>
                <span className="text-primary animate-pulse">▋</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {!autoScroll && logs.length > 10 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 p-2 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
