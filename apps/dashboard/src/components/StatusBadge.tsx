import { Badge } from '@/components/ui/badge';
import { StepStatus } from '@/types/run';
import { Check, X, Loader2, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: StepStatus | 'completed' | 'failed' | 'running';
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = {
    pending: { label: 'Pending', variant: 'pending' as const, icon: Clock },
    running: { label: 'Running', variant: 'running' as const, icon: Loader2 },
    pass: { label: 'Pass', variant: 'success' as const, icon: Check },
    completed: { label: 'Completed', variant: 'success' as const, icon: Check },
    fail: { label: 'Fail', variant: 'fail' as const, icon: X },
    failed: { label: 'Failed', variant: 'fail' as const, icon: X },
  };

  const { label, variant, icon: Icon } = config[status] || config.pending;

  return (
    <Badge variant={variant} className="gap-1">
      {showIcon && (
        <Icon 
          className={`h-3 w-3 ${status === 'running' ? 'animate-spin' : ''}`} 
        />
      )}
      {label}
    </Badge>
  );
}
