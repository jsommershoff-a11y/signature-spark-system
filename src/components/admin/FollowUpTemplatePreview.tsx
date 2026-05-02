import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import {
  renderFollowUpTemplate,
  type FollowUpTemplate,
  type FollowUpTemplateId,
  type FollowUpVariant,
} from '@/lib/sales-scripts/follow-up';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PIPELINE_STAGE_LABELS, type PipelineStage } from '@/types/crm';

interface PreviewLead {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  email: string | null;
  pipeline_item?: { stage: PipelineStage } | null;
}

interface FollowUpTemplatePreviewProps {
  /** Live-Werte aus dem Editor-Formular */
  templateKey: string;
  subject: string;
  body: string;
  variants: FollowUpVariant[];
  /** Stages, denen die Vorlage zugeordnet ist – für Phase-Default im Beispiel */
  stages: string[];
}

const FALLBACK_LEAD: PreviewLead = {
  id: 'fallback',
  first_name: 'Max',
  last_name: 'Mustermann',
  company: 'Musterfirma GmbH',
  email: 'max@musterfirma.de',
  pipeline_item: { stage: 'setter_call_scheduled' },
};

function getGreetingName(lead: PreviewLead): string {
  return (
    lead.first_name?.trim() ||
    [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim() ||
    'Sie'
  );
}

export function FollowUpTemplatePreview({
  templateKey,
  subject,
  body,
  variants,
  stages,
}: FollowUpTemplatePreviewProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string>('fallback');
  const [variantId, setVariantId] = useState<string>('default');
  // Wann-Beispiel: nächster Werktag 10:00
  const [whenDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  });

  // Letzte 25 Leads als Beispielquelle
  const { data: leads = [], refetch, isFetching } = useQuery({
    queryKey: ['admin-followup-preview-leads'],
    queryFn: async (): Promise<PreviewLead[]> => {
      const { data, error } = await supabase
        .from('crm_leads')
        .select(
          'id, first_name, last_name, company, email, pipeline_item:pipeline_items(stage)'
        )
        .order('created_at', { ascending: false })
        .limit(25);
      if (error) throw error;
      return ((data ?? []) as unknown as Array<PreviewLead & { pipeline_item: { stage: PipelineStage }[] | null }>).map(
        (l) => ({
          ...l,
          pipeline_item: Array.isArray(l.pipeline_item) ? l.pipeline_item[0] ?? null : l.pipeline_item,
        }),
      );
    },
    staleTime: 60_000,
  });

  const lead = useMemo<PreviewLead>(() => {
    if (selectedLeadId === 'fallback') return FALLBACK_LEAD;
    return leads.find((l) => l.id === selectedLeadId) ?? FALLBACK_LEAD;
  }, [leads, selectedLeadId]);

  const stage = lead.pipeline_item?.stage ?? (stages[0] as PipelineStage | undefined) ?? 'setter_call_scheduled';

  // Live-Template aus dem Formular bauen, damit Tipp-Änderungen sofort sichtbar sind
  const liveTemplate: FollowUpTemplate = useMemo(
    () => ({
      id: (templateKey || 'preview') as FollowUpTemplateId,
      label: templateKey || 'Vorschau',
      description: '',
      subject: subject || '',
      body: (body || '').split('\n'),
      variants: variants && variants.length > 0 ? variants : undefined,
    }),
    [templateKey, subject, body, variants],
  );

  const variantOptions = useMemo(
    () => [
      { id: 'default', label: 'Standard (ohne Variante)' },
      ...(variants ?? []).map((v) => ({ id: v.id, label: `Variante ${v.id}` })),
    ],
    [variants],
  );

  // Wenn ausgewählte Variante gelöscht wurde → zurück auf default
  useEffect(() => {
    if (variantId === 'default') return;
    if (!(variants ?? []).some((v) => v.id === variantId)) setVariantId('default');
  }, [variants, variantId]);

  const rendered = useMemo(() => {
    try {
      return renderFollowUpTemplate(
        liveTemplate.id,
        {
          greetingName: getGreetingName(lead),
          when: format(whenDate, "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de }),
          company: lead.company,
          stageLabel: PIPELINE_STAGE_LABELS[stage] ?? stage,
        },
        [liveTemplate],
        variantId === 'default' ? undefined : { variantId },
      );
    } catch (err) {
      return { subject: '⚠️ Fehler beim Rendern', body: String(err), variantId: 'error' } as const;
    }
  }, [liveTemplate, lead, whenDate, stage, variantId]);

  return (
    <div className="border rounded-md bg-muted/20 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="flex items-center gap-1.5 text-sm font-medium">
          <Eye className="h-4 w-4 text-primary" /> Live-Vorschau
        </Label>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2"
          onClick={() => refetch()}
          disabled={isFetching}
          title="Beispiel-Leads neu laden"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Steuerung */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Beispiel-Lead</Label>
          <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Lead wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fallback">⭐ Beispiel: Max Mustermann (Musterfirma GmbH)</SelectItem>
              {leads.map((l) => {
                const name = [l.first_name, l.last_name].filter(Boolean).join(' ').trim() || l.email || l.id;
                return (
                  <SelectItem key={l.id} value={l.id}>
                    {name}
                    {l.company ? ` · ${l.company}` : ''}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Variante</Label>
          <Select value={variantId} onValueChange={setVariantId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {variantOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Belegte Platzhalter */}
      <div className="flex flex-wrap gap-1.5">
        <PlaceholderBadge name="greeting_name" value={getGreetingName(lead)} />
        <PlaceholderBadge
          name="when"
          value={format(whenDate, "d. MMM yyyy, HH:mm 'Uhr'", { locale: de })}
        />
        <PlaceholderBadge name="company" value={lead.company || '—'} muted={!lead.company} />
        <PlaceholderBadge name="stage_label" value={PIPELINE_STAGE_LABELS[stage] ?? stage} />
      </div>

      {/* Render-Ausgabe */}
      <Tabs defaultValue="rendered">
        <TabsList className="h-8">
          <TabsTrigger value="rendered" className="text-xs">Vorschau</TabsTrigger>
          <TabsTrigger value="source" className="text-xs">Quelltext</TabsTrigger>
        </TabsList>
        <TabsContent value="rendered" className="space-y-2 mt-2">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Betreff</p>
            <p className="text-sm font-medium border rounded px-2 py-1.5 bg-background">
              {rendered.subject || <span className="text-muted-foreground italic">Kein Betreff</span>}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Body</p>
            <pre className="text-xs whitespace-pre-wrap border rounded px-2 py-1.5 bg-background max-h-72 overflow-auto leading-relaxed">
              {rendered.body || <span className="text-muted-foreground italic">Kein Inhalt</span>}
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="source" className="mt-2">
          <pre className="text-[11px] whitespace-pre-wrap border rounded px-2 py-1.5 bg-background max-h-72 overflow-auto font-mono">
{`Subject: ${subject}\n\n${body}`}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlaceholderBadge({ name, value, muted = false }: { name: string; value: string; muted?: boolean }) {
  return (
    <Badge variant={muted ? 'outline' : 'secondary'} className="text-[10px] gap-1 font-normal">
      <span className="font-mono opacity-70">{`{{${name}}}`}</span>
      <span>→</span>
      <span className="font-medium truncate max-w-[160px]">{value}</span>
    </Badge>
  );
}
