import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WorkflowInfographic } from '@/components/WorkflowInfographic';
import { ArtifactCard } from '@/components/ArtifactCard';
import { 
  Rocket, 
  Sparkles, 
  Zap, 
  Shield, 
  ArrowRight,
  Github,
  Terminal,
  FileCheck,
  Play,
  Bot,
  Layers,
  CheckCircle2
} from 'lucide-react';

const exampleArtifacts = [
  { title: 'plan.json', type: 'json' as const, content: '{\n  "milestones": [\n    { "name": "Setup", "tasks": 3 },\n    { "name": "Core Features", "tasks": 5 }\n  ]\n}' },
  { title: 'test-report.txt', type: 'text' as const, content: '✓ 12 tests passed\n✓ 0 tests failed\n✓ Coverage: 94%' },
  { title: 'build-log.txt', type: 'text' as const, content: '✓ Build completed in 12.4s\n✓ Bundle size: 142kb gzipped' },
];

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Planning',
    description: 'Intelligent goal decomposition into actionable milestones',
  },
  {
    icon: Terminal,
    title: 'VibeCoder Self-Fix',
    description: 'Automatic error detection and code repair loops',
  },
  {
    icon: Shield,
    title: 'Proof Artifacts',
    description: 'Complete audit trail of plans, tests, and deployments',
  },
  {
    icon: Layers,
    title: 'Multi-Template',
    description: 'Next.js, MERN, Firebase, and more templates ready',
  },
];

const stats = [
  { value: '10x', label: 'Faster Development' },
  { value: '100%', label: 'Automated Testing' },
  { value: '0', label: 'Manual Deploy Steps' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg">AutoShip</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Button>
            <Link to="/dashboard">
              <Button size="sm">
                Open App
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        {/* Background effects */}
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-chart-4/15 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Autonomous Software Factory</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-in">
              Ship Software
              <br />
              <span className="gradient-text text-glow">Autonomously</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in opacity-0 stagger-1">
              Transform your ideas into deployed applications. AutoShip orchestrates planning, 
              building, testing, and deployment — all autonomously with AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in opacity-0 stagger-2">
              <Link to="/dashboard">
                <Button variant="hero" size="xl" className="group">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Start Building
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="glass" size="xl" className="gap-2">
                <Github className="w-5 h-5" />
                View on GitHub
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-12 mt-16 animate-fade-in opacity-0 stagger-3">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground mb-4">
              <Zap className="w-3 h-3" />
              WORKFLOW
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How AutoShip Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete autonomous pipeline from idea to production
            </p>
          </div>

          <WorkflowInfographic />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        
        <div className="relative container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground mb-4">
              <CheckCircle2 className="w-3 h-3" />
              FEATURES
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Built for Speed & Reliability
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature designed to minimize human intervention
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card shine rounded-2xl p-6 hover-card animate-fade-in opacity-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Artifacts Preview */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground mb-4">
              <FileCheck className="w-3 h-3" />
              ARTIFACTS
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Proof-of-Work Artifacts
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every run produces a complete audit trail
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {exampleArtifacts.map((artifact, index) => (
              <div key={artifact.title} className="animate-fade-in opacity-0" style={{ animationDelay: `${index * 100}ms` }}>
                <ArtifactCard {...artifact} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/dashboard">
              <Button variant="glow" size="lg" className="gap-2">
                Start Your First Run
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        
        <div className="relative container mx-auto px-6">
          <div className="glass-card rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto animated-border">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to ship faster?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of developers using AutoShip to build and deploy applications autonomously.
            </p>
            <Link to="/dashboard">
              <Button variant="hero" size="xl">
                <Rocket className="w-5 h-5" />
                Launch AutoShip
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold">AutoShip</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Autonomous software building orchestrator
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
