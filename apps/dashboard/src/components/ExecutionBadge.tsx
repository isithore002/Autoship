import { cn } from '@/lib/utils';
import { Zap, Play, Settings } from 'lucide-react';

interface ExecutionModeBadgeProps {
  mode: 'real' | 'execution' | 'demo';
  className?: string;
}

export function ExecutionModeBadge({ mode, className }: ExecutionModeBadgeProps) {
  const config = {
    real: {
      icon: Zap,
      label: 'REAL COMMANDS',
      description: 'pnpm install, build, test, deploy',
      className: 'bg-success/10 text-success border-success/20',
    },
    execution: {
      icon: Play,
      label: 'EXECUTION MODE',
      description: 'Real installs, builds, tests, deployments',
      className: 'bg-primary/10 text-primary border-primary/20',
    },
    demo: {
      icon: Settings,
      label: 'DEMO MODE',
      description: 'Failure injection enabled',
      className: 'bg-warning/10 text-warning border-warning/20',
    },
  };

  const { icon: Icon, label, description, className: modeClassName } = config[mode];

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium',
      modeClassName,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      <div className="flex flex-col">
        <span className="font-semibold">{label}</span>
        <span className="text-[10px] opacity-80">{description}</span>
      </div>
    </div>
  );
}

interface ExecutionStatusProps {
  isRunning: boolean;
  deployedUrl?: string;
  className?: string;
}

export function ExecutionStatus({ isRunning, deployedUrl, className }: ExecutionStatusProps) {
  if (deployedUrl) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/20',
        className
      )}>
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-medium">Deployed</span>
        <a 
          href={deployedUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs underline hover:no-underline"
        >
          {deployedUrl.replace('https://', '')}
        </a>
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20',
        className
      )}>
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-medium">Executing...</span>
      </div>
    );
  }

  return null;
}
