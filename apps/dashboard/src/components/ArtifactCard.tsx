import { FileText, Image, Download, ExternalLink, FileJson, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ArtifactCardProps {
  title: string;
  type: 'json' | 'text' | 'image' | 'diff';
  content?: string;
  className?: string;
}

export function ArtifactCard({ title, type, content, className }: ArtifactCardProps) {
  const icons = {
    json: FileJson,
    text: FileText,
    image: Image,
    diff: FileCode,
  };

  const colors = {
    json: 'text-warning',
    text: 'text-success',
    image: 'text-chart-4',
    diff: 'text-primary',
  };

  const Icon = icons[type];

  return (
    <div className={cn('glass-card shine hover-card rounded-2xl overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', 
            type === 'json' && 'bg-warning/10',
            type === 'text' && 'bg-success/10',
            type === 'image' && 'bg-chart-4/10',
            type === 'diff' && 'bg-primary/10',
          )}>
            <Icon className={cn('w-4 h-4', colors[type])} />
          </div>
          <span className="font-medium text-sm">{title}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-accent">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {content && (
        <div className="p-4 bg-terminal-bg max-h-48 overflow-auto terminal-scrollbar">
          <pre className="text-xs font-mono text-terminal-text whitespace-pre-wrap">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}
