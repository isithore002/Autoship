import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Rocket, 
  Plus, 
  History, 
  FileBox, 
  Settings, 
  Home,
  Zap,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'New Run', icon: Plus },
  { href: '/runs', label: 'Runs History', icon: History },
  { href: '/artifacts', label: 'Artifacts', icon: FileBox },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border group">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
          <Rocket className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-foreground">AutoShip</h1>
          <p className="text-xs text-muted-foreground">Build Orchestrator</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 mb-3">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = location.pathname === href || 
            (href !== '/' && location.pathname.startsWith(href));
          
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-success" />
            </div>
            <div>
              <span className="text-sm font-medium block">Autonomous Mode</span>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          </div>
          <div className="flex gap-1">
            {['Plan', 'Build', 'Test', 'Deploy'].map((step, i) => (
              <div 
                key={step}
                className="flex-1 h-1.5 rounded-full bg-primary/30"
                style={{ opacity: 1 - (i * 0.15) }}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
