import { Activity, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">SparkBench</h1>
              <p className="text-xs text-muted-foreground">Healthcare Data Performance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Spark vs Pandas</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
