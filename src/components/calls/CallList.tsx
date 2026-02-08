import { Call } from '@/types/calls';
import { CallCard } from './CallCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone } from 'lucide-react';

interface CallListProps {
  calls: Call[];
  loading?: boolean;
  onViewCall?: (call: Call) => void;
  onStartCall?: (callId: string) => void;
  onEndCall?: (callId: string) => void;
  compact?: boolean;
  emptyMessage?: string;
}

export function CallList({
  calls,
  loading,
  onViewCall,
  onStartCall,
  onEndCall,
  compact = false,
  emptyMessage = 'Keine Calls vorhanden',
}: CallListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className={compact ? 'h-16' : 'h-32'} />
        ))}
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-12">
        <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {calls.map((call) => (
        <CallCard
          key={call.id}
          call={call}
          onView={onViewCall}
          onStart={onStartCall}
          onEnd={onEndCall}
          compact={compact}
        />
      ))}
    </div>
  );
}
