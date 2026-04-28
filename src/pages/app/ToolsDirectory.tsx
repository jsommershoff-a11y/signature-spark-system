import { useTools } from '@/hooks/usePrompts';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { LockedContent } from '@/components/app/LockedContent';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Star, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_ORDER: Record<string, number> = { basic: 1, starter: 2, growth: 3, premium: 4 };

export default function ToolsDirectory() {
  const { data: tools, isLoading } = useTools();
  const { tierName } = useMembershipAccess();
  const userTierLevel = TIER_ORDER[tierName] || 0;

  const hasAccess = (minTier: string) => (TIER_ORDER[minTier] || 0) <= userTierLevel;

  // Group by category
  const grouped = (tools || []).reduce<Record<string, typeof tools>>((acc, tool) => {
    const cat = tool.category || 'Sonstiges';
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(tool);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meine Tools</h1>
          <p className="text-muted-foreground">Empfohlene Apps und Tools für dein Unternehmen</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meine Tools</h1>
          <p className="text-muted-foreground">
            Kuratierte Auswahl an Tools, die wir selbst nutzen und empfehlen
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Wrench className="h-3 w-3" />
          {tools?.filter(t => hasAccess(t.min_tier)).length || 0} / {tools?.length || 0} verfügbar
        </Badge>
      </div>

      {Object.entries(grouped).map(([category, categoryTools]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{category}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryTools?.map(tool => {
              const accessible = hasAccess(tool.min_tier);
              return (
                <LockedContent
                  key={tool.id}
                  hasAccess={accessible}
                  requiredTier={tool.min_tier === 'starter' ? 'Starter' : 'Growth'}
                  moduleType="tools"
                  variant="overlay"
                >
                  <Card className={cn(
                    'transition-all h-full',
                    accessible ? 'hover:border-foreground/20' : 'opacity-80'
                  )}>
                    <CardContent className="p-4 flex flex-col gap-3 h-full">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {tool.is_featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                          <h3 className="font-semibold text-sm">{tool.name}</h3>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {tool.min_tier === 'basic' ? 'Basis' : 'Starter'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex-1">{tool.description}</p>
                      {accessible && tool.url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-2"
                          asChild
                        >
                          <a href={tool.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Tool öffnen
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </LockedContent>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
