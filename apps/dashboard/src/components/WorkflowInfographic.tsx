import { Lightbulb, Hammer, CheckCircle, Rocket, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Lightbulb,
    title: 'Plan',
    description: 'AI analyzes your goal and creates a structured build plan with milestones',
    gradient: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    number: '01',
  },
  {
    icon: Hammer,
    title: 'Build',
    description: 'Autonomous code generation with VibeCoder intelligent self-fixing loops',
    gradient: 'from-warning/20 to-warning/5',
    iconBg: 'bg-warning/20',
    iconColor: 'text-warning',
    number: '02',
  },
  {
    icon: CheckCircle,
    title: 'Verify',
    description: 'Automated testing, linting, and comprehensive browser QA checks',
    gradient: 'from-success/20 to-success/5',
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
    number: '03',
  },
  {
    icon: Rocket,
    title: 'Deploy',
    description: 'One-click deployment with proof-of-work artifacts and audit trail',
    gradient: 'from-chart-4/20 to-chart-4/5',
    iconBg: 'bg-chart-4/20',
    iconColor: 'text-chart-4',
    number: '04',
  },
];

interface WorkflowInfographicProps {
  className?: string;
}

export function WorkflowInfographic({ className }: WorkflowInfographicProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;
        
        return (
          <div 
            key={step.title} 
            className="relative animate-fade-in opacity-0"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn(
              'glass-card shine hover-card rounded-2xl p-6 h-full relative overflow-hidden'
            )}>
              {/* Background gradient */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-50',
                step.gradient
              )} />
              
              <div className="relative">
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', step.iconBg)}>
                    <Icon className={cn('w-7 h-7', step.iconColor)} />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20 font-mono">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
            
            {/* Arrow connector (desktop only) */}
            {!isLast && (
              <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-muted border border-border items-center justify-center">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
