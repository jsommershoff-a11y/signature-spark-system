import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User as UserIcon,
  Building2,
  Mail,
  Phone,
  Tag,
  CheckSquare,
  PhoneCall,
  CalendarClock,
  FileText,
  Plus,
  ExternalLink,
  Inbox,
  Target,
  Activity as ActivityIcon,
} from 'lucide-react';
import {
  CrmLead,
  PIPELINE_STAGE_LABELS,
  SOURCE_TYPE_LABELS,
} from '@/types/crm';
import { useTasks } from '@/hooks/useTasks';
import { useCalls } from '@/hooks/useCalls';
import { useOffers } from '@/hooks/useOffers';
import { useActivities } from '@/hooks/useActivities';
import { CreateTaskDialog } from './CreateTaskDialog';
import { ScheduleCallDialog } from '@/components/calls/ScheduleCallDialog';
import { CreateOfferDialog } from '@/components/offers/CreateOfferDialog';
import { ActivityFeed } from '@/components/activities/ActivityFeed';
import { StagePlaybookCard } from './StagePlaybookCard';
import { formatCents } from '@/types/offers';

interface LeadDetailSidebarProps {
  lead: CrmLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function fullName(p?: { first_name?: string; last_name?: string; full_name?: string }) {
  if (!p) return null;
  const composed = [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
  return composed || p.full_name || null;
}

function fmtDate(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return format(new Date(iso), 'dd.MM.yyyy HH:mm', { locale: de });
  } catch {
    return null;
  }
}

function fmtRelative(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return formatDistanceToNowStrict(new Date(iso), { locale: de, addSuffix: true });
  } catch {
    return null;
  }
}

export function LeadDetailSidebar({ lead, open, onOpenChange }: LeadDetailSidebarProps) {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [scheduleCallOpen, setScheduleCallOpen] = useState(false);
  const [createOfferOpen, setCreateOfferOpen] = useState(false);

  const { tasks, createTask } = useTasks({ lead_id: lead?.id });
  const { calls, createCall } = useCalls({ lead_id: lead?.id });
  const { offers } = useOffers(lead?.id);
  const { activities } = useActivities({ lead_id: lead?.id });

  const stage = lead?.pipeline_item?.stage ?? 'new_lead';

  const nextTask = useMemo(
    () =>
      (tasks ?? [])
        .filter((t) => t.status === 'open')
        .sort((a, b) => {
          const ad = a.due_at ? new Date(a.due_at).getTime() : Infinity;
          const bd = b.due_at ? new Date(b.due_at).getTime() : Infinity;
          return ad - bd;
        })[0],
    [tasks],
  );

  const lastCall = useMemo(
    () =>
      (calls ?? [])
        .filter((c) => c.started_at || c.ended_at)
        .sort((a, b) => {
          const ad = new Date(a.ended_at || a.started_at || a.created_at).getTime();
          const bd = new Date(b.ended_at || b.started_at || b.created_at).getTime();
          return bd - ad;
        })[0],
    [calls],
  );

  const upcomingCall = useMemo(() => {
    const now = Date.now();
    return (calls ?? [])
      .filter((c) => c.scheduled_at && new Date(c.scheduled_at).getTime() > now)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())[0];
  }, [calls]);

  const lastActivity = activities?.[0];

  const totalOfferValue = useMemo(
    () =>
      (offers ?? []).reduce((acc, o) => {
        const t = (o.offer_json as { total_cents?: number } | undefined)?.total_cents ?? 0;
        return acc + t;
      }, 0),
    [offers],
  );

  if (!lead) return null;
  const ownerLabel = fullName(lead.owner) ?? 'Kein Owner';
  const sourceLabel = SOURCE_TYPE_LABELS[lead.source_type] ?? lead.source_type;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {lead.first_name} {lead.last_name ?? ''}
            </SheetTitle>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {lead.company && (
                <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {lead.company}
                </span>
              )}
              <Badge variant="default">{PIPELINE_STAGE_LABELS[stage]}</Badge>
              <Badge variant="outline" className="gap-1">
                <UserIcon className="h-3 w-3" />
                {ownerLabel}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Tag className="h-3 w-3" />
                {sourceLabel}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Mail className="h-3 w-3" />
                  {lead.email}
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </a>
              )}
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-5 space-y-4">
              {/* Nächste Aktion */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    Nächste Aktion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {nextTask ? (
                    <>
                      <p className="font-medium">{nextTask.title}</p>
                      {nextTask.description && (
                        <p className="text-muted-foreground text-xs">{nextTask.description}</p>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {nextTask.due_at
                            ? `Fällig ${fmtRelative(nextTask.due_at)}`
                            : 'Kein Fälligkeitsdatum'}
                        </span>
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/app/crm?task=${nextTask.id}`}>
                            Aufgabe öffnen
                          </Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">Keine offene Aufgabe für diesen Lead.</p>
                  )}
                  <Button size="sm" variant="default" className="w-full gap-1.5" onClick={() => setCreateTaskOpen(true)}>
                    <Plus className="h-3.5 w-3.5" />
                    Neue Aufgabe
                  </Button>
                </CardContent>
              </Card>

              {/* Kommunikation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PhoneCall className="h-4 w-4 text-primary" />
                    Kommunikation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row
                    label="Letzter Kontakt"
                    value={
                      lastActivity
                        ? `${lastActivity.type} · ${fmtRelative(lastActivity.created_at)}`
                        : null
                    }
                    fallback="Noch kein Kontakt erfasst"
                  />
                  <Row
                    label="Letzter Call"
                    value={
                      lastCall
                        ? `${fmtDate(lastCall.ended_at || lastCall.started_at)}${lastCall.status ? ` · ${lastCall.status}` : ''}`
                        : null
                    }
                    fallback="Noch kein Call durchgeführt"
                  />
                  <Row
                    label="Geplanter Termin"
                    value={upcomingCall ? fmtDate(upcomingCall.scheduled_at) : null}
                    fallback="Kein Termin geplant"
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setScheduleCallOpen(true)}>
                      <CalendarClock className="h-3.5 w-3.5" />
                      Termin planen
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="gap-1.5">
                      <Link to="/app/inbox">
                        <Inbox className="h-3.5 w-3.5" />
                        Inbox öffnen
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sales-Skript */}
              <StagePlaybookCard stage={stage} />

              {/* Angebot / Analyse */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-primary" />
                    Angebot &amp; Analyse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row
                    label="Analyse vorhanden"
                    value={lead.icp_fit_score != null ? `Ja (Fit ${lead.icp_fit_score}%)` : 'Nein'}
                  />
                  <Row
                    label="Angebot vorhanden"
                    value={offers.length > 0 ? `Ja · ${offers.length} ${offers.length === 1 ? 'Angebot' : 'Angebote'}` : 'Nein'}
                  />
                  {offers.length > 0 && (
                    <Row label="Angebotsvolumen" value={formatCents(totalOfferValue)} />
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {offers.length > 0 ? (
                      <Button asChild size="sm" variant="outline" className="gap-1.5">
                        <Link to={`/app/offers?lead=${lead.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Angebote öffnen
                        </Link>
                      </Button>
                    ) : null}
                    <Button size="sm" variant="default" className="gap-1.5" onClick={() => setCreateOfferOpen(true)}>
                      <Plus className="h-3.5 w-3.5" />
                      Angebot erstellen
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Historie */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ActivityIcon className="h-4 w-4 text-primary" />
                    Historie
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {activities && activities.length > 0 ? (
                    <ActivityFeed leadId={lead.id} />
                  ) : (
                    <p className="text-muted-foreground">Noch keine Aktivitäten erfasst.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onSubmit={async (data) => {
          await createTask(data);
          setCreateTaskOpen(false);
        }}
        leadId={lead.id}
      />

      <ScheduleCallDialog
        open={scheduleCallOpen}
        onOpenChange={setScheduleCallOpen}
        onSchedule={async (data) => {
          await createCall(data);
          setScheduleCallOpen(false);
        }}
        leadId={lead.id}
      />

      <CreateOfferDialog open={createOfferOpen} onOpenChange={setCreateOfferOpen} />
    </>
  );
}

function Row({ label, value, fallback }: { label: string; value?: string | null; fallback?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-right">
        {value ?? <span className="text-muted-foreground italic">{fallback ?? '—'}</span>}
      </span>
    </div>
  );
}
