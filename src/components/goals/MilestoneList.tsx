import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import type { GoalMilestone } from '@/hooks/useGoals';

interface MilestoneListProps {
  milestones: GoalMilestone[];
  onToggle: (id: string, completed: boolean) => void;
  onAdd: (title: string, sortOrder: number) => void;
  onDelete: (id: string) => void;
}

export function MilestoneList({ milestones, onToggle, onAdd, onDelete }: MilestoneListProps) {
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim(), milestones.length);
    setNewTitle('');
  };

  const completedCount = milestones.filter((m) => m.is_completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Teil-Ziele</h4>
        <span className="text-xs text-muted-foreground">
          {completedCount} / {milestones.length} erledigt
        </span>
      </div>

      <div className="space-y-2">
        {milestones.map((m) => (
          <div key={m.id} className="flex items-center gap-2 group">
            <Checkbox
              checked={m.is_completed}
              onCheckedChange={(checked) => onToggle(m.id, !!checked)}
            />
            <span className={`flex-1 text-sm ${m.is_completed ? 'line-through text-muted-foreground' : ''}`}>
              {m.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={() => onDelete(m.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Neues Teil-Ziel..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="h-8 text-sm"
        />
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
