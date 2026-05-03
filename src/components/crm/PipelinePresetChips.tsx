import { Flame, Sun, Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EMPTY_FILTER, type PipelineFilterValue } from './PipelineFilters';

export type PresetId = 'my_day' | 'hot_leads' | 'stuck_14d';

export interface PipelinePresetChipsProps {
  currentUserId?: string | null;
  filters: PipelineFilterValue;
  search: string;
  onApply: (next: { filters: PipelineFilterValue; search?: string }) => void;
  className?: string;
}

interface PresetDef {
  id: PresetId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  build: (ctx: { userId?: string | null }) => { filters: PipelineFilterValue; search?: string } | null;
}


const PRESETS: PresetDef[] = [
  {
    id: 'my_day',
    label: 'Mein Tag',
    icon: Sun,
    build: ({ userId }) =>
      userId
        ? {
            filters: { ...EMPTY_FILTER, owners: [userId], overdue: 'overdue' },
            search: '',
          }
        : null,
  },
  {
    id: 'hot_leads',
    label: 'Hot Leads',
    icon: Flame,
    build: () => ({
      filters: { ...EMPTY_FILTER, priorities: ['high'], icpBands: ['high'] },
      search: '',
    }),
  },
  {
    id: 'stuck_14d',
    label: 'Stuck > 14d',
    icon: Clock,
    build: () => ({
      filters: { ...EMPTY_FILTER, stuckDays: 14 },
      search: '',
    }),
  },
];

function isPresetActive(
  preset: PresetDef,
  state: { filters: PipelineFilterValue; search: string },
  userId?: string | null,
): boolean {
  const p = preset.build({ userId });
  if (!p) return false;
  return (
    JSON.stringify(p.filters) === JSON.stringify(state.filters) &&
    (p.search ?? '') === (state.search ?? '')
  );
}

export function PipelinePresetChips({
  currentUserId,
  filters,
  search,
  onApply,
  className,
}: PipelinePresetChipsProps) {
  const anyActive = PRESETS.some((p) => isPresetActive(p, { filters, search }, currentUserId));

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-xs uppercase tracking-wide text-muted-foreground mr-1">
        Schnell-Ansichten
      </span>
      {PRESETS.map((p) => {
        const built = p.build({ userId: currentUserId });
        const active = isPresetActive(p, { filters, search }, currentUserId);
        const disabled = !built;
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => built && onApply(built)}
            title={
              disabled
                ? 'Login erforderlich, um „Mein Tag" zu nutzen'
                : `Ansicht „${p.label}" anwenden`
            }
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:bg-muted',
              disabled && 'opacity-50 cursor-not-allowed hover:bg-background',
            )}
          >
            <Icon className="h-3 w-3" />
            {p.label}
            {active && <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">aktiv</Badge>}
          </button>
        );
      })}
      {anyActive && (
        <button
          type="button"
          onClick={() => onApply({ filters: EMPTY_FILTER, search: '' })}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          title="Schnell-Ansicht zurücksetzen"
        >
          <X className="h-3 w-3" />
          Zurücksetzen
        </button>
      )}
    </div>
  );
}
