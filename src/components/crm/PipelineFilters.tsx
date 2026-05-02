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
import { Filter, Check, X, Flame, User as UserIcon, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityTier } from '@/lib/pipeline-stage';

export type IcpBand = 'high' | 'medium' | 'low' | 'none';

export interface OwnerOption {
  id: string;
  label: string;
}

export interface PipelineFilterValue {
  priorities: PriorityTier[]; // leer = keine Einschränkung
  owners: string[];           // user_ids; 'unassigned' für Leads ohne Owner
  icpBands: IcpBand[];        // leer = keine Einschränkung
}

export const EMPTY_FILTER: PipelineFilterValue = {
  priorities: [],
  owners: [],
  icpBands: [],
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

export function getIcpBand(score?: number | null): IcpBand {
  if (score === undefined || score === null || Number.isNaN(score)) return 'none';
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

interface PipelineFiltersProps {
  value: PipelineFilterValue;
  onChange: (next: PipelineFilterValue) => void;
  ownerOptions: OwnerOption[];
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function PipelineFilters({ value, onChange, ownerOptions }: PipelineFiltersProps) {
  const activeCount =
    value.priorities.length + value.owners.length + value.icpBands.length;

  const reset = () => onChange(EMPTY_FILTER);

  return (
    <div className="flex items-center gap-2 flex-wrap">
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

      {/* Owner */}
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
