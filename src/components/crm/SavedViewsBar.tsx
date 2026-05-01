import { useState } from 'react';
import { Bookmark, BookmarkPlus, X, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { SavedView } from '@/hooks/useSavedViews';

interface Props<TFilter> {
  views: SavedView<TFilter>[];
  activeId: string | null;
  defaultId?: string | null;
  currentFilter: TFilter;
  onApply: (filter: TFilter) => void;
  onSave: (name: string, filter: TFilter) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onSelect?: (id: string) => void;
  onSetDefault?: (id: string | null) => Promise<void> | void;
}

export function SavedViewsBar<TFilter>({
  views, activeId, defaultId, currentFilter, onApply, onSave, onDelete, onSelect, onSetDefault,
}: Props<TFilter>) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSave(name, currentFilter);
    setName('');
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {views.length > 0 && (
        <div className="flex items-center gap-1.5 mr-1">
          <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground hidden sm:inline">Ansichten:</span>
        </div>
      )}

      {views.map((v) => {
        const isActive = v.id === activeId;
        const isDefault = v.id === defaultId;
        return (
          <Badge
            key={v.id}
            variant={isActive ? 'default' : 'secondary'}
            className="cursor-pointer pr-1 gap-1 hover:bg-secondary/80 group"
            onClick={() => { onApply(v.filter); onSelect?.(v.id); }}
          >
            {isActive && <Check className="h-3 w-3" />}
            <span className="max-w-[140px] truncate">{v.name}</span>
            {onSetDefault && (
              <button
                type="button"
                className={cn(
                  'ml-0.5 rounded-sm hover:bg-background/40 p-0.5 transition-opacity',
                  isDefault ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault(isDefault ? null : v.id);
                }}
                aria-label={isDefault ? `${v.name} als Standard entfernen` : `${v.name} als Standard setzen`}
                title={isDefault ? 'Standard-Ansicht entfernen' : 'Als Standard festlegen'}
              >
                <Star
                  className={cn(
                    'h-3 w-3',
                    isDefault ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground',
                  )}
                />
              </button>
            )}
            <button
              type="button"
              className="ml-0.5 rounded-sm hover:bg-background/40 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); onDelete(v.id); }}
              aria-label={`${v.name} löschen`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
            <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
            Ansicht speichern
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <p className="text-xs font-medium">Aktuelle Filter speichern</p>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              placeholder="z. B. Heiße Leads"
              maxLength={60}
              className="h-8"
            />
            <div className="flex justify-end gap-1.5">
              <Button variant="ghost" size="sm" className="h-7" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button size="sm" className="h-7" onClick={handleSave} disabled={!name.trim()}>
                Speichern
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
