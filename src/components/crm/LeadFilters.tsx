import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import { 
  LeadFilters as LeadFiltersType,
  LeadStatus,
  LeadSourceType,
  PipelineStage,
  LEAD_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
  PIPELINE_STAGE_LABELS,
} from '@/types/crm';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFiltersChange: (filters: LeadFiltersType) => void;
  owners?: { id: string; name: string }[];
}

export function LeadFilters({ filters, onFiltersChange, owners = [] }: LeadFiltersProps) {
  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suchen..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          className="pl-9 w-[200px]"
        />
      </div>

      <Select
        value={filters.status || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ 
            ...filters, 
            status: value === 'all' ? undefined : value as LeadStatus 
          })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.stage || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ 
            ...filters, 
            stage: value === 'all' ? undefined : value as PipelineStage 
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pipeline Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Stages</SelectItem>
          {Object.entries(PIPELINE_STAGE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.source_type || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ 
            ...filters, 
            source_type: value === 'all' ? undefined : value as LeadSourceType 
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Quelle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Quellen</SelectItem>
          {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {owners.length > 0 && (
        <Select
          value={filters.owner_user_id || 'all'}
          onValueChange={(value) => 
            onFiltersChange({ 
              ...filters, 
              owner_user_id: value === 'all' ? undefined : value 
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Besitzer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Besitzer</SelectItem>
            {owners.map((owner) => (
              <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}
