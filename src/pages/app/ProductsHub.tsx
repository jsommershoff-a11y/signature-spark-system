import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Plug, FileText, Wand2 } from 'lucide-react';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { useAuth } from '@/contexts/AuthContext';

function fmtEUR(cents: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default function ProductsHub() {
  const { hasMinRole } = useAuth();
  const isStaff = hasMinRole('mitarbeiter');
  const { data: products = [], isLoading } = useCatalogProducts({ includeInactive: isStaff });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const grouped = products.reduce<Record<string, typeof products>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Produkte</h1>
        <p className="text-muted-foreground mt-1">
          Pro Produkt: Beschreibung, Angebots-Template, KI-Prompt und notwendige Konnektoren.
        </p>
      </div>

      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat} className="space-y-3">
          <h2 className="text-lg font-semibold capitalize">{cat}</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Card key={p.id} className={p.active ? 'hover:border-primary/40 transition-colors' : 'opacity-60'}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">{p.code}</Badge>
                    <span className="text-sm font-semibold">{fmtEUR(p.price_gross_cents)}</span>
                  </div>
                  <CardTitle className="text-base mt-2">{p.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{p.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {p.offer_template ? 'Template ✓' : 'Kein Template'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wand2 className="h-3 w-3" />
                      {p.offer_prompt ? 'KI-Prompt ✓' : 'Kein Prompt'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Plug className="h-3 w-3" />
                      {p.required_connectors.length} Pflicht
                    </span>
                  </div>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to={`/app/produkte/${p.id}`}>
                      Arbeitsbereich öffnen <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
