import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Save, Sparkles, Copy, Check, Wand2, Plug, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCatalogProduct, useUpdateProductWorkspace } from '@/hooks/useCatalogProducts';
import { CONNECTOR_CATALOG } from '@/data/connectors-catalog';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

function fmtEUR(cents: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

const DEFAULT_PROMPT_TEMPLATE = `Du bist Angebots-Texter für KRS Signature.
Erstelle ein klares, strukturiertes Angebot für das Produkt "{{product_name}}" ({{product_code}}).

Kunden-Kontext:
- Name: {{lead_name}}
- Unternehmen: {{lead_company}}
- Branche: {{lead_industry}}
- Schmerzpunkt: {{lead_pain}}

Produkt-Eckdaten:
- Preis: {{product_price}}
- Lieferzeit: {{product_delivery_days}} Tage
- Erforderliche Konnektoren: {{required_connectors}}

Liefere ein JSON-Objekt mit den Feldern: title, summary, scope[], deliverables[], timeline, price_breakdown, next_steps[].`;

export default function ProductWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasMinRole } = useAuth();
  const isStaff = hasMinRole('mitarbeiter');

  const { data: product, isLoading } = useCatalogProduct(id);
  const update = useUpdateProductWorkspace();

  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('');
  const [prompt, setPrompt] = useState('');
  const [required, setRequired] = useState<string[]>([]);
  const [optional, setOptional] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Hydrate state once product is loaded
  useMemo(() => {
    if (!product) return;
    setDescription(product.description ?? '');
    setTemplate(product.offer_template ?? '');
    setPrompt(product.offer_prompt ?? DEFAULT_PROMPT_TEMPLATE);
    setRequired(product.required_connectors ?? []);
    setOptional(product.optional_connectors ?? []);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-3">
        <p className="text-muted-foreground">Produkt nicht gefunden.</p>
        <Button asChild variant="outline">
          <Link to="/app/produkte"><ArrowLeft className="h-4 w-4 mr-1" /> Zurück zur Übersicht</Link>
        </Button>
      </div>
    );
  }

  const toggleConn = (slug: string, list: 'required' | 'optional') => {
    if (!isStaff) return;
    if (list === 'required') {
      setRequired((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    } else {
      setOptional((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    }
    setDirty(true);
  };

  const save = async () => {
    try {
      await update.mutateAsync({
        id: product.id,
        description: description || null,
        offer_template: template || null,
        offer_prompt: prompt || null,
        required_connectors: required,
        optional_connectors: optional,
      });
      toast.success('Produkt-Arbeitsbereich gespeichert.');
      setDirty(false);
    } catch (e: any) {
      toast.error('Speichern fehlgeschlagen', { description: e.message });
    }
  };

  const generateOffer = async () => {
    setGenerating(true);
    setGenerated('');
    try {
      const { data, error } = await supabase.functions.invoke('generate-offer-from-product', {
        body: { product_id: product.id, prompt_override: prompt },
      });
      if (error) throw error;
      setGenerated(typeof data?.offer === 'string' ? data.offer : JSON.stringify(data?.offer ?? data, null, 2));
      toast.success('Angebots-Entwurf erstellt.');
    } catch (e: any) {
      toast.error('Generierung fehlgeschlagen', { description: e.message });
    } finally {
      setGenerating(false);
    }
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('In Zwischenablage kopiert');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/app/produkte"><ArrowLeft className="h-4 w-4 mr-1" /> Alle Produkte</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">{product.code}</Badge>
            <Badge variant="secondary">{product.category}</Badge>
            <Badge variant={product.active ? 'default' : 'outline'}>
              {product.active ? 'Aktiv' : 'Inaktiv'}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name}</h1>
          {product.subtitle && <p className="text-muted-foreground">{product.subtitle}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-2xl font-bold">
            {fmtEUR(product.price_gross_cents)}
            {product.price_period_label ? <span className="text-sm font-normal text-muted-foreground">{product.price_period_label}</span> : null}
          </div>
          {product.payment_link && (
            <Button asChild size="sm" variant="outline">
              <a href={product.payment_link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> Payment Link
              </a>
            </Button>
          )}
          {isStaff && dirty && (
            <Button onClick={save} disabled={update.isPending} size="sm">
              {update.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Speichern
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview"><FileText className="h-4 w-4 mr-1" /> Übersicht</TabsTrigger>
          <TabsTrigger value="template"><FileText className="h-4 w-4 mr-1" /> Angebots-Template</TabsTrigger>
          <TabsTrigger value="prompt"><Wand2 className="h-4 w-4 mr-1" /> KI-Prompt</TabsTrigger>
          <TabsTrigger value="connectors"><Plug className="h-4 w-4 mr-1" /> Konnektoren</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Produktbeschreibung</CardTitle>
              <CardDescription>
                Kurze interne Beschreibung — wozu dient dieses Produkt, was beinhaltet es?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setDirty(true); }}
                placeholder="Was leistet dieses Produkt für den Kunden?"
                rows={6}
                disabled={!isStaff}
              />
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <Stat label="Lieferzeit" value={product.delivery_days > 0 ? `${product.delivery_days} Tage` : '—'} />
                <Stat label="Modus" value={product.mode === 'subscription' ? 'Abo' : 'Einmalig'} />
                <Stat label="Pflicht-Konnektoren" value={String(required.length)} />
                <Stat label="Optionale Konnektoren" value={String(optional.length)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEMPLATE */}
        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Angebots-Entwurf (Template)</CardTitle>
              <CardDescription>
                Statische Vorlage mit Platzhaltern wie <code className="text-xs">{'{{lead_name}}'}</code>,{' '}
                <code className="text-xs">{'{{lead_company}}'}</code>,{' '}
                <code className="text-xs">{'{{product_price}}'}</code>. Wird beim Angebot-Erstellen vorbefüllt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={template}
                onChange={(e) => { setTemplate(e.target.value); setDirty(true); }}
                placeholder={`Sehr geehrte/r {{lead_name}},\n\ngerne unterbreiten wir Ihnen ein Angebot für ${product.name}...`}
                rows={14}
                className="font-mono text-sm"
                disabled={!isStaff}
              />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => copy(template)} disabled={!template}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  Template kopieren
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROMPT */}
        <TabsContent value="prompt">
          <Card>
            <CardHeader>
              <CardTitle>KI-Angebots-Prompt</CardTitle>
              <CardDescription>
                LLM-Prompt zur automatischen Angebotserstellung. Wird mit Lead-Kontext an Lovable AI Gateway gesendet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); setDirty(true); }}
                rows={14}
                className="font-mono text-sm"
                disabled={!isStaff}
              />
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setPrompt(DEFAULT_PROMPT_TEMPLATE); setDirty(true); }} disabled={!isStaff}>
                  Standard wiederherstellen
                </Button>
                <Button onClick={generateOffer} disabled={generating || !prompt}>
                  {generating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  Test-Generierung starten
                </Button>
              </div>

              {generated && (
                <div className="space-y-2">
                  <Label>Ergebnis</Label>
                  <Textarea value={generated} readOnly rows={12} className="font-mono text-xs bg-muted/30" />
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => copy(generated)}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Ergebnis kopieren
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONNECTORS */}
        <TabsContent value="connectors">
          <Card>
            <CardHeader>
              <CardTitle>Notwendige Konnektoren des Kunden</CardTitle>
              <CardDescription>
                Welche Systeme muss der Kunde verbunden haben, damit dieses Produkt voll funktioniert?
                Pflicht-Konnektoren erscheinen im Kundenportal als Onboarding-Checkliste.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                {CONNECTOR_CATALOG.map((c) => {
                  const isReq = required.includes(c.slug);
                  const isOpt = optional.includes(c.slug);
                  return (
                    <div
                      key={c.slug}
                      className={cn(
                        'flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors',
                        isReq ? 'border-primary/40 bg-primary/5' : isOpt ? 'border-muted-foreground/30 bg-muted/30' : 'border-border'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.description}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <Checkbox
                            checked={isReq}
                            onCheckedChange={() => toggleConn(c.slug, 'required')}
                            disabled={!isStaff}
                          />
                          Pflicht
                        </label>
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <Checkbox
                            checked={isOpt}
                            onCheckedChange={() => toggleConn(c.slug, 'optional')}
                            disabled={!isStaff}
                          />
                          Optional
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold mt-1">{value}</div>
    </div>
  );
}
