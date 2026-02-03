import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  RefreshCw, 
  ExternalLink, 
  Loader2,
  Rocket,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LivePreviewPanelProps {
  previewUrl?: string;
  deployedUrl?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  className?: string;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const deviceSizes: Record<DeviceMode, { width: string; label: string }> = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
};

export function LivePreviewPanel({ 
  previewUrl, 
  deployedUrl, 
  status,
  className 
}: LivePreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isLoading, setIsLoading] = useState(true);

  // Determine which URL to show (deployed takes priority)
  const activeUrl = deployedUrl || previewUrl;
  const isDeployed = !!deployedUrl;
  const isPreview = !!previewUrl && !deployedUrl;

  const handleReload = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleOpenExternal = () => {
    if (activeUrl) {
      window.open(activeUrl, '_blank');
    }
  };

  // Show placeholder states
  if (!activeUrl) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center h-full min-h-[400px] glass-card rounded-2xl',
        className
      )}>
        {status === 'pending' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Code className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Ready to Build
            </h3>
            <p className="text-sm text-muted-foreground/70 text-center max-w-xs">
              Start a run to see your app come to life
            </p>
          </>
        )}

        {status === 'running' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Preparing Preview...
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              AutoShip is scaffolding your project
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <Code className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium text-destructive mb-2">
              Build Failed
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Check the logs for error details
            </p>
          </>
        )}

        {status === 'completed' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
              <Rocket className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-medium text-success mb-2">
              Deployment Complete
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              No preview URL available
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col glass-card rounded-2xl overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-success/80" />
          </div>
          
          <div className="h-4 w-px bg-border" />
          
          {/* Status badge */}
          {isDeployed ? (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-success/10 text-success text-xs font-medium">
              <Rocket className="w-3 h-3" />
              DEPLOYED
            </div>
          ) : isPreview ? (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              LIVE PREVIEW
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {/* Device mode toggles */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                deviceMode === 'desktop' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                deviceMode === 'tablet' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                deviceMode === 'mobile' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Actions */}
          <Button variant="ghost" size="icon" onClick={handleReload} title="Reload">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleOpenExternal} title="Open in new tab">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* URL bar */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg text-sm font-mono text-muted-foreground">
          <span className="text-success">🔒</span>
          <span className="truncate">{activeUrl}</span>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 bg-[#1a1a1a] min-h-[400px] flex items-center justify-center p-4 overflow-hidden">
        <div 
          className={cn(
            'relative bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300',
            deviceMode === 'desktop' ? 'w-full h-full' : 'h-full'
          )}
          style={{ 
            width: deviceSizes[deviceMode].width,
            maxWidth: '100%'
          }}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Loading preview...</span>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={activeUrl}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
