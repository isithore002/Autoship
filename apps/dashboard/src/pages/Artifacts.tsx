import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ArtifactCard } from '@/components/ArtifactCard';
import { Button } from '@/components/ui/button';
import { Run } from '@/types/run';
import { getRuns } from '@/lib/store';
import { FileBox, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Artifacts() {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
  const loadRuns = async () => {
    const runs = await getRuns();
    const completedWithArtifacts = runs.filter(r =>
      r.status === 'completed' &&
      Object.keys(r.artifacts).length > 0
    );

    setRuns(completedWithArtifacts);
    };

  loadRuns();
  }, []);


  return (
    <Layout>
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Artifacts</h1>
          <p className="text-muted-foreground">
            Browse proof-of-work artifacts from all completed runs
          </p>
        </div>

        {runs.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <FileBox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No artifacts yet</h3>
            <p className="text-muted-foreground mb-6">
              Complete an AutoShip run to generate proof artifacts
            </p>
            <Link to="/dashboard">
              <Button variant="glow">Start a Run</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {runs.map((run) => (
              <div key={run.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{run.goal}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(run.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <Link to={`/runs/${run.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View Run
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
