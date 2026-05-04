import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Mail, Phone, Building2, User, Activity, FileText, CheckSquare,
  CalendarClock, Compass, FolderOpen, Send, Plus, ExternalLink, Inbox, Target,
  TrendingUp, MapPin,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { resolveNextStep } from '@/lib/next-step';
import { NextStepCell } from '@/components/crm/NextStepCell';
import { QuickAddTaskDialog } from '@/components/crm/QuickAddTaskDialog';
import { isRouteAvailable } from '@/lib/route-availability';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Rendert einen Button mit Link nur, wenn die Zielroute existiert.
 * Andernfalls: Button wird deaktiviert mit Tooltip-Hinweis.
 * `hideIfMissing` versteckt den Button stattdessen komplett.
 */
function RouteAwareLinkButton({
  to,
  children,
  hideIfMissing = false,
  size = 'sm',
  variant = 'outline',
}: {
  to: string;
  children: React.ReactNode;
  hideIfMissing?: boolean;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
}) {
  const available = isRouteAvailable(to);
  if (!available && hideIfMissing) return null;
  if (!available) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button size={size} variant={variant} disabled aria-disabled="true">
                {children}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Diese Seite ist aktuell nicht verfügbar</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return (
    <Button asChild size={size} variant={variant}>
      <Link to={to}>{children}</Link>
    </Button>
  );
}

type Detail = {
  id: string;
  source: 'profile' | 'crm_lead';
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  assigned_staff_name: string | null;
  record_status: string;
  created_at: string;
};

type ActivityRow = {
  id: string;
  type: string | null;
  content: string | null;
  metadata: any;
  created_at: string;
};

type TaskRow = {
  id: string;
  title: string | null;
  description: string | null;
  due_at: string | null;
  status: string | null;
  type: string | null;
};

type CallRow = {
  id: string;
  call_type: string | null;
  provider: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  status: string | null;
  notes: string | null;
};

type OfferRow = {
  id: string;
  status: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  offer_json: any;
  public_token: string | null;
  created_at: string;
};

type CrmExtras = {
  source_type: string | null;
  source_detail: string | null;
  icp_fit_score: number | null;
  icp_fit_reason: string | null;
  industry: string | null;
  location: string | null;
  status: string | null;
  notes: string | null;
  enrichment_json: any;
};

const fmtDateTime = (iso: string | null) =>
  iso ? format(new Date(iso), "dd.MM.yyyy 'um' HH:mm 'Uhr'", { locale: de }) : null;

const fmtDate = (iso: string | null) =>
  iso ? format(new Date(iso), 'dd.MM.yyyy', { locale: de }) : null;

const fmtCurrency = (n: number | null | undefined) =>
  typeof n === 'number'
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
    : null;

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Detail | null>(null);
  const [extras, setExtras] = useState<CrmExtras | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [pipelineItemStage, setPipelineItemStage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: rows, error } = await supabase.rpc('get_customers', {
          _include_deleted: true,
          _status_filter: null,
        });
        if (error) throw error;
        const row = (rows ?? []).find((r: any) => r.id === id) as Detail | undefined;
        if (cancelled) return;
        setData(row ?? null);
        if (!row) return;

        // Parallel fetch of related data — alle best-effort, Fehler werden geloggt.
        const queries: any[] = [];

        // CRM extras (nur wenn crm_lead)
        if (row.source === 'crm_lead') {
          queries.push(
            supabase
              .from('crm_leads')
              .select('source_type, source_detail, icp_fit_score, icp_fit_reason, industry, location, status, notes, enrichment_json')
              .eq('id', row.id)
              .maybeSingle(),
          );
        } else {
          queries.push(Promise.resolve({ data: null }));
        }

        // Activities (lead_id ODER customer_id)
        const actCol = row.source === 'crm_lead' ? 'lead_id' : 'customer_id';
        queries.push(
          supabase
            .from('activities')
            .select('id, type, content, metadata, created_at')
            .eq(actCol, row.id)
            .order('created_at', { ascending: false })
            .limit(50),
        );

        // Tasks
        const taskCol = row.source === 'crm_lead' ? 'lead_id' : 'member_id';
        queries.push(
          supabase
            .from('crm_tasks')
            .select('id, title, description, due_at, status, type')
            .eq(taskCol, row.id)
            .order('due_at', { ascending: true, nullsFirst: false })
            .limit(50),
        );

        // Calls (nur lead_id)
        if (row.source === 'crm_lead') {
          queries.push(
            supabase
              .from('calls')
              .select('id, call_type, provider, scheduled_at, started_at, ended_at, duration_seconds, status, notes')
              .eq('lead_id', row.id)
              .order('scheduled_at', { ascending: false, nullsFirst: false })
              .limit(50),
          );
        } else {
          queries.push(Promise.resolve({ data: [] }));
        }

        // Offers (nur lead_id, legacy-Bezug zu leads.id; best-effort)
        if (row.source === 'crm_lead') {
          queries.push(
            supabase
              .from('offers')
              .select('id, status, sent_at, viewed_at, offer_json, public_token, created_at')
              .eq('lead_id', row.id)
              .order('created_at', { ascending: false })
              .limit(20),
          );
        } else {
          queries.push(Promise.resolve({ data: [] }));
        }

        // Pipeline-Item (nur lead_id) — liefert echten pipeline_stage
        if (row.source === 'crm_lead') {
          queries.push(
            supabase
              .from('pipeline_items')
              .select('stage')
              .eq('lead_id', row.id)
              .maybeSingle(),
          );
        } else {
          queries.push(Promise.resolve({ data: null }));
        }

        const [extrasRes, actRes, taskRes, callRes, offerRes, pipelineRes] = await Promise.all(queries);
        if (cancelled) return;

        setExtras((extrasRes?.data as CrmExtras) ?? null);
        setActivities((actRes?.data as ActivityRow[]) ?? []);
        setTasks((taskRes?.data as TaskRow[]) ?? []);
        setCalls((callRes?.data as CallRow[]) ?? []);
        setOffers((offerRes?.data as OfferRow[]) ?? []);
        setPipelineItemStage(((pipelineRes?.data as any)?.stage as string) ?? null);
      } catch (e: any) {
        toast.error(e?.message ?? 'Datensatz konnte nicht geladen werden.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, reloadKey]);

  const displayName = (d: Detail) =>
    d.full_name || `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() || d.email || '—';

  // === Derived: Kommunikations-Snapshot ===
  const lastEmail = useMemo(
    () => activities.find(a => (a.type ?? '').toLowerCase().includes('email')),
    [activities],
  );
  const lastCall = useMemo(
    () => calls.find(c => c.ended_at) || calls[0],
    [calls],
  );
  const lastMeeting = useMemo(
    () => calls.find(c => c.scheduled_at && (c.call_type ?? '').toLowerCase() !== 'phone'),
    [calls],
  );
  const lastActivity = activities[0];

  // === Tasks Buckets ===
  const now = new Date();
  const openTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'completed');
  const overdueTasks = openTasks.filter(t => t.due_at && new Date(t.due_at) < now);
  const doneTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed');

  // === Termine ===
  const upcomingCall = calls
    .filter(c => c.scheduled_at && new Date(c.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())[0];
  const pastCalls = calls.filter(c => c.scheduled_at && new Date(c.scheduled_at) < now).slice(0, 5);

  // === Tracking ===
  const utm = (extras?.enrichment_json as any)?.utm ?? null;
  const visits = (extras?.enrichment_json as any)?.website_visits ?? null;
  const docOpens = (extras?.enrichment_json as any)?.document_opens ?? null;

  // === Pipeline ===
  const pipelineStage = pipelineItemStage ?? extras?.status ?? data?.record_status ?? null;
  const stageHistory = activities.filter(a => (a.type ?? '').toLowerCase().includes('stage'));
  const lostReason = (extras?.enrichment_json as any)?.lost_reason ?? null;
  const nextStepInfo = useMemo(() => resolveNextStep({
    tasks: openTasks.map(t => ({
      title: t.title, due_at: t.due_at, status: t.status, type: t.type,
    })),
    stage: pipelineItemStage,
    ownerName: data?.assigned_staff_name,
  }), [openTasks, pipelineItemStage, data?.assigned_staff_name]);
  const nextStep = nextStepInfo.label;

  // === Abschlussnähe (icp_fit_score als Proxy) ===
  const closeness = extras?.icp_fit_score ?? null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Zurück
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardHeader><Skeleton className="h-7 w-64" /></CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </CardContent>
        </Card>
      ) : !data ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Datensatz nicht gefunden oder kein Zugriff.
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/app/customers">Zurück zur Übersicht</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* === 1. Kopfbereich === */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2 min-w-0">
                  <CardTitle className="text-2xl truncate">
                    {data.company || displayName(data)}
                  </CardTitle>
                  {data.company && (
                    <div className="text-sm text-muted-foreground">
                      Ansprechpartner: <span className="font-medium text-foreground">{displayName(data)}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline">{pipelineStage ?? data.record_status}</Badge>
                    <Badge variant="secondary">
                      Quelle: {data.source === 'profile' ? 'Mitglied' : (extras?.source_type ?? 'CRM')}
                    </Badge>
                    <Badge variant="secondary">
                      Verantwortlich: {data.assigned_staff_name ?? 'Jan (Standard)'}
                    </Badge>
                    {typeof closeness === 'number' && (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        <Target className="h-3 w-3 mr-1" />
                        Fit / Abschlussnähe: {closeness}/100
                      </Badge>
                    )}
                    {extras?.industry && (
                      <Badge variant="outline">{extras.industry}</Badge>
                    )}
                    {extras?.location && (
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />{extras.location}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <InfoRow icon={<Mail className="h-4 w-4" />} label="E-Mail" value={data.email} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Telefon" value={data.phone} />
              <InfoRow icon={<Building2 className="h-4 w-4" />} label="Firma" value={data.company} />
              <InfoRow icon={<User className="h-4 w-4" />} label="Zugewiesen" value={data.assigned_staff_name ?? 'Jan (Standard)'} />
              <div className="sm:col-span-2">
                <NextStepCell info={nextStepInfo} variant="detail" />
              </div>
            </CardContent>
          </Card>

          {/* === Cockpit: Quick-Links === */}
          {/*
            Routen werden via isRouteAvailable() geprüft. Fehlt eine Ziel-Route
            im Router, wird der Button automatisch deaktiviert (mit Tooltip)
            bzw. versteckt (hideIfMissing).
          */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-2">
                <RouteAwareLinkButton to={`/app/inbox?customer=${data.id}`} variant="outline">
                  <Inbox className="h-3.5 w-3.5 mr-1.5" />Kommunikation öffnen
                </RouteAwareLinkButton>
                <RouteAwareLinkButton to={`/app/offers?customer=${data.id}`} variant="outline">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />Angebote anzeigen
                </RouteAwareLinkButton>
                <RouteAwareLinkButton to={`/app/offers?customer=${data.id}&action=create`} variant="default">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />Angebot erstellen
                </RouteAwareLinkButton>
                <RouteAwareLinkButton to={`/app/tasks?customer=${data.id}`} variant="outline">
                  <CheckSquare className="h-3.5 w-3.5 mr-1.5" />Aufgaben anzeigen
                </RouteAwareLinkButton>
                <Button size="sm" variant="default" onClick={() => setQuickAddOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />Aufgabe erstellen
                </Button>
                {data.source === 'crm_lead' && (
                  <RouteAwareLinkButton
                    to={`/app/pipeline?lead=${data.id}`}
                    variant="outline"
                    hideIfMissing
                  >
                    <TrendingUp className="h-3.5 w-3.5 mr-1.5" />In Pipeline öffnen
                  </RouteAwareLinkButton>
                )}
              </div>
            </CardContent>
          </Card>

          {/* === Grid für Sektionen 2-8 === */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 2. Kommunikation */}
            <SectionCard icon={<Inbox className="h-4 w-4" />} title="Kommunikation">
              {!lastEmail && !lastCall && !lastMeeting && !lastActivity ? (
                <Empty>Noch keine Kommunikation erfasst</Empty>
              ) : (
                <div className="space-y-3 text-sm">
                  <Line label="Letzte E-Mail" value={lastEmail ? `${truncate(lastEmail.content)} · ${fmtDateTime(lastEmail.created_at)}` : null} />
                  <Line label="Letzter Call" value={lastCall ? `${lastCall.call_type ?? 'Call'} · ${fmtDateTime(lastCall.started_at ?? lastCall.scheduled_at)}` : null} />
                  <Line label="Letzter Termin" value={lastMeeting ? `${lastMeeting.provider ?? lastMeeting.call_type ?? 'Termin'} · ${fmtDateTime(lastMeeting.scheduled_at)}` : null} />
                  <Line label="Letzte Aktivität" value={lastActivity ? `${lastActivity.type ?? '—'} · ${fmtDateTime(lastActivity.created_at)}` : null} />
                </div>
              )}
              <div className="mt-4 pt-3 border-t flex flex-wrap gap-2">
                <RouteAwareLinkButton to={`/app/inbox?customer=${data.id}`} variant="outline">
                  <Mail className="h-3.5 w-3.5 mr-1.5" />Inbox öffnen
                </RouteAwareLinkButton>
              </div>
            </SectionCard>

            {/* 3. Pipeline-Verlauf */}
            <SectionCard icon={<TrendingUp className="h-4 w-4" />} title="Pipeline-Verlauf">
              <div className="space-y-3 text-sm">
                <Line label="Aktuelle Stufe" value={pipelineStage} />
                <Line label="Nächster Schritt" value={nextStep} />
                {lostReason && <Line label="Verlustgrund" value={lostReason} />}
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Statuswechsel</div>
                  {stageHistory.length === 0 ? (
                    <Empty>Keine Statuswechsel erfasst</Empty>
                  ) : (
                    <ul className="space-y-1.5">
                      {stageHistory.slice(0, 6).map(s => (
                        <li key={s.id} className="flex items-center gap-2 text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{fmtDateTime(s.created_at)}</span>
                          <span>{truncate(s.content, 60)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* 4. Angebote */}
            <SectionCard
              icon={<FileText className="h-4 w-4" />}
              title="Angebote"
              action={
                <RouteAwareLinkButton to={`/app/offers?customer=${data.id}&action=create`} variant="outline">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />Angebot erstellen
                </RouteAwareLinkButton>
              }
            >
              {offers.length === 0 ? (
                <Empty>Noch keine Angebote</Empty>
              ) : (
                <ul className="space-y-2">
                  {offers.map(o => {
                    const value = (o.offer_json as any)?.total_value ?? (o.offer_json as any)?.amount ?? null;
                    return (
                      <li key={o.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card/40 p-3 text-sm">
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {(o.offer_json as any)?.title ?? `Angebot vom ${fmtDate(o.created_at)}`}
                          </div>
                          <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px]">{o.status ?? 'draft'}</Badge>
                            {fmtCurrency(value) && <span>{fmtCurrency(value)}</span>}
                            {o.sent_at && <span>· Gesendet {fmtDate(o.sent_at)}</span>}
                          </div>
                        </div>
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/app/offers?id=${o.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SectionCard>

            {/* 5. Aufgaben */}
            <SectionCard
              icon={<CheckSquare className="h-4 w-4" />}
              title="Aufgaben"
              action={
                <Button size="sm" variant="outline" onClick={() => setQuickAddOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />Aufgabe
                </Button>
              }
            >
              <div className="grid grid-cols-3 gap-2 mb-3">
                <Stat label="Offen" value={openTasks.length} />
                <Stat label="Fällig" value={overdueTasks.length} tone={overdueTasks.length > 0 ? 'warn' : undefined} />
                <Stat label="Erledigt" value={doneTasks.length} />
              </div>
              {openTasks.length === 0 ? (
                <Empty>Keine offenen Aufgaben</Empty>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {openTasks.slice(0, 5).map(t => (
                    <li key={t.id} className="flex items-center justify-between gap-2 rounded border bg-card/40 px-3 py-2">
                      <span className="truncate">{t.title ?? '(ohne Titel)'}</span>
                      {t.due_at && (
                        <span className={`text-xs shrink-0 ${new Date(t.due_at) < now ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {fmtDate(t.due_at)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            {/* 6. Termine */}
            <SectionCard icon={<CalendarClock className="h-4 w-4" />} title="Termine">
              {!upcomingCall && pastCalls.length === 0 ? (
                <Empty>Kein Termin geplant</Empty>
              ) : (
                <div className="space-y-3 text-sm">
                  {upcomingCall ? (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Nächster Termin</div>
                      <div className="font-medium">{fmtDateTime(upcomingCall.scheduled_at)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {labelCallType(upcomingCall.call_type, upcomingCall.provider)}
                      </div>
                    </div>
                  ) : (
                    <Empty>Kein zukünftiger Termin</Empty>
                  )}
                  {pastCalls.length > 0 && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Vergangen</div>
                      <ul className="space-y-1.5">
                        {pastCalls.map(c => (
                          <li key={c.id} className="flex items-center justify-between text-xs rounded border bg-card/40 px-2.5 py-1.5">
                            <span>{labelCallType(c.call_type, c.provider)}</span>
                            <span className="text-muted-foreground">{fmtDate(c.scheduled_at)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* 7. Tracking & Herkunft */}
            <SectionCard icon={<Compass className="h-4 w-4" />} title="Tracking & Herkunft">
              <div className="space-y-3 text-sm">
                <Line label="Quelle" value={extras?.source_type ?? (data.source === 'profile' ? 'Mitglied' : null)} />
                <Line label="Detail" value={extras?.source_detail ?? null} />
                <Line label="Kampagne" value={utm?.campaign ?? null} />
                <Line
                  label="UTM"
                  value={utm ? [utm.source, utm.medium, utm.term].filter(Boolean).join(' · ') || null : null}
                />
                <Line label="Websitebesuche" value={typeof visits === 'number' ? `${visits}` : null} />
                <Line label="Dokument-Öffnungen" value={typeof docOpens === 'number' ? `${docOpens}` : null} />
                {!extras?.source_type && !utm && !visits && !docOpens && (
                  <Empty>Keine Tracking-Daten verfügbar</Empty>
                )}
              </div>
            </SectionCard>

            {/* 8. Dokumente */}
            <SectionCard icon={<FolderOpen className="h-4 w-4" />} title="Dokumente">
              <DocumentsList offers={offers} />
            </SectionCard>

            {/* Aktivitäten-Timeline (volle Breite mobil, eine Spalte desktop) */}
            <SectionCard icon={<Activity className="h-4 w-4" />} title="Letzte Aktivitäten" className="lg:col-span-2">
              {activities.length === 0 ? (
                <Empty>Noch keine Aktivitäten erfasst</Empty>
              ) : (
                <ul className="space-y-2 text-sm">
                  {activities.slice(0, 10).map(a => (
                    <li key={a.id} className="flex items-start gap-3 rounded border bg-card/40 px-3 py-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{a.type ?? 'aktivität'}</span>
                          <span>·</span>
                          <span>{fmtDateTime(a.created_at)}</span>
                        </div>
                        {a.content && <div className="mt-0.5 text-foreground">{truncate(a.content, 200)}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <QuickAddTaskDialog
            open={quickAddOpen}
            onOpenChange={setQuickAddOpen}
            targetId={data.id}
            targetSource={data.source}
            onCreated={() => setReloadKey(k => k + 1)}
          />
        </>
      )}
    </div>
  );
}

// ============= Helpers =============

function truncate(s: string | null | undefined, n = 80) {
  if (!s) return '';
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

function labelCallType(type: string | null, provider: string | null) {
  const t = (type ?? '').toLowerCase();
  if (t.includes('phone') || t === 'call') return 'Telefon';
  if (t.includes('zoom') || provider?.toLowerCase() === 'zoom') return 'Zoom';
  if (t.includes('meet') || provider?.toLowerCase() === 'google_meet') return 'Google Meet';
  if (t.includes('live')) return 'Live Call';
  return type ?? provider ?? 'Termin';
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card/40 p-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="truncate font-medium">{value ?? '—'}</div>
      </div>
    </div>
  );
}

function SectionCard({
  icon, title, action, children, className,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <span className="text-primary">{icon}</span>
            <span className="text-foreground">{title}</span>
          </CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Line({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right truncate">{value || '—'}</span>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-muted-foreground italic py-2">{children}</div>;
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'warn' }) {
  return (
    <div className={`rounded-lg border p-2 text-center ${tone === 'warn' && value > 0 ? 'border-destructive/40 bg-destructive/5' : 'bg-card/40'}`}>
      <div className={`text-lg font-semibold ${tone === 'warn' && value > 0 ? 'text-destructive' : ''}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function DocumentsList({ offers }: { offers: OfferRow[] }) {
  // Aktuell sind nur Angebote als „Dokumente" real angebunden.
  // Verträge/Rechnungen/Briefpost-Bezug zum CRM-Datensatz sind im Schema noch nicht verknüpft → Fallback.
  if (offers.length === 0) {
    return <div className="text-xs text-muted-foreground italic py-2">Noch keine Dokumente hinterlegt</div>;
  }
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">Angebote</div>
        <ul className="space-y-1.5">
          {offers.map(o => (
            <li key={o.id} className="flex items-center justify-between text-sm rounded border bg-card/40 px-3 py-1.5">
              <span className="truncate">
                {(o.offer_json as any)?.title ?? `Angebot ${o.id.slice(0, 8)}`}
              </span>
              <Badge variant="outline" className="text-[10px]">{o.status ?? 'draft'}</Badge>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-xs text-muted-foreground italic">
        Verträge, Rechnungen, Briefpost: noch nicht verknüpft.
      </div>
    </div>
  );
}
