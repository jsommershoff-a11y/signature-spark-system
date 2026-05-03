import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Filter,
  Check,
  X,
  Flame,
  User as UserIcon,
  Target,
  Layers,
  Tag,
  AlertTriangle,
  FileText,
  CalendarClock,
  Clock,
  SlidersHorizontal,
  Hourglass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityTier } from '@/lib/pipeline-stage';
import {
  PipelineStage,
  PIPELINE_STAGE_LABELS,
  LeadSourceType,
  SOURCE_TYPE_LABELS,
} from '@/types/crm';

export type IcpBand = 'high' | 'medium' | 'low' | 'none';
export type TriState = 'all' | 'with' | 'without';
export type OverdueState = 'all' | 'overdue' | 'on_track';
export type DateRangeKey = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface OwnerOption {
  id: string;
  label: string;
}

export interface PipelineFilterValue {
  priorities: PriorityTier[];
  owners: string[];
  icpBands: IcpBand[];
  stages: PipelineStage[];
  sources: LeadSourceType[];
  overdue: OverdueState;
  hasOffer: TriState;
  hasAppointment: TriState;
  dateRange: DateRangeKey;
  customFrom?: string;
  customTo?: string;
  /** Mindestanzahl Tage seit `stage_updated_at`. 0/undefined = aus. */
  stuckDays?: number;
}

export const EMPTY_FILTER: PipelineFilterValue = {
  priorities: [],
  owners: [],
  icpBands: [],
  stages: [],
  sources: [],
  overdue: 'all',
  hasOffer: 'all',
  hasAppointment: 'all',
  dateRange: 'all',
  stuckDays: 0,
};

const PRIORITY_OPTIONS: { value: PriorityTier; label: string }[] = [
  { value: 'high', label: 'Hoch (≥ 80)' },
  { value: 'medium', label: 'Mittel (60–79)' },
  { value: 'low', label: 'Niedrig (40–59)' },
  { value: 'very_low', label: 'Sehr niedrig (< 40)' },
  { value: 'none', label: 'Ohne Score' },
];

const ICP_OPTIONS: { value: IcpBand; label: string }[] = [
  { value: 'high', label: 'Top-Fit (≥ 80 %)' },
  { value: 'medium', label: 'Solide (60–79 %)' },
  { value: 'low', label: 'Schwach (< 60 %)' },
  { value: 'none', label: 'Kein ICP-Score' },
];

const STAGE_OPTIONS: PipelineStage[] = [
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

export function getIcpBand(score?: number | null): IcpBand {
  if (score === undefined || score === null || Number.isNaN(score)) return 'none';
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

export function countActiveFilters(v: PipelineFilterValue): number {
  return (
    v.priorities.length +
    v.owners.length +
    v.icpBands.length +
    v.stages.length +
    v.sources.length +
    (v.overdue !== 'all' ? 1 : 0) +
    (v.hasOffer !== 'all' ? 1 : 0) +
    (v.hasAppointment !== 'all' ? 1 : 0) +
    (v.dateRange !== 'all' ? 1 : 0) +
    (v.stuckDays && v.stuckDays > 0 ? 1 : 0)
  );
}

interface PipelineFiltersProps {
  value: PipelineFilterValue;
  onChange: (next: PipelineFilterValue) => void;
  ownerOptions: OwnerOption[];
  sourceOptions: LeadSourceType[];
  /** Wenn false → Filter „Angebot" ausgeblendet (keine Datenbasis verfügbar) */
  offerFilterAvailable?: boolean;
  /** Wenn false → Filter „Termin" ausgeblendet */
  appointmentFilterAvailable?: boolean;
  /** Optional: Anzahl der aktuell sichtbaren Treffer (für Mobile-Sheet-Header) */
  visibleCount?: number;
  totalCount?: number;
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function FiltersInner({
  value,
  onChange,
  ownerOptions,
  sourceOptions,
  offerFilterAvailable = true,
  appointmentFilterAvailable = true,
}: PipelineFiltersProps) {
  const activeCount = countActiveFilters(value);
  const reset = () => onChange(EMPTY_FILTER);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Phase */}
        <MultiSelectPopover
          icon={<Layers className="h-3.5 w-3.5" />}
          label="Phase"
          selectedCount={value.stages.length}
          items={STAGE_OPTIONS.map((s) => ({
            key: s,
            label: PIPELINE_STAGE_LABELS[s],
            checked: value.stages.includes(s),
            onToggle: () => onChange({ ...value, stages: toggle(value.stages, s) }),
          }))}
          onClear={() => onChange({ ...value, stages: [] })}
        />

        {/* Verantwortlicher */}
        <MultiSelectPopover
          icon={<UserIcon className="h-3.5 w-3.5" />}
          label="Owner"
          selectedCount={value.owners.length}
          searchPlaceholder="Owner suchen…"
          items={[
            {
              key: 'unassigned',
              label: 'Ohne Owner',
              checked: value.owners.includes('unassigned'),
              onToggle: () => onChange({ ...value, owners: toggle(value.owners, 'unassigned') }),
            },
            ...ownerOptions.map((o) => ({
              key: o.id,
              label: o.label,
              checked: value.owners.includes(o.id),
              onToggle: () => onChange({ ...value, owners: toggle(value.owners, o.id) }),
            })),
          ]}
          onClear={() => onChange({ ...value, owners: [] })}
        />

        {/* Quelle */}
        {sourceOptions.length > 0 ? (
          <MultiSelectPopover
            icon={<Tag className="h-3.5 w-3.5" />}
            label="Quelle"
            selectedCount={value.sources.length}
            items={sourceOptions.map((s) => ({
              key: s,
              label: SOURCE_TYPE_LABELS[s] ?? s,
              checked: value.sources.includes(s),
              onToggle: () => onChange({ ...value, sources: toggle(value.sources, s) }),
            }))}
            onClear={() => onChange({ ...value, sources: [] })}
          />
        ) : (
          <DisabledChip icon={<Tag className="h-3.5 w-3.5" />} label="Quelle" reason="Keine Quellen-Daten" />
        )}

        {/* Priorität */}
        <MultiSelectPopover
          icon={<Flame className="h-3.5 w-3.5" />}
          label="Priorität"
          selectedCount={value.priorities.length}
          items={PRIORITY_OPTIONS.map((o) => ({
            key: o.value,
            label: o.label,
            checked: value.priorities.includes(o.value),
            onToggle: () => onChange({ ...value, priorities: toggle(value.priorities, o.value) }),
          }))}
          onClear={() => onChange({ ...value, priorities: [] })}
        />

        {/* ICP-Fit */}
        <MultiSelectPopover
          icon={<Target className="h-3.5 w-3.5" />}
          label="ICP-Fit"
          selectedCount={value.icpBands.length}
          items={ICP_OPTIONS.map((o) => ({
            key: o.value,
            label: o.label,
            checked: value.icpBands.includes(o.value),
            onToggle: () => onChange({ ...value, icpBands: toggle(value.icpBands, o.value) }),
          }))}
          onClear={() => onChange({ ...value, icpBands: [] })}
        />

        {/* Überfällig */}
        <TriStateChip
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label="Fälligkeit"
          value={value.overdue}
          options={[
            { value: 'all', label: 'Alle' },
            { value: 'overdue', label: 'Überfällig' },
            { value: 'on_track', label: 'Nicht überfällig' },
          ]}
          onChange={(v) => onChange({ ...value, overdue: v as OverdueState })}
        />

        {/* Angebot */}
        {offerFilterAvailable ? (
          <TriStateChip
            icon={<FileText className="h-3.5 w-3.5" />}
            label="Angebot"
            value={value.hasOffer}
            options={[
              { value: 'all', label: 'Alle' },
              { value: 'with', label: 'Mit Angebot' },
              { value: 'without', label: 'Ohne Angebot' },
            ]}
            onChange={(v) => onChange({ ...value, hasOffer: v as TriState })}
          />
        ) : (
          <DisabledChip icon={<FileText className="h-3.5 w-3.5" />} label="Angebot" reason="Keine Angebotsdaten verfügbar" />
        )}

        {/* Termin */}
        {appointmentFilterAvailable ? (
          <TriStateChip
            icon={<CalendarClock className="h-3.5 w-3.5" />}
            label="Termin"
            value={value.hasAppointment}
            options={[
              { value: 'all', label: 'Alle' },
              { value: 'with', label: 'Mit Termin' },
              { value: 'without', label: 'Ohne Termin' },
            ]}
            onChange={(v) => onChange({ ...value, hasAppointment: v as TriState })}
          />
        ) : (
          <DisabledChip icon={<CalendarClock className="h-3.5 w-3.5" />} label="Termin" reason="Keine Termindaten verfügbar" />
        )}

        {/* Zeitraum */}
        <div className="flex items-center gap-1">
          <Select
            value={value.dateRange}
            onValueChange={(v) => onChange({ ...value, dateRange: v as DateRangeKey })}
          >
            <SelectTrigger
              className={cn(
                'h-8 text-xs gap-1.5 w-auto px-2.5',
                value.dateRange !== 'all' && 'border-primary/60 bg-primary/5',
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Zeitraum: Alle</SelectItem>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
              <SelectItem value="custom">Benutzerdefiniert…</SelectItem>
            </SelectContent>
          </Select>
          {value.dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={value.customFrom ?? ''}
                onChange={(e) => onChange({ ...value, customFrom: e.target.value })}
                className="h-8 rounded-md border bg-background px-2 text-xs"
                aria-label="Von"
              />
              <input
                type="date"
                value={value.customTo ?? ''}
                onChange={(e) => onChange({ ...value, customTo: e.target.value })}
                className="h-8 rounded-md border bg-background px-2 text-xs"
                aria-label="Bis"
              />
            </>
          )}
        </div>

        {/* Stuck (Tage in Phase) */}
        <Select
          value={String(value.stuckDays ?? 0)}
          onValueChange={(v) => onChange({ ...value, stuckDays: Number(v) })}
        >
          <SelectTrigger
            className={cn(
              'h-8 text-xs gap-1.5 w-auto px-2.5',
              (value.stuckDays ?? 0) > 0 && 'border-primary/60 bg-primary/5',
            )}
            title="Filtert Leads, die seit X Tagen in der gleichen Phase liegen"
          >
            <Hourglass className="h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Stuck: Aus</SelectItem>
            <SelectItem value="3">≥ 3 Tage in Phase</SelectItem>
            <SelectItem value="7">≥ 7 Tage in Phase</SelectItem>
            <SelectItem value="14">≥ 14 Tage in Phase</SelectItem>
            <SelectItem value="30">≥ 30 Tage in Phase</SelectItem>
          </SelectContent>
        </Select>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground"
            onClick={reset}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Filter zurücksetzen ({activeCount})
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
}

export function PipelineFilters(props: PipelineFiltersProps) {
  const activeCount = countActiveFilters(props.value);
  const reset = () => props.onChange(EMPTY_FILTER);
  const hasCounts = props.visibleCount !== undefined && props.totalCount !== undefined;
  return (
    <>
      {/* Desktop / Tablet */}
      <div className="hidden md:block">
        <FiltersInner {...props} />
      </div>

      {/* Mobile: Kompakter Trigger, Inhalte im Bottom-Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-9 w-full justify-between gap-2 text-xs',
                activeCount > 0 && 'border-primary/60 bg-primary/5',
              )}
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
                {activeCount > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                    {activeCount}
                  </Badge>
                )}
              </span>
              {hasCounts && (
                <span className="text-muted-foreground tabular-nums">
                  {props.visibleCount}/{props.totalCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
            <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
              <div className="flex items-center justify-between gap-2">
                <SheetTitle className="text-base">Pipeline-Filter</SheetTitle>
                {hasCounts && (
                  <Badge variant="secondary" className="text-[11px] tabular-nums">
                    {props.visibleCount} / {props.totalCount} sichtbar
                  </Badge>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FiltersInner {...props} />
            </div>

            <div className="border-t bg-background px-4 py-3 flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9 text-xs"
                onClick={reset}
                disabled={activeCount === 0}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Zurücksetzen
              </Button>
              <SheetClose asChild>
                <Button size="sm" className="flex-1 h-9 text-xs">
                  Anwenden
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

interface MultiSelectItem {
  key: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}

interface MultiSelectPopoverProps {
  icon: React.ReactNode;
  label: string;
  selectedCount: number;
  items: MultiSelectItem[];
  onClear: () => void;
  searchPlaceholder?: string;
}

function MultiSelectPopover({
  icon,
  label,
  selectedCount,
  items,
  onClear,
  searchPlaceholder,
}: MultiSelectPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 gap-1.5 text-xs font-normal',
            selectedCount > 0 && 'border-primary/60 bg-primary/5',
          )}
        >
          {icon}
          {label}
          {selectedCount > 0 && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
              {selectedCount}
            </Badge>
          )}
          <Filter className="h-3 w-3 ml-0.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          {searchPlaceholder && <CommandInput placeholder={searchPlaceholder} className="h-9" />}
          <CommandList>
            <CommandEmpty>Keine Treffer.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.key}
                  value={item.label}
                  onSelect={item.onToggle}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                      item.checked
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground/40',
                    )}
                  >
                    {item.checked && <Check className="h-3 w-3" />}
                  </div>
                  <span className="flex-1 truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {selectedCount > 0 && (
              <div className="border-t p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-xs justify-center"
                  onClick={onClear}
                >
                  <X className="h-3 w-3 mr-1" /> Auswahl löschen
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface TriStateChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

function TriStateChip({ icon, label, value, options, onChange }: TriStateChipProps) {
  const active = value !== 'all';
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          'h-8 text-xs gap-1.5 w-auto px-2.5',
          active && 'border-primary/60 bg-primary/5',
        )}
      >
        {icon}
        <span className="font-normal">
          {label}
          {active && `: ${options.find((o) => o.value === value)?.label}`}
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DisabledChip({ icon, label, reason }: { icon: React.ReactNode; label: string; reason: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button variant="outline" size="sm" disabled className="h-8 gap-1.5 text-xs font-normal opacity-60">
            {icon}
            {label}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  );
}
