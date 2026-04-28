import { useState } from 'react';
import { usePromptCategories, usePrompts } from '@/hooks/usePrompts';
import { useMembershipAccess } from '@/hooks/useMembershipAccess';
import { LockedContent } from '@/components/app/LockedContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Phone, Megaphone, Workflow, Headphones, Target,
  Copy, Check, Lock, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TIER_ORDER: Record<string, number> = { basic: 1, starter: 2, growth: 3, premium: 4 };

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, Megaphone, Workflow, Headphones, Target,
};

export default function PromptLibrary() {
  const { data: categories, isLoading: catLoading } = usePromptCategories();
  const { data: allPrompts, isLoading: promptLoading } = usePrompts();
  const { tierName } = useMembershipAccess();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const userTierLevel = TIER_ORDER[tierName] || 0;

  const copyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Prompt kopiert!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasAccess = (minTier: string) => {
    const required = TIER_ORDER[minTier] || 0;
    return userTierLevel >= required;
  };

  const activeTab = categories?.[0]?.slug || '';

  if (catLoading || promptLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompt-Bibliothek</h1>
          <p className="text-muted-foreground">Kuratierte Prompts für deinen Unternehmensalltag</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompt-Bibliothek</h1>
          <p className="text-muted-foreground">
            Kuratierte Prompts für deinen Unternehmensalltag — sofort einsetzbar
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          {allPrompts?.filter(p => hasAccess(p.min_tier)).length || 0} / {allPrompts?.length || 0} freigeschaltet
        </Badge>
      </div>

      <Tabs defaultValue={activeTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          {categories?.map(cat => {
            const Icon = iconMap[cat.icon || ''] || Target;
            return (
              <TabsTrigger key={cat.slug} value={cat.slug} className="gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {cat.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories?.map(cat => {
          const catPrompts = allPrompts?.filter(p => p.category_id === cat.id) || [];
          return (
            <TabsContent key={cat.slug} value={cat.slug} className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">{cat.description}</p>
              <div className="grid gap-4 md:grid-cols-2">
                {catPrompts.map(prompt => {
                  const accessible = hasAccess(prompt.min_tier);
                  return (
                    <LockedContent
                      key={prompt.id}
                      hasAccess={accessible}
                      requiredTier={prompt.min_tier === 'starter' ? 'Starter' : 'Growth'}
                      moduleType="prompts"
                      variant="overlay"
                    >
                      <Card className={cn(
                        'transition-all',
                        accessible ? 'hover:border-foreground/20' : 'opacity-80'
                      )}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base">{prompt.title}</CardTitle>
                            <Badge
                              variant={accessible ? 'secondary' : 'outline'}
                              className="text-[10px] shrink-0"
                            >
                              {prompt.min_tier === 'basic' ? 'Basis' : prompt.min_tier === 'starter' ? 'Starter' : 'Pro'}
                            </Badge>
                          </div>
                          {prompt.description && (
                            <p className="text-xs text-muted-foreground">{prompt.description}</p>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="rounded-md bg-muted/50 p-3 text-sm font-mono leading-relaxed max-h-32 overflow-y-auto">
                            {prompt.prompt_text}
                          </div>
                          {accessible && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full gap-2"
                              onClick={() => copyPrompt(prompt.id, prompt.prompt_text)}
                            >
                              {copiedId === prompt.id ? (
                                <><Check className="h-3.5 w-3.5" /> Kopiert</>
                              ) : (
                                <><Copy className="h-3.5 w-3.5" /> Prompt kopieren</>
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </LockedContent>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
