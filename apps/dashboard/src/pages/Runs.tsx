import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Run } from '@/types/run';
import { getRuns } from '@/lib/store';
import { 
  ExternalLink, 
  ChevronRight, 
  Calendar, 
  Target,
  History,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Runs() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRuns = async () => {
    setIsLoading(true);
    try {
      const fetchedRuns = await getRuns();
      setRuns(fetchedRuns);
    } catch (error) {
      console.error('Failed to load runs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
    // Poll for updates every 3 seconds
    const interval = setInterval(loadRuns, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Runs History</h1>
            <p className="text-muted-foreground">
              View and manage your previous AutoShip runs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={loadRuns}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/dashboard">
              <Button variant="glow">New Run</Button>
            </Link>
          </div>
        </div>

        {/* Runs List */}
        {isLoading ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading runs...</p>
          </div>
        ) : runs.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <History className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No runs yet</h3>
            <p className="text-muted-foreground mb-6">
              Start your first AutoShip run to see it here
            </p>
            <Link to="/dashboard">
              <Button variant="glow">Start First Run</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {runs.map((run, index) => (
              <Link
                key={run.id}
                to={`/runs/${run.id}`}
                className="block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  'glass-card rounded-2xl p-6 transition-all duration-300',
                  'hover:bg-accent/50 hover:scale-[1.01] cursor-pointer animate-fade-in'
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{run.goal}</h3>
                          <p className="text-sm text-muted-foreground">
                            {run.template}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(run.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <span className="text-border">•</span>
                        <span>{formatDistanceToNow(new Date(run.createdAt))} ago</span>
                        {run.deployedUrl && (
                          <>
                            <span className="text-border">•</span>
                            <div className="flex items-center gap-1.5 text-primary">
                              <ExternalLink className="w-4 h-4" />
                              <span>Deployed</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <StatusBadge status={run.status} />
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
