import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Clock, ChevronRight, User, Building2 } from 'lucide-react';
import { useCallQueue } from '@/hooks/useCallQueue';
import { Link } from 'react-router-dom';

export function CallQueueWidget() {
  const { items, pendingCount, isLoading, markAsCalled } = useCallQueue();

  // Get first 5 pending items
  const topItems = items.filter((item) => item.status === 'pending').slice(0, 5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Heutige Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Heutige Calls
          {pendingCount > 0 && (
            <Badge variant="secondary">{pendingCount}</Badge>
          )}
        </CardTitle>
        <Link to="/app/calls">
          <Button variant="ghost" size="sm">
            Alle anzeigen
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {topItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Keine Calls für heute geplant.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {item.priority_rank}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate">
                      {item.lead?.first_name} {item.lead?.last_name}
                    </span>
                  </div>
                  {item.lead?.company && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate">{item.lead.company}</span>
                    </div>
                  )}
                </div>

                {item.reason && (
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {item.reason}
                  </Badge>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAsCalled({ itemId: item.id })}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
