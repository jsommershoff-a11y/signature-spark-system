import { useState } from 'react';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { PipelineItemWithLead } from '@/hooks/usePipeline';
import { useCalls } from '@/hooks/useCalls';
import { useActivities } from '@/hooks/useActivities';
import { ScheduleCallDialog } from '@/components/calls/ScheduleCallDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getStageLabel, getPriorityTone, getPriorityLabel } from '@/lib/pipeline-stage';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

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
  const { createCall } = useCalls({ lead_id: lead.id });
  const { createActivity } = useActivities({ lead_id: lead.id });

  // Mini-CTAs ohne Card-Click zu triggern
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const handleScheduleSubmit = async (data: Parameters<typeof createCall>[0]) => {
    try {
      // Lead-Kontext in Notes vorbelegen, wenn leer
      const contextLines = [
        `Lead: ${fullName}`,
        lead.company ? `Firma: ${lead.company}` : null,
        lead.phone ? `Telefon: ${lead.phone}` : null,
        lead.email ? `E-Mail: ${lead.email}` : null,
        `Phase: ${stageLabel}`,
      ].filter(Boolean).join('\n');
      const notes = data.notes && data.notes.trim().length > 0
        ? `${data.notes}\n\n— Kontext —\n${contextLines}`
        : contextLines;

      const created = await createCall({ ...data, notes });
      setLastMeeting({
        scheduledAt: (data as any)?.scheduled_at ?? created?.scheduled_at,
        type: (data as any)?.call_type ?? (created as any)?.call_type,
      });
      toast.success('Termin angelegt', {
        description: `${fullName} – Follow-up jetzt vorbereiten?`,
        action: lead.email
          ? { label: 'Follow-up', onClick: () => sendFollowUp() }
          : undefined,
      });
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

  type FollowUpTemplateId = 'confirm' | 'reschedule' | 'no_show';

  const FOLLOW_UP_TEMPLATES: Array<{
    id: FollowUpTemplateId;
    label: string;
    description: string;
  }> = [
    { id: 'confirm', label: 'Bestätigung', description: 'Termin bestätigen & Agenda teilen' },
    { id: 'reschedule', label: 'Reschedule', description: 'Höflich neuen Termin vorschlagen' },
    { id: 'no_show', label: 'Absage-Folgefrage', description: 'Nach No-Show / Absage nachfassen' },
  ];

  const buildFollowUpContent = (
    templateId: FollowUpTemplateId,
    when: string,
    greetingName: string,
  ): { subject: string; body: string } => {
    const contextLine = lead.company
      ? `Kontext: ${lead.company} – Phase: ${stageLabel}`
      : `Phase: ${stageLabel}`;

    if (templateId === 'reschedule') {
      return {
        subject: `Neuer Termin statt ${when}?`,
        body: [
          `Hallo ${greetingName},`,
          '',
          `bei mir ist kurzfristig etwas dazwischengekommen – ich muss unseren Termin am ${when} leider verschieben.`,
          '',
          'Drei Alternativen, die bei mir passen würden:',
          '• Vorschlag 1: ___',
          '• Vorschlag 2: ___',
          '• Vorschlag 3: ___',
          '',
          'Sag mir kurz, was bei dir am besten passt – oder schick mir gern selbst zwei Slots.',
          '',
          contextLine,
          '',
          'Danke dir & beste Grüße',
        ].join('\n'),
      };
    }

    if (templateId === 'no_show') {
      return {
        subject: `Schade, dass es am ${when} nicht geklappt hat`,
        body: [
          `Hallo ${greetingName},`,
          '',
          `wir hatten ${when} einen Termin – leider konnten wir nicht sprechen.`,
          '',
          'Kurz & ehrlich: Ist das Thema bei dir aktuell noch relevant?',
          '• Ja → ich schick dir gern zwei neue Slots',
          '• Gerade nicht → kein Problem, dann lassen wir es ruhen',
          '• Passt nicht mehr → kurzes „nein danke" reicht völlig',
          '',
          contextLine,
          '',
          'Beste Grüße',
        ].join('\n'),
      };
    }

    // confirm (default)
    return {
      subject: `Bestätigung & nächste Schritte – ${when}`,
      body: [
        `Hallo ${greetingName},`,
        '',
        `vielen Dank für die Zusage zu unserem Termin am ${when}.`,
        '',
        'Damit wir die Zeit optimal nutzen, hier kurz, was dich erwartet:',
        '• Kurze Bestandsaufnahme deiner aktuellen Situation',
        '• Konkrete nächste Schritte für deinen Engpass',
        '• Klare Empfehlung, ob & wie wir zusammenarbeiten',
        '',
        contextLine,
        '',
        'Falls sich etwas ändert, gib mir bitte kurz Bescheid.',
        '',
        'Beste Grüße',
      ].join('\n'),
    };
  };

  const sendFollowUp = (templateId: FollowUpTemplateId = 'confirm') => {
    if (!lead.email) {
      toast.error('Keine E-Mail-Adresse hinterlegt');
      return;
    }
    const greetingName = lead.first_name?.trim() || fullName;
    const when = formatMeetingWhen(lastMeeting?.scheduledAt);
    const tpl = FOLLOW_UP_TEMPLATES.find((t) => t.id === templateId) ?? FOLLOW_UP_TEMPLATES[0];
    const { subject, body } = buildFollowUpContent(templateId, when, greetingName);

    const href = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;

    // Activity loggen (best-effort, blockiert UI nicht)
    createActivity.mutate(
      {
        type: 'email',
        lead_id: lead.id,
        content: `Follow-up "${tpl.label}" vorbereitet an ${lead.email} – Betreff: "${subject}" (Phase: ${stageLabel})`,
      },
      {
        onError: (err) => {
          console.warn('Activity log failed:', err);
        },
      },
    );

    toast.success(`Follow-up vorbereitet: ${tpl.label}`, {
      description: 'E-Mail-Entwurf geöffnet & im Verlauf protokolliert.',
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
          {lastMeeting && lead.email && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-[11px] font-medium flex-shrink-0 touch-manipulation text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15"
              onClick={(e) => {
                stop(e);
                sendFollowUp();
              }}
              title="Follow-up E-Mail mit Termin-Kontext vorbereiten"
              aria-label="Follow-up senden"
            >
              <Send className="h-3.5 w-3.5 sm:mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">Follow-up</span>
            </Button>
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
      />
    </Card>
  );
}
