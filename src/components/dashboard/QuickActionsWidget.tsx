import { Button } from '@/components/ui/button';
import { UserPlus, ListTodo, Users, Kanban, Phone, BarChart3, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const ACTIONS = [
  { label: 'Lead anlegen', icon: UserPlus, to: '/app/leads' },
  { label: 'Aufgabe', icon: ListTodo, to: '/app/tasks' },
  { label: 'CRM', icon: Users, to: '/app/crm' },
  { label: 'Pipeline', icon: Kanban, to: '/app/pipeline' },
  { label: 'Calls', icon: Phone, to: '/app/calls' },
  { label: 'Reports', icon: BarChart3, to: '/app/reports' },
  { label: 'Angebote', icon: FileText, to: '/app/offers' },
] as const;

export function QuickActionsWidget() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {ACTIONS.map(({ label, icon: Icon, to }) => (
        <Button
          key={to}
          variant="outline"
          className="h-auto flex-col gap-1.5 py-3 px-2 min-h-[56px] text-xs font-medium"
          asChild
        >
          <Link to={to}>
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="truncate w-full text-center leading-tight">{label}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}
