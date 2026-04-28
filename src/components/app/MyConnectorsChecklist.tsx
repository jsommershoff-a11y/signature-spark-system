import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Loader2, Plug, ExternalLink } from 'lucide-react';
import { CONNECTOR_CATALOG, getConnector } from '@/data/connectors-catalog';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

/**
 * Customer-facing connector checklist.
 * Aggregates required connectors across all active products and shows
 * a connection-status hint per item.
 *
 * NOTE: live connection status is not (yet) wired to standard_connectors —
 * we display the catalog with a CTA to verbinden in /app/settings.
 */
export function MyConnectorsChecklist() {
  const { user } = useAuth();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['my-product-connectors', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // For now: show connectors for all active products (everyone could need them).
      // Future: filter to products the customer actually purchased.
      const { data, error } = await supabase
        .from('catalog_products')
        .select('id, code, name, required_connectors, optional_connectors')
        .eq('active', true);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Aggregate required + optional connectors across products
  const aggregate = new Map<string, { required: boolean; products: string[] }>();
  for (const p of products) {
    for (const slug of p.required_connectors ?? []) {
      const entry = aggregate.get(slug) ?? { required: false, products: [] };
      entry.required = true;
      entry.products.push(p.name);
      aggregate.set(slug, entry);
    }
    for (const slug of p.optional_connectors ?? []) {
      const entry = aggregate.get(slug) ?? { required: false, products: [] };
      entry.products.push(p.name);
      aggregate.set(slug, entry);
    }
  }

  const items = Array.from(aggregate.entries())
    .map(([slug, info]) => ({ slug, ...info, meta: getConnector(slug) }))
    .filter((i) => i.meta)
    .sort((a, b) => Number(b.required) - Number(a.required));

  if (items.length === 0) {
    return null;
  }

  const requiredCount = items.filter((i) => i.required).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5" /> Deine Konnektoren
            </CardTitle>
            <CardDescription>
              Diese Systeme solltest du verbunden haben, damit deine KI-Automationen reibungslos laufen.
            </CardDescription>
          </div>
          <Badge variant="outline">{requiredCount} Pflicht</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((i) => (
          <div
            key={i.slug}
            className="flex items-start justify-between gap-3 rounded-lg border bg-card p-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              {i.required ? (
                <Circle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{i.meta!.name}</span>
                  {i.required && (
                    <Badge variant="default" className="text-[10px] h-5">Pflicht</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{i.meta!.description}</p>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                  Benötigt für: {i.products.slice(0, 3).join(', ')}
                  {i.products.length > 3 ? ` +${i.products.length - 3}` : ''}
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/settings">
                Verbinden <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
