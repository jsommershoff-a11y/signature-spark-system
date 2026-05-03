import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Lightbulb, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { PipelineStage, PIPELINE_STAGE_LABELS } from '@/types/crm';
import { STAGE_PLAYBOOK } from '@/lib/sales-scripts/stage-playbook';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

// Lineare Default-Reihenfolge der Stages für Auto-Vorschlag.
// `lost` ist explizit kein Vorschlag (nur manuell setzbar).
const STAGE_PROGRESSION: PipelineStage[] = [
  'new_lead',
  'setter_call_scheduled',
  'setter_call_done',
  'analysis_ready',
  'offer_draft',
  'offer_sent',
  'payment_unlocked',
  'won',
];

const getNextStage = (current: PipelineStage): PipelineStage | null => {
  const idx = STAGE_PROGRESSION.indexOf(current);
  if (idx < 0 || idx >= STAGE_PROGRESSION.length - 1) return null;
  return STAGE_PROGRESSION[idx + 1];
};

interface StagePlaybookCardProps {
  stage: PipelineStage;
  pipelineItemId?: string;
  initialMeta?: Record<string, unknown> | null;
  className?: string;
}

type ChecklistMap = Record<string, Record<string, boolean>>;

export function StagePlaybookCard({ stage, pipelineItemId, initialMeta, className }: StagePlaybookCardProps) {
  const entry = STAGE_PLAYBOOK[stage];
  const queryClient = useQueryClient();

  const initialChecklist = useMemo<ChecklistMap>(() => {
    const cl = (initialMeta as { checklist?: ChecklistMap } | null | undefined)?.checklist;
    return cl && typeof cl === 'object' ? cl : {};
  }, [initialMeta]);

  const [checklist, setChecklist] = useState<ChecklistMap>(initialChecklist);
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    setChecklist(initialChecklist);
  }, [initialChecklist, pipelineItemId]);

  if (!entry) return null;

  const stageChecks = checklist[stage] ?? {};
  const total = entry.fragen.length;
  const done = entry.fragen.reduce((acc, _q, idx) => acc + (stageChecks[String(idx)] ? 1 : 0), 0);
  const isComplete = total > 0 && done === total;
  const nextStage = getNextStage(stage);
  const canAdvance = isComplete && !!nextStage && !!pipelineItemId;

  const toggle = async (idx: number, value: boolean) => {
    const next: ChecklistMap = {
      ...checklist,
      [stage]: { ...stageChecks, [String(idx)]: value },
    };
    setChecklist(next);

    if (!pipelineItemId) return;
    setSaving(true);
    try {
      const { data: current, error: readErr } = await supabase
        .from('pipeline_items')
        .select('meta')
        .eq('id', pipelineItemId)
        .maybeSingle();
      if (readErr) throw readErr;
      const meta = ((current?.meta as Record<string, unknown> | null) ?? {}) as Record<string, unknown>;
      const newMeta = { ...meta, checklist: next };
      const { error } = await supabase
        .from('pipeline_items')
        .update({ meta: newMeta })
        .eq('id', pipelineItemId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    } catch (err) {
      toast.error('Checkliste konnte nicht gespeichert werden', {
        description: (err as Error).message,
      });
      setChecklist(checklist);
    } finally {
      setSaving(false);
    }
  };

  const advanceStage = async () => {
    if (!pipelineItemId || !nextStage) return;
    setAdvancing(true);
    try {
      const { error } = await supabase
        .from('pipeline_items')
        .update({
          stage: nextStage,
          stage_updated_at: new Date().toISOString(),
        })
        .eq('id', pipelineItemId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead verschoben', {
        description: `Neue Phase: ${PIPELINE_STAGE_LABELS[nextStage]}`,
      });
    } catch (err) {
      toast.error('Stage konnte nicht aktualisiert werden', {
        description: (err as Error).message,
      });
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            Sales-Skript
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {done}/{total}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {PIPELINE_STAGE_LABELS[stage]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Fortschrittsbalken pro Stage */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground flex items-center gap-1.5">
              {done === total && total > 0 && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              )}
              Fortschritt
            </span>
            <span
              className={cn(
                'font-semibold tabular-nums',
                done === total && total > 0 ? 'text-emerald-600' : 'text-foreground',
              )}
            >
              {total > 0 ? Math.round((done / total) * 100) : 0}%
            </span>
          </div>
          <Progress
            value={total > 0 ? (done / total) * 100 : 0}
            className={cn(
              'h-2 transition-colors',
              done === total && total > 0 && '[&>div]:bg-emerald-500',
            )}
            aria-label={`Sales-Skript Fortschritt: ${done} von ${total} Punkten erledigt`}
          />
        </div>

        <div className="flex items-start gap-2">
          <Target className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ziel</p>
            <p>{entry.ziel}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Checkliste {saving && <span className="ml-1 italic">· speichert…</span>}
          </p>
          <ul className="space-y-2">
            {entry.fragen.map((q, idx) => {
              const id = `playbook-${stage}-${idx}`;
              const checked = !!stageChecks[String(idx)];
              return (
                <li key={q} className="flex items-start gap-2">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(v) => toggle(idx, v === true)}
                    disabled={!pipelineItemId}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={id}
                    className={cn(
                      'cursor-pointer leading-snug',
                      checked && 'line-through text-muted-foreground',
                    )}
                  >
                    {q}
                  </label>
                </li>
              );
            })}
          </ul>
          {!pipelineItemId && (
            <p className="text-xs text-muted-foreground italic mt-2">
              Lead noch nicht in Pipeline – Checkliste nicht speicherbar.
            </p>
          )}
        </div>

        {/* Auto-Stage-Vorschlag bei 100% Erfüllung */}
        {canAdvance && nextStage && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Alle Punkte abgehakt – bereit für die nächste Phase
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Vorschlag: <span className="font-medium text-foreground">{PIPELINE_STAGE_LABELS[nextStage]}</span>
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={advanceStage}
              disabled={advancing}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {advancing ? 'Verschiebe…' : 'In nächste Phase verschieben'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2">
          <Lightbulb className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
          <p className="text-xs text-muted-foreground">{entry.hinweis}</p>
        </div>
      </CardContent>
    </Card>
  );
}
