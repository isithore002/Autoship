import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Timeline } from '@/components/Timeline';
import { Terminal } from '@/components/Terminal';
import { ArtifactCard } from '@/components/ArtifactCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Run, TEMPLATES } from '@/types/run';
import { createRun, startRun, pollRun, getArtifactsZipUrl } from '@/lib/store';
import { 
  Sparkles, 
  Loader2, 
  Zap, 
  ArrowRight,
  Play,
  LayoutTemplate
} from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { LivePreview, type PreviewState } from "../components/LivePreview";

export default function Dashboard() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [template, setTemplate] = useState('nextjs-website');
  const [currentRun, setCurrentRun] = useState<Run | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [preview, setPreview] = useState<PreviewState>({ status: "idle" });

  const allLogs = currentRun?.timelineSteps.flatMap(s => 
    s.logs.map(log => `[${s.name}] ${log}`)
  ) || [];

  // Poll for updates when run is active
  useEffect(() => {
    if (!currentRun || (currentRun.status !== 'running' && currentRun.status !== 'pending')) {
      return;
    }

    const stopPolling = pollRun(currentRun.id, (updatedRun) => {
      setCurrentRun(updatedRun);

      if (updatedRun.previewUrl) {
        setPreview((prev) =>
          prev.url === updatedRun.previewUrl && prev.status === 'ready'
            ? prev
            : { status: 'ready', url: updatedRun.previewUrl }
        );
      } else if (updatedRun.status === 'running' || updatedRun.status === 'pending') {
        setPreview((prev) => (prev.status === 'ready' ? prev : { status: 'loading' }));
      } else {
        setPreview({ status: 'idle' });
      }

      if (updatedRun.status === 'completed') {
        setIsRunning(false);
        toast.success('Run completed!', { description: 'Build finished successfully' });
      } else if (updatedRun.status === 'failed') {
        setIsRunning(false);
        toast.error('Run failed', { description: 'Check the logs for details' });
      }
    });

    return stopPolling;
  }, [currentRun?.id, currentRun?.status]);

  const handleStartRun = useCallback(async () => {
    if (!goal.trim()) {
      toast.error('Please enter a project goal');
      return;
    }

    setIsRunning(true);
    setPreview({ status: 'loading' });

    try {
      const run = await createRun(goal, template);
      setCurrentRun(run);
      toast.success('Run created!', { description: `Run ID: ${run.id.slice(0, 12)}...` });
      
      
      await startRun(run.id);
      toast.info('Workflow started!', { description: 'Processing your request...' });
    } catch (error) {
      setIsRunning(false);
      setPreview({ status: 'idle' });
      toast.error('Failed to start run', { description: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [goal, template]);

  return (
    <Layout>
      <div className="p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">New Run</h1>
            </div>
            <p className="text-muted-foreground">
              Describe your goal and let AutoShip build it autonomously
            </p>
          </div>
          {currentRun && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Run ID:</span>

              <code className="text-xs font-mono bg-muted px-2 py-1 rounded-lg">
                {currentRun.id.slice(0, 12)}...
              </code>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(currentRun.id);
                  toast.success("Run ID copied!");
                }}
                className="h-8 px-2"
              >
                Copy
              </Button>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Project Goal
              </label>
              <Textarea
                placeholder="Describe what you want to build... e.g., 'A todo app with user authentication, dark mode, and real-time sync'"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="min-h-[140px] bg-muted/30 border-border/50 resize-none text-base rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                disabled={isRunning}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-3 flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                  Template
                </label>
                <Select value={template} onValueChange={setTemplate} disabled={isRunning}>
                  <SelectTrigger className="bg-muted/30 border-border/50 h-12 rounded-xl">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={handleStartRun}
                  disabled={isRunning || !goal.trim()}
                  className="w-full sm:w-auto h-12"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Run
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Run Section */}
        {currentRun && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">Run Timeline</h2>
              </div>
              <Timeline steps={currentRun.timelineSteps} />
            </div>

            {/* Live Preview */}
            <div className="h-[500px] w-full">
              <LivePreview preview={preview} />
            </div>
          </div>
        )}

        {/* Completed Run Results */}
        {currentRun?.status === 'completed' && (
          <div className="space-y-6 animate-fade-in">
            {/* Deployment URL Output */}
            {currentRun.deployedUrl && (
              <div className="glass-card rounded-2xl p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Deployment URL</h3>
                  <p className="text-sm font-mono text-foreground break-all">{currentRun.deployedUrl}</p>
                </div>
              </div>
            )}

            {/* Artifacts */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-5">Proof Artifacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentRun.artifacts.planJson && (
                  <ArtifactCard 
                    title="plan.json" 
                    type="json" 
                    content={currentRun.artifacts.planJson} 
                  />
                )}
                {currentRun.artifacts.lintReport && (
                  <ArtifactCard 
                    title="lint-report.txt" 
                    type="text" 
                    content={currentRun.artifacts.lintReport} 
                  />
                )}
                {currentRun.artifacts.testReport && (
                  <ArtifactCard 
                    title="test-report.txt" 
                    type="text" 
                    content={currentRun.artifacts.testReport} 
                  />
                )}
                {currentRun.artifacts.installReport && (
                  <ArtifactCard 
                    title="install-report.txt" 
                    type="text" 
                    content={currentRun.artifacts.installReport} 
                  />
                )}
                {currentRun.artifacts.diffPatch && (
                  <ArtifactCard
                    title="diff.patch"
                    type="text"
                    content={currentRun.artifacts.diffPatch}
                  />
                )}
                {currentRun.artifacts.buildReport && (
                  <ArtifactCard 
                    title="build-report.txt" 
                    type="text" 
                    content={currentRun.artifacts.buildReport} 
                  />
                )}
              </div>
              {currentRun.artifacts.planJson && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(getArtifactsZipUrl(currentRun.id), "_blank")}
                  >
                    Download Proof Bundle (.zip)
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/runs/${currentRun.id}`)}
                className="gap-2"
              >
                View Full Run Details
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {
                  setCurrentRun(null);
                  setGoal('');
                }}
              >
                Start New Run
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
