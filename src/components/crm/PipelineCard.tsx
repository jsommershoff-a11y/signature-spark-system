import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  User,
  Phone,
  Mail,
  ArrowUpRight,
  Clock,
  Target,
  AlertTriangle,
  CalendarPlus,
  Send,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { PipelineItemWithLead, usePipeline } from '@/hooks/usePipeline';
import { useCalls } from '@/hooks/useCalls';
import { useActivities } from '@/hooks/useActivities';
import { ScheduleCallDialog } from '@/components/calls/ScheduleCallDialog';
import { FollowUpPreviewDialog } from './FollowUpPreviewDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getStageLabel,
  getPriorityTone,
  getPriorityLabel,
  getAutoAdvanceStageAfterBooking,
} from '@/lib/pipeline-stage';
import {
  renderFollowUpTemplate,
  type FollowUpTemplateId,
  type FollowUpTemplate,
} from '@/lib/sales-scripts/follow-up';
import { useFollowUpTemplatesPublic } from '@/hooks/useFollowUpTemplates';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PipelineCardProps {
  item: PipelineItemWithLead;
  onClick?: () => void;
  isDragging?: boolean;
}



function getInitials(first?: string, last?: string) {
  const f = (first || '').trim()[0] || '';
  const l = (last || '').trim()[0] || '';
  return (f + l).toUpperCase() || '?';
}

function getRelativeTime(iso?: string) {
  if (!iso) return null;
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: de });
  } catch {
    return null;
  }
}

const STAGNATION_DAYS = 7;

function getStagnation(iso?: string, stage?: string) {
  if (!iso) return null;
  // Geschlossene Phasen ignorieren
  if (stage === 'won' || stage === 'lost') return null;
  const updated = new Date(iso).getTime();
  if (Number.isNaN(updated)) return null;
  const days = Math.floor((Date.now() - updated) / (1000 * 60 * 60 * 24));
  if (days < STAGNATION_DAYS) return null;
  return {
    days,
    severe: days >= 14,
    label: days >= 30 ? `Über 30 Tage ohne Bewegung` : `${days} Tage ohne Bewegung`,
  };
}

export function PipelineCard({ item, onClick, isDragging }: PipelineCardProps) {
  const lead = item.lead;
  const fullName = `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim() || lead.email;
  const stageLabel = getStageLabel(item.stage);
  const movedAgo = getRelativeTime(item.stage_updated_at);
  const priority = item.pipeline_priority_score;
  const icp = lead.icp_fit_score;
  const stagnation = getStagnation(item.stage_updated_at, item.stage);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [lastMeeting, setLastMeeting] = useState<{ scheduledAt?: string; type?: string } | null>(null);
  const [followUpPreview, setFollowUpPreview] = useState<
    | { templateId: FollowUpTemplateId; label: string; subject: string; body: string; variantId: string }
    | null
  >(null);
  const { createCall } = useCalls({ lead_id: lead.id });
  const { activities, createActivity } = useActivities({ lead_id: lead.id });
  const { moveToStage } = usePipeline();
  const { templates: followUpTemplates } = useFollowUpTemplatesPublic();

  // Cooldown-Tick: forciert Re-Render, wenn die 24h ablaufen,
  // damit der Button automatisch wieder freigegeben wird.
  const [, setNowTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNowTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const COOLDOWN_MS = 24 * 60 * 60 * 1000;

  // Optimistischer lokaler Override (nur bis Realtime-Refresh durch usePipeline ankommt)
  const [optimisticLastFollowUpAt, setOptimisticLastFollowUpAt] = useState<number | null>(null);

  // Server-Quelle: pipeline_items.last_followup_at (cross-device konsistent)
  const lastFollowUpServerAt = useMemo(() => {
    const raw = (item as any).last_followup_at as string | null | undefined;
    if (!raw) return null;
    const ts = new Date(raw).getTime();
    return Number.isFinite(ts) ? ts : null;
  }, [item]);

  const lastFollowUpAt =
    Math.max(lastFollowUpServerAt ?? 0, optimisticLastFollowUpAt ?? 0) || null;
  const cooldownRemainingMs =
    lastFollowUpAt && Date.now() - lastFollowUpAt < COOLDOWN_MS
      ? COOLDOWN_MS - (Date.now() - lastFollowUpAt)
      : 0;
  const isInCooldown = cooldownRemainingMs > 0;

  const formatCooldown = (ms: number) => {
    const totalMin = Math.ceil(ms / 60_000);
    if (totalMin >= 60) {
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }
    return `${totalMin}min`;
  };


  // Mini-CTAs ohne Card-Click zu triggern
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleScheduleSubmit = async (
    data: Parameters<typeof createCall>[0],
    options?: { attachContext: boolean },
  ) => {
    try {
      const attachContext = options?.attachContext ?? true;

      // Lead-Kontext nur anhängen, wenn Nutzer es nicht abgewählt hat
      let notes = data.notes;
      if (attachContext) {
        const contextLines = [
          `Lead: ${fullName}`,
          lead.company ? `Firma: ${lead.company}` : null,
          lead.phone ? `Telefon: ${lead.phone}` : null,
          lead.email ? `E-Mail: ${lead.email}` : null,
          `Phase: ${stageLabel}`,
        ].filter(Boolean).join('\n');
        notes = data.notes && data.notes.trim().length > 0
          ? `${data.notes}\n\n— Kontext —\n${contextLines}`
          : contextLines;
      }

      const created = await createCall({ ...data, notes });
      setLastMeeting({
        scheduledAt: (data as any)?.scheduled_at ?? created?.scheduled_at,
        type: (data as any)?.call_type ?? (created as any)?.call_type,
      });

      // Wenn Lead noch in einer frühen Phase ist → Auto-Advance vorschlagen.
      // Mapping zentral in pipeline-stage.ts, damit hier KEIN Stage-Key hartkodiert ist.
      const nextStage = getAutoAdvanceStageAfterBooking(item.stage);
      if (nextStage) {
        const nextLabel = getStageLabel(nextStage);
        toast.success('Termin angelegt', {
          description: `${fullName} ist aktuell in „${stageLabel}". Phase auf „${nextLabel}" setzen?`,
          duration: 10_000,
          action: {
            label: `Auf „${nextLabel}"`,
            onClick: async () => {
              const ok = await moveToStage(item.id, nextStage);
              if (ok) {
                createActivity.mutate(
                  {
                    type: 'notiz',
                    lead_id: lead.id,
                    content: `Phase nach Terminbuchung automatisch von „${stageLabel}" auf „${nextLabel}" gesetzt.`,
                  },
                  { onError: (err) => console.warn('Activity log failed:', err) },
                );
                toast.success(`Phase auf „${nextLabel}" gesetzt`, {
                  description: lead.email ? 'Jetzt Follow-up vorbereiten?' : undefined,
                  action: lead.email
                    ? { label: 'Vorschau', onClick: () => previewFollowUp() }
                    : undefined,
                });
              } else {
                toast.error('Phase konnte nicht aktualisiert werden');
              }
            },
          },
        });
      } else {
        toast.success('Termin angelegt', {
          description: `${fullName} – Follow-up jetzt vorbereiten?`,
          action: lead.email
            ? { label: 'Vorschau', onClick: () => previewFollowUp() }
            : undefined,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      toast.error('Termin konnte nicht angelegt werden', { description: message });
      throw err; // Dialog-Loading-State zurücksetzen
    }
  };

  const formatMeetingWhen = (iso?: string) => {
    if (!iso) return 'unserem vereinbarten Termin';
    try {
      return format(new Date(iso), "dd.MM.yyyy 'um' HH:mm 'Uhr'");
    } catch {
      return 'unserem vereinbarten Termin';
    }
  };

  // Templates leben zentral in src/lib/sales-scripts/follow-up.ts,
  // damit Sales/Marketing sie pflegen kann ohne UI-Code zu touchen.


  const buildFollowUp = (templateId: FollowUpTemplateId, variantId?: string) => {
    const greetingName = lead.first_name?.trim() || fullName;
    const when = formatMeetingWhen(lastMeeting?.scheduledAt);
    return renderFollowUpTemplate(
      templateId,
      { greetingName, when, company: lead.company, stageLabel },
      followUpTemplates,
      { variantId },
    );
  };

  const previewFollowUp = (templateId: FollowUpTemplateId = 'confirm') => {
    if (!lead.email) {
      toast.error('Keine E-Mail-Adresse hinterlegt');
      return;
    }
    const { template: tpl, subject, body, variantId } = buildFollowUp(templateId);
    setFollowUpPreview({ templateId, label: tpl.label, subject, body, variantId });
  };

  const sendFollowUp = (
    templateId: FollowUpTemplateId = 'confirm',
    force = false,
    variantId?: string,
  ) => {
    if (!lead.email) {
      toast.error('Keine E-Mail-Adresse hinterlegt');
      return;
    }

    if (isInCooldown && !force) {
      toast.warning('Follow-up bereits gesendet', {
        description: `An ${lead.email} ging vor weniger als 24h ein Follow-up raus. Verbleibend: ${formatCooldown(cooldownRemainingMs)}.`,
        action: {
          label: 'Trotzdem senden',
          onClick: () => sendFollowUp(templateId, true, variantId),
        },
      });
      return;
    }

    const { template: tpl, subject, body, variantId: usedVariantId } = buildFollowUp(templateId, variantId);

    const href = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;

    // Cross-Device-Cooldown: Server-State updaten + optimistisch lokal vormerken
    const nowIso = new Date().toISOString();
    setOptimisticLastFollowUpAt(Date.now());
    void supabase
      .from('pipeline_items')
      .update({
        last_followup_at: nowIso,
        last_followup_template_id: templateId,
        last_followup_variant_id: usedVariantId,
      } as any)
      .eq('id', item.id)
      .then(({ error }) => {
        if (error) console.warn('last_followup_at update failed:', error);
      });

    // Activity inkl. Variante loggen → A/B-Performance auswertbar
    createActivity.mutate(
      {
        type: 'email',
        lead_id: lead.id,
        content: `Follow-up "${tpl.label}" [Variante: ${usedVariantId}] vorbereitet an ${lead.email} – Betreff: "${subject}" (Phase: ${stageLabel})`,
        metadata: {
          followup_template_id: templateId,
          followup_template_label: tpl.label,
          followup_variant_id: usedVariantId,
          stage: item.stage,
        },
      } as any,
      {
        onError: (err) => {
          console.warn('Activity log failed:', err);
        },
      },
    );

    toast.success(`Follow-up vorbereitet: ${tpl.label} (Variante ${usedVariantId})`, {
      description: force
        ? 'Erneut gesendet – Cooldown zurückgesetzt.'
        : 'E-Mail-Entwurf geöffnet & im Verlauf protokolliert.',
    });
  };



  return (
    <Card
      className={cn(
      'group cursor-pointer transition-all hover:shadow-md hover:border-primary/40 border',
        isDragging && 'opacity-50 rotate-2 shadow-lg',
        stagnation?.severe && 'border-rose-400/60',
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2.5">
        {/* Kopfzeile: Avatar + Name + Priority */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                {getInitials(lead.first_name, lead.last_name)}
              </div>
              {stagnation && (
                <span
                  className={cn(
                    'absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-background',
                    stagnation.severe ? 'bg-rose-500 animate-pulse' : 'bg-amber-500',
                  )}
                  title={stagnation.label}
                  aria-label={stagnation.label}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm leading-tight truncate" title={fullName}>
                {fullName}
              </div>
              {lead.company && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate" title={lead.company}>{lead.company}</span>
                </div>
              )}
            </div>
          </div>
          <div
            className={cn(
              'flex flex-col items-center justify-center min-w-8 h-8 px-1.5 rounded-md text-[11px] font-bold tabular-nums',
              getPriorityTone(priority),
            )}
            title={getPriorityLabel(priority)}
          >
            {priority ?? '–'}
          </div>
        </div>

        {/* Status-Zeile: aktuelle Phase + letzte Bewegung */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <Badge
            variant="outline"
            className="text-[10px] font-normal px-1.5 py-0 h-5 max-w-[60%] truncate border-border/70"
            title={stageLabel}
          >
            {stageLabel}
          </Badge>
          {movedAgo && (
            <span className="flex items-center gap-1 flex-shrink-0" title={`Phase aktualisiert ${movedAgo}`}>
              <Clock className="h-3 w-3" />
              {movedAgo}
            </span>
          )}
        </div>

        {/* Stillstand-Hinweis */}
        {stagnation && (
          <div
            className={cn(
              'flex items-start gap-1.5 rounded-md px-2 py-1.5 text-[11px] leading-snug',
              stagnation.severe
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
            )}
            role="status"
          >
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span className="font-medium">
              {stagnation.label} – nächsten Schritt planen
            </span>
          </div>
        )}

        {/* Owner + ICP */}
        {(lead.owner || icp !== undefined) && (
          <div className="flex items-center gap-2 flex-wrap">
            {lead.owner && (
              <Badge variant="secondary" className="text-[10px] font-normal h-5 px-1.5">
                <User className="h-3 w-3 mr-1" />
                {lead.owner.first_name || lead.owner.full_name || 'Owner'}
              </Badge>
            )}
            {icp !== undefined && icp !== null && (
              <Badge
                variant="outline"
                className="text-[10px] font-normal h-5 px-1.5"
                title={`ICP-Fit: ${icp}%`}
              >
                <Target className="h-3 w-3 mr-1" />
                ICP {icp}%
              </Badge>
            )}
          </div>
        )}

        {/* Mini-CTA-Leiste – Mobile: immer sichtbar, Desktop: full row */}
        <div
          className="flex items-center gap-1 pt-1.5 border-t border-border/60 -mx-1"
          // Drag-Handle auf Card lassen, aber Buttons selbst nicht draggen
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onPointerDown={stop}
        >
          {lead.phone && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[11px] font-normal flex-1 min-w-0 touch-manipulation"
              onClick={stop}
              title={`Anrufen: ${lead.phone}`}
            >
              <a href={`tel:${lead.phone}`} aria-label={`Anrufen ${lead.phone}`}>
                <Phone className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">Anrufen</span>
              </a>
            </Button>
          )}
          {lead.email && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[11px] font-normal flex-1 min-w-0 touch-manipulation"
              onClick={stop}
              title={`E-Mail: ${lead.email}`}
            >
              <a href={`mailto:${lead.email}`} aria-label={`E-Mail an ${lead.email}`}>
                <Mail className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">E-Mail</span>
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[11px] font-normal flex-shrink-0 touch-manipulation"
            onClick={(e) => {
              stop(e);
              setScheduleOpen(true);
            }}
            title="Termin buchen"
            aria-label="Termin buchen"
          >
            <CalendarPlus className="h-3.5 w-3.5 sm:mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">Termin</span>
          </Button>
          {(lastMeeting || lastFollowUpAt) && lead.email && (
            <div
              className={cn(
                'flex items-center flex-shrink-0 rounded-md overflow-hidden',
                isInCooldown
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 px-2 text-[11px] font-medium rounded-none touch-manipulation',
                  isInCooldown
                    ? 'hover:bg-muted/80 text-muted-foreground'
                    : 'hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
                )}
                onClick={(e) => {
                  stop(e);
                  sendFollowUp('confirm');
                }}
                title={
                  isInCooldown
                    ? `Bereits gesendet – noch ${formatCooldown(cooldownRemainingMs)} Cooldown`
                    : 'Follow-up: Bestätigung (Standard)'
                }
                aria-label={
                  isInCooldown
                    ? 'Follow-up bereits gesendet'
                    : 'Follow-up Bestätigung senden'
                }
              >
                {isInCooldown ? (
                  <CheckCircle2 className="h-3.5 w-3.5 sm:mr-1 flex-shrink-0" />
                ) : (
                  <Send className="h-3.5 w-3.5 sm:mr-1 flex-shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {isInCooldown ? 'Bereits gesendet' : 'Follow-up'}
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 px-1 rounded-none border-l touch-manipulation',
                      isInCooldown
                        ? 'border-border/60 hover:bg-muted/80 text-muted-foreground'
                        : 'border-emerald-500/20 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
                    )}
                    onClick={stop}
                    title="Vorlage wählen"
                    aria-label="Follow-up Vorlage wählen"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={stop} className="w-60">
                  <DropdownMenuLabel className="text-[11px]">
                    {isInCooldown
                      ? `Cooldown – noch ${formatCooldown(cooldownRemainingMs)}`
                      : 'Vorlage wählen'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {followUpTemplates.map((tpl) => (
                    <DropdownMenuItem
                      key={tpl.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        sendFollowUp(tpl.id);
                      }}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <span className="text-xs font-medium">{tpl.label}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        {tpl.description}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[11px] font-normal text-primary flex-shrink-0 touch-manipulation md:opacity-70 md:group-hover:opacity-100 md:transition-opacity"
            onClick={(e) => {
              stop(e);
              onClick?.();
            }}
            title="Lead öffnen"
            aria-label="Lead öffnen"
          >
            <span className="hidden xs:inline">Öffnen</span>
            <ArrowUpRight className="h-3.5 w-3.5 xs:ml-0.5" />
          </Button>
        </div>
      </CardContent>

      {/* Termin buchen Dialog – nutzt vorhandene Lead-Kontaktdaten als Kontext */}
      <ScheduleCallDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        leadId={lead.id}
        leadName={fullName}
        onSchedule={handleScheduleSubmit}
        showContextToggle
        defaultAttachContext
      />

      <FollowUpPreviewDialog
        open={!!followUpPreview}
        onOpenChange={(o) => !o && setFollowUpPreview(null)}
        recipient={lead.email}
        label={followUpPreview?.label}
        subject={followUpPreview?.subject ?? ''}
        body={followUpPreview?.body ?? ''}
        isInCooldown={isInCooldown}
        cooldownText={isInCooldown ? formatCooldown(cooldownRemainingMs) : null}
        onConfirm={() => {
          if (!followUpPreview) return;
          const { templateId, variantId } = followUpPreview;
          setFollowUpPreview(null);
          sendFollowUp(templateId, false, variantId);
        }}
      />
    </Card>
  );
}
