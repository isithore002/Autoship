import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Timeline } from '@/components/Timeline';
import { Terminal } from '@/components/Terminal';
import { ArtifactCard } from '@/components/ArtifactCard';
import { StatusBadge } from '@/components/StatusBadge';
import { LivePreviewPanel } from '@/components/LivePreviewPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Run } from '@/types/run';
import { getRun, startRun, pollRun } from '@/lib/store';
import { 
  ArrowLeft, 
  RefreshCw, 
  Calendar,
  Target,
  Loader2,
  Download,
  Eye,
  Terminal as TerminalIcon,
  ListTree
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { downloadArtifactsZip } from '@/lib/download';

export default function RunDetail() {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<Run | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);

  // Load run on mount
  useEffect(() => {
    if (id) {
      getRun(id).then(setRun);
    }
  }, [id]);

  // Poll for updates when run is active
  useEffect(() => {
    if (!run || !id || (run.status !== 'running' && run.status !== 'pending')) {
      return;
    }

    const stopPolling = pollRun(id, (updatedRun) => {
      setRun(updatedRun);
    });

    return stopPolling;
  }, [run?.id, run?.status, id]);

  const handleReplay = async () => {
    if (!run || !id) return;

    setIsReplaying(true);
    toast.info('Replaying run...');

    try {
      // Start a new run with the same goal and template
      const { createRun } = await import('@/lib/store');
      const newRun = await createRun(run.goal, run.template);
      
      // Navigate to the new run
      window.location.href = `/runs/${newRun.id}`;
      
      // Start the workflow
      await startRun(newRun.id);
      toast.success('Replay started!');
    } catch (error) {
      toast.error('Replay failed', { description: error instanceof Error ? error.message : 'Unknown error' });
      setIsReplaying(false);
    }
  };

  if (!run) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Run not found</h1>
          <Link to="/runs">
            <Button variant="outline">Back to Runs</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const allLogs = run.timelineSteps.flatMap(s => 
    s.logs.map(log => `[${s.name}] ${log}`)
  );

  return (
    <Layout>
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link 
              to="/runs" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Runs
            </Link>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{run.goal}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{run.template}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(run.createdAt), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={run.status} />
            <Button 
              variant="outline" 
              onClick={handleReplay}
              disabled={isReplaying}
            >
              {isReplaying ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Replay Run
            </Button>
          </div>
        </div>

        {/* Deployment URL Output */}
        {run.deployedUrl && (
          <div className="glass-card rounded-2xl p-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Deployment URL</h3>
              <a 
                href={run.deployedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-mono text-primary hover:underline break-all"
              >
                {run.deployedUrl}
              </a>
            </div>
          </div>
        )}

        {/* Main Content: Live Preview + Timeline/Logs */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Live Preview Panel - Primary (2/3 width on xl) */}
          <div className="xl:col-span-2">
            <LivePreviewPanel 
              previewUrl={run.previewUrl}
              deployedUrl={run.deployedUrl}
              status={run.status}
              className="h-[500px]"
            />
          </div>

          {/* Timeline & Logs - Secondary (1/3 width on xl) */}
          <div className="xl:col-span-1">
            <Tabs defaultValue="timeline" className="h-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="timeline" className="gap-2">
                  <ListTree className="w-4 h-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="logs" className="gap-2">
                  <TerminalIcon className="w-4 h-4" />
                  Logs
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline" className="mt-0">
                <div className="glass-card rounded-2xl p-4 max-h-[440px] overflow-auto">
                  <Timeline steps={run.timelineSteps} />
                </div>
              </TabsContent>
              
              <TabsContent value="logs" className="mt-0">
                <Terminal 
                  logs={allLogs} 
                  title="Execution Logs" 
                  isLive={run.status === 'running'}
                  className="h-[440px]"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Artifacts */}
        {Object.keys(run.artifacts).length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">Proof Artifacts</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => downloadArtifactsZip(run)}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download ZIP
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {run.artifacts.planJson && (
                <ArtifactCard 
                  title="plan.json" 
                  type="json" 
                  content={run.artifacts.planJson} 
                />
              )}
              {run.artifacts.lintReport && (
                <ArtifactCard 
                  title="lint-report.txt" 
                  type="text" 
                  content={run.artifacts.lintReport} 
                />
              )}
              {run.artifacts.testReport && (
                <ArtifactCard 
                  title="test-report.txt" 
                  type="text" 
                  content={run.artifacts.testReport} 
                />
              )}
              {run.artifacts.buildReport && (
                <ArtifactCard 
                  title="build-report.txt" 
                  type="text" 
                  content={run.artifacts.buildReport} 
                />
              )}
              {run.artifacts.diffPatch && run.artifacts.diffPatch.length > 0 && (
                <ArtifactCard 
                  title="diffs.txt" 
                  type="diff" 
                  content={run.artifacts.diffPatch + '\n'} 
                />
              )}
            </div>
          </div>
        )}

        {/* Run Metadata */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">Run Information</h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Run ID</dt>
              <dd className="font-mono truncate">{run.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Template</dt>
              <dd>{run.template}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDistanceToNow(new Date(run.createdAt))} ago</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last Updated</dt>
              <dd>{formatDistanceToNow(new Date(run.updatedAt))} ago</dd>
            </div>
          </dl>
        </div>
      </div>
    </Layout>
  );
}
