import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PipelineColumn } from './PipelineColumn';
import { PipelineHeatmap } from './PipelineHeatmap';
import {
  PipelineFilters,
  EMPTY_FILTER,
  getIcpBand,
  countActiveFilters,
  type PipelineFilterValue,
  type OwnerOption,
} from './PipelineFilters';
import { PipelineData, PipelineItemWithLead } from '@/hooks/usePipeline';
import { useTasks } from '@/hooks/useTasks';
import { getPriorityTier } from '@/lib/pipeline-stage';
import { supabase } from '@/integrations/supabase/client';
import {
  PipelineStage,
  PipelineGroup,
  LeadSourceType,
  PIPELINE_GROUP_LABELS,
  PIPELINE_GROUP_HINTS,
  PIPELINE_GROUP_STAGES,
} from '@/types/crm';

interface PipelineBoardProps {
  pipelineByStage: PipelineData;
  loading?: boolean;
  onItemClick?: (item: PipelineItemWithLead) => void;
  onStageChange?: (itemId: string, stage: PipelineStage) => void;
}

const STAGE_ORDER: PipelineStage[] = [
  'new_lead',
  'setter_call_scheduled',
  'setter_call_done',
  'analysis_ready',
  'offer_draft',
  'offer_sent',
  'payment_unlocked',
  'won',
  'lost',
];

const GROUP_ORDER: PipelineGroup[] = ['active', 'setter', 'closer', 'archive', 'all'];

const STORAGE_KEY = 'crm.pipeline.group';
const STORAGE_KEY_STATE = 'crm.pipeline.state.v1';
const DEFAULT_GROUP: PipelineGroup = 'active';

interface PersistedState {
  search?: string;
  stageFilter?: PipelineStage | null;
  filters?: PipelineFilterValue;
}

function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedState;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function isGroup(value: string | null): value is PipelineGroup {
  return value === 'all' || value === 'active' || value === 'setter' || value === 'closer' || value === 'archive';
}

function matchesSearch(item: PipelineItemWithLead, q: string): boolean {
  if (!q) return true;
  const lead = item.lead;
  if (!lead) return false;
  const haystack = [
    lead.first_name,
    lead.last_name,
    lead.company,
    lead.email,
    lead.phone,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function getDateRangeBounds(
  range: PipelineFilterValue['dateRange'],
  customFrom?: string,
  customTo?: string,
): { from: Date | null; to: Date | null } {
  const now = new Date();
  if (range === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { from: start, to: end };
  }
  if (range === 'week') {
    const start = new Date(now);
    const day = (start.getDay() + 6) % 7; // Montag = 0
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { from: start, to: end };
  }
  if (range === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { from: start, to: end };
  }
  if (range === 'custom') {
    return {
      from: customFrom ? new Date(customFrom) : null,
      to: customTo ? new Date(`${customTo}T23:59:59`) : null,
    };
  }
  return { from: null, to: null };
}

// ---------- URL <-> State Sync ----------

const URL_KEYS = {
  group: 'g',
  search: 'q',
  stage: 'stage',
  priorities: 'pri',
  owners: 'own',
  icpBands: 'icp',
  stages: 'st',
  sources: 'src',
  overdue: 'od',
  hasOffer: 'off',
  hasAppointment: 'apt',
  dateRange: 'dr',
  customFrom: 'df',
  customTo: 'dt',
} as const;

function csvSet<T extends string>(value: string | null, allowed: readonly T[] | null): T[] {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter((v): v is T => v.length > 0 && (!allowed || (allowed as readonly string[]).includes(v))) as T[];
}

function paramOr<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function readStateFromParams(sp: URLSearchParams): {
  group: PipelineGroup | null;
  search: string;
  stageFilter: PipelineStage | null;
  filters: PipelineFilterValue;
} {
  const groupRaw = sp.get(URL_KEYS.group);
  const stageRaw = sp.get(URL_KEYS.stage);
  const stageAllowed = STAGE_ORDER as readonly PipelineStage[];
  const stageFilter =
    stageRaw && (stageAllowed as readonly string[]).includes(stageRaw)
      ? (stageRaw as PipelineStage)
      : null;

  const filters: PipelineFilterValue = {
    ...EMPTY_FILTER,
    priorities: csvSet<'high' | 'medium' | 'low'>(
      sp.get(URL_KEYS.priorities),
      ['high', 'medium', 'low'],
    ),
    owners: csvSet<string>(sp.get(URL_KEYS.owners), null),
    icpBands: csvSet<'high' | 'medium' | 'low' | 'none'>(
      sp.get(URL_KEYS.icpBands),
      ['high', 'medium', 'low', 'none'],
    ),
    stages: csvSet<PipelineStage>(sp.get(URL_KEYS.stages), stageAllowed),
    sources: csvSet<LeadSourceType>(sp.get(URL_KEYS.sources), null),
    overdue: paramOr(sp.get(URL_KEYS.overdue), ['all', 'overdue', 'on_track'] as const, 'all'),
    hasOffer: paramOr(sp.get(URL_KEYS.hasOffer), ['all', 'with', 'without'] as const, 'all'),
    hasAppointment: paramOr(
      sp.get(URL_KEYS.hasAppointment),
      ['all', 'with', 'without'] as const,
      'all',
    ),
    dateRange: paramOr(
      sp.get(URL_KEYS.dateRange),
      ['all', 'today', 'week', 'month', 'custom'] as const,
      'all',
    ),
    customFrom: sp.get(URL_KEYS.customFrom) || undefined,
    customTo: sp.get(URL_KEYS.customTo) || undefined,
  };

  return {
    group: isGroup(groupRaw) ? groupRaw : null,
    search: sp.get(URL_KEYS.search) ?? '',
    stageFilter,
    filters,
  };
}

function writeStateToParams(
  current: URLSearchParams,
  state: {
    group: PipelineGroup;
    search: string;
    stageFilter: PipelineStage | null;
    filters: PipelineFilterValue;
  },
): URLSearchParams {
  const next = new URLSearchParams(current);
  const set = (key: string, value: string | null | undefined) => {
    if (value && value.length > 0) next.set(key, value);
    else next.delete(key);
  };

  set(URL_KEYS.group, state.group !== DEFAULT_GROUP ? state.group : null);
  set(URL_KEYS.search, state.search.trim() || null);
  set(URL_KEYS.stage, state.stageFilter ?? null);

  const f = state.filters;
  set(URL_KEYS.priorities, f.priorities.join(',') || null);
  set(URL_KEYS.owners, f.owners.join(',') || null);
  set(URL_KEYS.icpBands, f.icpBands.join(',') || null);
  set(URL_KEYS.stages, f.stages.join(',') || null);
  set(URL_KEYS.sources, f.sources.join(',') || null);
  set(URL_KEYS.overdue, f.overdue !== 'all' ? f.overdue : null);
  set(URL_KEYS.hasOffer, f.hasOffer !== 'all' ? f.hasOffer : null);
  set(URL_KEYS.hasAppointment, f.hasAppointment !== 'all' ? f.hasAppointment : null);
  set(URL_KEYS.dateRange, f.dateRange !== 'all' ? f.dateRange : null);
  set(URL_KEYS.customFrom, f.customFrom ?? null);
  set(URL_KEYS.customTo, f.customTo ?? null);

  return next;
}

export function PipelineBoard({
  pipelineByStage,
  loading,
  onItemClick,
  onStageChange,
}: PipelineBoardProps) {
  const [group, setGroup] = useState<PipelineGroup>(DEFAULT_GROUP);
  const [search, setSearch] = useState<string>(() => loadPersistedState().search ?? '');
  const [stageFilter, setStageFilter] = useState<PipelineStage | null>(
    () => loadPersistedState().stageFilter ?? null,
  );
  const [filters, setFilters] = useState<PipelineFilterValue>(
    () => ({ ...EMPTY_FILTER, ...(loadPersistedState().filters ?? {}) }),
  );

  // Aufgaben (für Überfälligkeitsfilter)
  const { tasks } = useTasks();

  // Auswahl beim Mount aus localStorage laden
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isGroup(stored)) setGroup(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, group);
    } catch {
      /* ignore */
    }
  }, [group]);

  // Suche, Stage- und Filter-Auswahl persistieren
  useEffect(() => {
    try {
      const payload: PersistedState = { search, stageFilter, filters };
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [search, stageFilter, filters]);

  const activeStages = useMemo<Set<PipelineStage>>(() => {
    if (stageFilter) return new Set<PipelineStage>([stageFilter]);
    if (group === 'all') return new Set(STAGE_ORDER);
    return new Set(PIPELINE_GROUP_STAGES[group]);
  }, [group, stageFilter]);

  const normalizedSearch = search.trim().toLowerCase();

  // Owner-Optionen aus aktuellen Pipeline-Daten ableiten
  const ownerOptions = useMemo<OwnerOption[]>(() => {
    const map = new Map<string, string>();
    for (const stage of STAGE_ORDER) {
      for (const item of pipelineByStage[stage] || []) {
        const owner = item.lead?.owner;
        if (owner?.id) {
          const label =
            [owner.first_name, owner.last_name].filter(Boolean).join(' ').trim() ||
            owner.full_name ||
            'Unbekannt';
          if (!map.has(owner.id)) map.set(owner.id, label);
        }
      }
    }
    return Array.from(map, ([id, label]) => ({ id, label })).sort((a, b) =>
      a.label.localeCompare(b.label, 'de'),
    );
  }, [pipelineByStage]);

  // Quellen aus aktuell geladenen Items
  const sourceOptions = useMemo<LeadSourceType[]>(() => {
    const set = new Set<LeadSourceType>();
    for (const stage of STAGE_ORDER) {
      for (const item of pipelineByStage[stage] || []) {
        if (item.lead?.source_type) set.add(item.lead.source_type);
      }
    }
    return Array.from(set).sort();
  }, [pipelineByStage]);

  // Lead-IDs der aktuell geladenen Items
  const allLeadIds = useMemo(() => {
    const ids: string[] = [];
    for (const stage of STAGE_ORDER) {
      for (const item of pipelineByStage[stage] || []) {
        if (item.lead?.id) ids.push(item.lead.id);
      }
    }
    return ids;
  }, [pipelineByStage]);

  // Angebote pro Lead (Set von lead_ids mit ≥1 Angebot)
  const { data: leadIdsWithOffer, isError: offersError } = useQuery({
    queryKey: ['pipeline-board-offers', allLeadIds.length],
    queryFn: async () => {
      if (allLeadIds.length === 0) return new Set<string>();
      const { data, error } = await supabase
        .from('offers')
        .select('lead_id')
        .in('lead_id', allLeadIds);
      if (error) throw error;
      return new Set<string>((data ?? []).map((r) => r.lead_id as string).filter(Boolean));
    },
    enabled: allLeadIds.length > 0,
    staleTime: 60_000,
  });

  // Termine pro Lead (geplante Calls in Zukunft)
  const { data: leadIdsWithAppointment, isError: callsError } = useQuery({
    queryKey: ['pipeline-board-appointments', allLeadIds.length],
    queryFn: async () => {
      if (allLeadIds.length === 0) return new Set<string>();
      const { data, error } = await supabase
        .from('calls')
        .select('lead_id, scheduled_at')
        .in('lead_id', allLeadIds)
        .gte('scheduled_at', new Date().toISOString());
      if (error) throw error;
      return new Set<string>((data ?? []).map((r) => r.lead_id as string).filter(Boolean));
    },
    enabled: allLeadIds.length > 0,
    staleTime: 60_000,
  });

  // Map lead_id → frühestes überfälliges Task (für Fälligkeitsfilter)
  const overdueLeadIds = useMemo(() => {
    const set = new Set<string>();
    const now = new Date();
    for (const t of tasks ?? []) {
      if (t.status !== 'open') continue;
      if (!t.due_at || !t.lead_id) continue;
      if (new Date(t.due_at) < now) set.add(t.lead_id);
    }
    return set;
  }, [tasks]);

  const matchesFilters = (item: PipelineItemWithLead): boolean => {
    if (filters.priorities.length > 0) {
      const tier = getPriorityTier(item.pipeline_priority_score);
      if (!filters.priorities.includes(tier)) return false;
    }
    if (filters.owners.length > 0) {
      const ownerId = item.lead?.owner?.id ?? null;
      const key = ownerId ?? 'unassigned';
      if (!filters.owners.includes(key)) return false;
    }
    if (filters.icpBands.length > 0) {
      const band = getIcpBand(item.lead?.icp_fit_score);
      if (!filters.icpBands.includes(band)) return false;
    }
    if (filters.stages.length > 0) {
      if (!filters.stages.includes(item.stage)) return false;
    }
    if (filters.sources.length > 0) {
      const src = item.lead?.source_type;
      if (!src || !filters.sources.includes(src)) return false;
    }
    if (filters.overdue !== 'all') {
      const isOverdue = item.lead?.id ? overdueLeadIds.has(item.lead.id) : false;
      if (filters.overdue === 'overdue' && !isOverdue) return false;
      if (filters.overdue === 'on_track' && isOverdue) return false;
    }
    if (filters.hasOffer !== 'all' && leadIdsWithOffer) {
      const has = item.lead?.id ? leadIdsWithOffer.has(item.lead.id) : false;
      if (filters.hasOffer === 'with' && !has) return false;
      if (filters.hasOffer === 'without' && has) return false;
    }
    if (filters.hasAppointment !== 'all' && leadIdsWithAppointment) {
      const has = item.lead?.id ? leadIdsWithAppointment.has(item.lead.id) : false;
      if (filters.hasAppointment === 'with' && !has) return false;
      if (filters.hasAppointment === 'without' && has) return false;
    }
    if (filters.dateRange !== 'all') {
      const { from, to } = getDateRangeBounds(filters.dateRange, filters.customFrom, filters.customTo);
      const ref = item.stage_updated_at ? new Date(item.stage_updated_at) : null;
      if (!ref) return false;
      if (from && ref < from) return false;
      if (to && ref > to) return false;
    }
    return true;
  };

  const filteredByStage = useMemo<PipelineData>(() => {
    const noSearch = !normalizedSearch;
    const noFilters = countActiveFilters(filters) === 0;
    if (noSearch && noFilters) return pipelineByStage;

    const out: PipelineData = {} as PipelineData;
    for (const stage of STAGE_ORDER) {
      out[stage] = (pipelineByStage[stage] || []).filter(
        (item) => matchesSearch(item, normalizedSearch) && matchesFilters(item),
      );
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineByStage, normalizedSearch, filters, leadIdsWithOffer, leadIdsWithAppointment, overdueLeadIds]);

  const totalLeads = useMemo(
    () => STAGE_ORDER.reduce((acc, s) => acc + (pipelineByStage[s]?.length || 0), 0),
    [pipelineByStage],
  );
  const visibleLeads = useMemo(
    () => STAGE_ORDER.reduce((acc, s) => acc + (filteredByStage[s]?.length || 0), 0),
    [filteredByStage],
  );

  const hasActiveQuery = !!normalizedSearch || countActiveFilters(filters) > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 min-w-0 space-y-3 order-2 lg:order-1">
        {/* Tabs (Desktop in Zeile mit Suche, Mobile darüber, scrollbar) */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={group}
            onValueChange={(v) => {
              setGroup(v as PipelineGroup);
              setStageFilter(null);
            }}
            className="min-w-0"
          >
            <ScrollArea className="w-full sm:w-auto">
              <TabsList className="h-auto inline-flex">
                {GROUP_ORDER.map((g) => (
                  <TabsTrigger key={g} value={g} title={PIPELINE_GROUP_HINTS[g]}>
                    {PIPELINE_GROUP_LABELS[g]}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" className="h-1.5" />
            </ScrollArea>
          </Tabs>

          {/* Suche – Desktop sichtbar, Mobile siehe unten in einer Zeile mit Filter */}
          <div className="relative w-full sm:w-72 hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche: Name, Firma, E-Mail, Telefon…"
              className="pl-8 h-9"
            />
            {hasActiveQuery && (
              <Badge
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]"
                title={`${visibleLeads} Treffer mit aktuellen Filtern`}
              >
                {visibleLeads}
              </Badge>
            )}
          </div>
        </div>

        {/* Mobile: Suche + Filter-Trigger nebeneinander, kompakt */}
        <div className="flex items-center gap-2 sm:hidden">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche…"
              className="pl-8 h-9 text-sm"
            />
            {hasActiveQuery && (
              <Badge
                variant="secondary"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]"
              >
                {visibleLeads}
              </Badge>
            )}
          </div>
          <div className="w-32 shrink-0">
            <PipelineFilters
              value={filters}
              onChange={setFilters}
              ownerOptions={ownerOptions}
              sourceOptions={sourceOptions}
              offerFilterAvailable={!offersError}
              appointmentFilterAvailable={!callsError}
              visibleCount={visibleLeads}
              totalCount={totalLeads}
            />
          </div>
        </div>

        {/* Filter-Leiste (Desktop) */}
        <div className="hidden sm:block">
          <PipelineFilters
            value={filters}
            onChange={setFilters}
            ownerOptions={ownerOptions}
            sourceOptions={sourceOptions}
            offerFilterAvailable={!offersError}
            appointmentFilterAvailable={!callsError}
            visibleCount={visibleLeads}
            totalCount={totalLeads}
          />
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs text-muted-foreground break-words">
            {stageFilter
              ? `Gefiltert auf eine Phase – Klick auf „Filter ✕" in der Übersicht zum Zurücksetzen.`
              : PIPELINE_GROUP_HINTS[group]}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {hasActiveQuery
              ? `${visibleLeads} von ${totalLeads} Leads sichtbar`
              : `${totalLeads} Leads gesamt`}
          </p>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-3 sm:gap-4 p-1 pb-4 h-[calc(100vh-280px)] min-h-[500px]">
            {STAGE_ORDER.map((stage) => (
              <PipelineColumn
                key={stage}
                stage={stage}
                items={filteredByStage[stage] || []}
                onItemClick={onItemClick}
                onDrop={onStageChange}
                dimmed={!activeStages.has(stage)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <aside className="w-full lg:w-72 lg:shrink-0 order-1 lg:order-2">
        <PipelineHeatmap
          pipelineByStage={pipelineByStage}
          stageOrder={STAGE_ORDER}
          selectedStage={stageFilter}
          onStageSelect={setStageFilter}
        />
      </aside>
    </div>
  );
}
