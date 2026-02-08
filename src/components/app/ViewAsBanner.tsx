import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

export function ViewAsBanner() {
  const { isViewingAs, effectiveRole, setViewAsRole } = useAuth();

  if (!isViewingAs || !effectiveRole) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4 text-primary" />
          <span>
            Du siehst die App als{' '}
            <strong className="text-primary">{ROLE_LABELS[effectiveRole]}</strong>
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewAsRole(null)}
          className="h-7 gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Beenden
        </Button>
      </div>
    </div>
  );
}
