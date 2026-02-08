import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Clock, Building2, User } from 'lucide-react';
import { CrmTask, TASK_TYPE_LABELS, TASK_TYPE_ICONS } from '@/types/crm';
import { format, isToday, isPast, isTomorrow } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: CrmTask;
  onComplete?: (id: string) => void;
  onReopen?: (id: string) => void;
  onEdit?: (task: CrmTask) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

function getDueDateLabel(dueAt?: string) {
  if (!dueAt) return null;
  const date = new Date(dueAt);
  if (isToday(date)) return format(date, 'HH:mm', { locale: de });
  if (isTomorrow(date)) return 'Morgen ' + format(date, 'HH:mm', { locale: de });
  return format(date, 'dd.MM. HH:mm', { locale: de });
}

function getDueDateColor(dueAt?: string, status?: string) {
  if (!dueAt || status === 'done') return 'text-muted-foreground';
  const date = new Date(dueAt);
  if (isPast(date) && !isToday(date)) return 'text-destructive font-medium';
  if (isToday(date)) return 'text-orange-500 font-medium';
  return 'text-muted-foreground';
}

export function TaskCard({ task, onComplete, onReopen, onEdit, onDelete, onClick }: TaskCardProps) {
  const isDone = task.status === 'done';
  const lead = task.lead as { first_name?: string; last_name?: string; company?: string } | undefined;

  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md",
        isDone && "opacity-60"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={isDone}
            onCheckedChange={(checked) => {
              if (checked) {
                onComplete?.(task.id);
              } else {
                onReopen?.(task.id);
              }
            }}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{TASK_TYPE_ICONS[task.type]}</span>
              <span className="font-medium">
                {TASK_TYPE_LABELS[task.type]}
              </span>
              {task.status === 'blocked' && (
                <Badge variant="destructive" className="text-xs">
                  Blockiert
                </Badge>
              )}
            </div>

            <div className={cn("mt-1", isDone && "line-through")}>
              {task.title}
            </div>

            {task.description && (
              <div className="text-sm text-muted-foreground mt-1 truncate">
                → {task.description}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {lead && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {lead.first_name} {lead.last_name}
                  {lead.company && ` (${lead.company})`}
                </div>
              )}

              {task.assigned_user && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  {task.assigned_user.first_name || task.assigned_user.full_name}
                </div>
              )}

              {task.due_at && (
                <div className={cn("flex items-center gap-1 text-sm", getDueDateColor(task.due_at, task.status))}>
                  <Clock className="h-3 w-3" />
                  {getDueDateLabel(task.due_at)}
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                Bearbeiten
              </DropdownMenuItem>
              {isDone ? (
                <DropdownMenuItem onClick={() => onReopen?.(task.id)}>
                  Wieder öffnen
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onComplete?.(task.id)}>
                  Als erledigt markieren
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete?.(task.id)}
              >
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
