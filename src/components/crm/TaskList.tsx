import { CrmTask } from '@/types/crm';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: CrmTask[];
  loading?: boolean;
  onComplete?: (id: string) => void;
  onReopen?: (id: string) => void;
  onEdit?: (task: CrmTask) => void;
  onDelete?: (id: string) => void;
  onTaskClick?: (task: CrmTask) => void;
  emptyMessage?: string;
}

export function TaskList({ 
  tasks, 
  loading,
  onComplete,
  onReopen,
  onEdit,
  onDelete,
  onTaskClick,
  emptyMessage = 'Keine Aufgaben'
}: TaskListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onReopen={onReopen}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={() => onTaskClick?.(task)}
        />
      ))}
    </div>
  );
}
