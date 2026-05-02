import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
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
  type PipelineFilterValue,
  type OwnerOption,
} from './PipelineFilters';
import { PipelineData, PipelineItemWithLead } from '@/hooks/usePipeline';
import { getPriorityTier } from '@/lib/pipeline-stage';
import {
  PipelineStage,
  PipelineGroup,
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
const DEFAULT_GROUP: PipelineGroup = 'active';

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

export function PipelineBoard({
  pipelineByStage,
  loading,
  onItemClick,
  onStageChange,
}: PipelineBoardProps) {
  const [group, setGroup] = useState<PipelineGroup>(DEFAULT_GROUP);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<PipelineStage | null>(null);
  const [filters, setFilters] = useState<PipelineFilterValue>(EMPTY_FILTER);

  // Auswahl beim Mount aus localStorage laden
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isGroup(stored)) setGroup(stored);
    } catch {
      // localStorage nicht verfügbar – ignorieren
    }
  }, []);

  // Auswahl persistieren
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, group);
    } catch {
      // ignorieren
    }
  }, [group]);

  const activeStages = useMemo<Set<PipelineStage>>(() => {
    // Einzel-Stage-Filter (aus Heatmap-Klick) hat Vorrang vor Gruppen-Tabs
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

  const matchesFilters = (item: PipelineItemWithLead): boolean => {
    // Priorität
    if (filters.priorities.length > 0) {
      const tier = getPriorityTier(item.pipeline_priority_score);
      if (!filters.priorities.includes(tier)) return false;
    }
    // Owner
    if (filters.owners.length > 0) {
      const ownerId = item.lead?.owner?.id ?? null;
      const key = ownerId ?? 'unassigned';
      if (!filters.owners.includes(key)) return false;
    }
    // ICP-Fit
    if (filters.icpBands.length > 0) {
      const band = getIcpBand(item.lead?.icp_fit_score);
      if (!filters.icpBands.includes(band)) return false;
    }
    return true;
  };

  // Karten pro Stage nach Suche + Filtern filtern (Spalten bleiben sichtbar)
  const filteredByStage = useMemo<PipelineData>(() => {
    const noSearch = !normalizedSearch;
    const noFilters =
      filters.priorities.length === 0 &&
      filters.owners.length === 0 &&
      filters.icpBands.length === 0;
    if (noSearch && noFilters) return pipelineByStage;

    const out: PipelineData = {} as PipelineData;
    for (const stage of STAGE_ORDER) {
      out[stage] = (pipelineByStage[stage] || []).filter(
        (item) => matchesSearch(item, normalizedSearch) && matchesFilters(item),
      );
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineByStage, normalizedSearch, filters]);

  // Treffer-Count für Suche/Filter (über alle Stages, ohne Dimming-Filter)
  const hasActiveQuery =
    !!normalizedSearch ||
    filters.priorities.length > 0 ||
    filters.owners.length > 0 ||
    filters.icpBands.length > 0;
  const totalMatches = useMemo(() => {
    if (!hasActiveQuery) return 0;
    return STAGE_ORDER.reduce((acc, s) => acc + (filteredByStage[s]?.length || 0), 0);
  }, [filteredByStage, hasActiveQuery]);

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={group}
            onValueChange={(v) => {
              setGroup(v as PipelineGroup);
              setStageFilter(null);
            }}
          >
            <TabsList className="flex-wrap h-auto">
              {GROUP_ORDER.map((g) => (
                <TabsTrigger key={g} value={g} title={PIPELINE_GROUP_HINTS[g]}>
                  {PIPELINE_GROUP_LABELS[g]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche: Name, Firma, E-Mail…"
              className="pl-8 h-9"
            />
            {normalizedSearch && (
              <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">
                {totalMatches}
              </Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground break-words">
          {stageFilter
            ? `Gefiltert auf eine Phase – Klick auf „Filter ✕" in der Übersicht zum Zurücksetzen.`
            : PIPELINE_GROUP_HINTS[group]}
        </p>

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
