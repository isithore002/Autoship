import { useState } from 'react';
import { RunStep, StepStatus } from '@/types/run';
import { StatusBadge } from './StatusBadge';
import { ChevronDown, ChevronRight, Clock, Check, X, Loader2, Zap, Box, Hammer, TestTube, Wrench, Rocket, Globe, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineProps {
  steps: RunStep[];
  className?: string;
}

const STEP_ICONS: Record<string, React.ElementType> = {
  'planning': Zap,
  'scaffolding': Box,
  'building': Hammer,
  'testing': TestTube,
  'fixing': Wrench,
  'deploying': Rocket,
  'browser-qa': Globe,
  'proof-bundle': Package,
};

function formatDuration(startedAt?: string, endedAt?: string): string | null {
  if (!startedAt) return null;
  
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const ms = end - start;
  
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StepIcon({ status, stepId }: { status: StepStatus; stepId: string }) {
  const IconComponent = STEP_ICONS[stepId] || Clock;
  
  const config = {
    pending: { className: 'text-muted-foreground bg-muted/80' },
    running: { className: 'text-primary bg-primary/20' },
    completed: { className: 'text-success bg-success/20' },
    failed: { className: 'text-destructive bg-destructive/20' },
  };

  const { className } = config[status] ?? config.pending;

  if (status === 'running') {
    return (
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
        className,
        'ring-2 ring-primary/30 ring-offset-2 ring-offset-background'
      )}>
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300', className)}>
        <Check className="w-5 h-5" />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300', className)}>
        <X className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300', className)}>
      <IconComponent className="w-5 h-5" />
    </div>
  );
}

export function Timeline({ steps, className }: TimelineProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleStep = (stepId: string) => {
    setExpanded(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  return (
    <div className={cn('space-y-3', className)}>
      {steps.map((step, index) => {
        const isExpanded = expanded[step.id];
        const isLast = index === steps.length - 1;
        const duration = formatDuration(step.startedAt, step.endedAt);
        
        return (
          <div key={step.id} className="relative animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            {/* Connector line */}
            {!isLast && (
              <div 
                className={cn(
                  'absolute left-5 top-14 w-0.5 h-[calc(100%-40px)] rounded-full transition-colors duration-500',
                  step.status === 'completed' ? 'bg-success/50' : 
                  step.status === 'running' ? 'bg-primary/50' : 'bg-border'
                )}
              />
            )}
            
            <div
              className={cn(
                'relative glass-card rounded-2xl p-4 transition-all duration-300 cursor-pointer',
                'hover:border-border/80',
                step.status === 'running' && 'ring-1 ring-primary/30',
                step.status === 'completed' && 'border-success/20',
                step.status === 'failed' && 'border-destructive/20'
              )}
              onClick={() => toggleStep(step.id)}
            >
              <div className="flex items-center gap-4">
                <StepIcon status={step.status} stepId={step.id} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{step.name}</h4>
                    <StatusBadge status={step.status} showIcon={false} />
                    {/* Duration badge */}
                    {duration && (
                      <span className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded-md",
                        step.status === 'completed' && "bg-success/10 text-success",
                        step.status === 'failed' && "bg-destructive/10 text-destructive",
                        step.status === 'running' && "bg-primary/10 text-primary animate-pulse"
                      )}>
                        {duration}
                      </span>
                    )}
                  </div>
                  {step.status === 'running' && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Executing...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  {step.logs.length > 0 && (
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md">
                      {step.logs.length} logs
                    </span>
                  )}
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                    'hover:bg-accent'
                  )}>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded logs */}
              {isExpanded && step.logs.length > 0 && (
                <div className="mt-4 ml-14 animate-fade-in">
                  <div className="bg-terminal-bg rounded-xl p-4 font-mono text-xs space-y-1.5 max-h-48 overflow-auto terminal-scrollbar border border-border/50">
                    {step.logs.map((log, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-start gap-2',
                          log.startsWith('✓') && 'text-success',
                          log.startsWith('✗') && 'text-destructive',
                          log.startsWith('→') && 'text-primary',
                          !log.match(/^[✓✗→]/) && 'text-muted-foreground'
                        )}
                      >
                        <span className="text-muted-foreground/40 select-none w-4">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
