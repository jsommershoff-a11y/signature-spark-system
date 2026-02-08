import { 
  Compass, 
  Target, 
  Users, 
  Settings, 
  Calendar,
  LayoutGrid,
  TrendingUp,
  Package,
  UserCheck,
  BarChart3,
  Cog
} from "lucide-react";

interface SystemModule {
  title: string;
  icon?: string;
}

interface SystemSectionProps {
  headline: string;
  modules: SystemModule[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  compass: Compass,
  target: Target,
  users: Users,
  settings: Settings,
  calendar: Calendar,
  grid: LayoutGrid,
  trending: TrendingUp,
  package: Package,
  usercheck: UserCheck,
  chart: BarChart3,
  cog: Cog,
};

export const SystemSection = ({ headline, modules }: SystemSectionProps) => {
  const defaultIcons = ["compass", "target", "users", "settings", "calendar", "cog"];
  
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
          {headline}
        </h2>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => {
              const iconKey = module.icon || defaultIcons[index % defaultIcons.length];
              const IconComponent = iconMap[iconKey] || Compass;
              
              return (
                <div 
                  key={index}
                  className="group relative p-6 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="text-primary font-bold text-lg">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {module.title}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
