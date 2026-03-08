import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Call, 
  CALL_STATUS_LABELS, 
  CALL_TYPE_LABELS,
  CALL_STATUS_COLORS 
} from '@/types/calls';
import { ClickToCallButton } from './ClickToCallButton';
import { 
  Phone, 
  Video, 
  Clock, 
  User, 
  Play,
  Eye,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CallCardProps {
  call: Call;
  onView?: (call: Call) => void;
  onStart?: (callId: string) => void;
  onEnd?: (callId: string) => void;
  compact?: boolean;
}

export function CallCard({ call, onView, onStart, onEnd, compact = false }: CallCardProps) {
  const isVideo = call.call_type === 'zoom' || call.call_type === 'teams';
  const Icon = isVideo ? Video : Phone;
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    const colorClass = CALL_STATUS_COLORS[call.status];
    return (
      <Badge 
        variant="secondary"
        className={`${colorClass} text-white`}
      >
        {CALL_STATUS_LABELS[call.status]}
      </Badge>
    );
  };

  if (compact) {
    return (
      <div 
        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => onView?.(call)}
      >
        <div className="p-2 rounded-full bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {call.lead?.first_name} {call.lead?.last_name}
            </span>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-muted-foreground">
            {call.scheduled_at 
              ? format(new Date(call.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: de })
              : 'Nicht geplant'
            }
          </p>
        </div>
        {call.status === 'analyzed' && (
          <Badge variant="outline" className="shrink-0">
            Analysiert
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="p-3 rounded-lg bg-muted shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium truncate">
                  {call.lead?.first_name} {call.lead?.last_name}
                </h4>
                {getStatusBadge()}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(call)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Details anzeigen
                  </DropdownMenuItem>
                  {call.status === 'scheduled' && (
                    <DropdownMenuItem onClick={() => onStart?.(call.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Call starten
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {call.lead?.company && (
                <span className="truncate">{call.lead.company}</span>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {call.scheduled_at 
                  ? format(new Date(call.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: de })
                  : 'Nicht geplant'
                }
              </div>
              
              {call.duration_seconds && (
                <span>{formatDuration(call.duration_seconds)}</span>
              )}
              
              {call.conductor && (
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {call.conductor.first_name} {call.conductor.last_name}
                </div>
              )}
            </div>
            
            {/* Type badge */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {CALL_TYPE_LABELS[call.call_type]}
              </Badge>
              
              {call.status === 'analyzed' && (
                <Badge variant="secondary" className="text-xs">
                  KI-Analyse verfügbar
                </Badge>
              )}
            </div>
            
            {/* Notes preview */}
            {call.notes && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {call.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
