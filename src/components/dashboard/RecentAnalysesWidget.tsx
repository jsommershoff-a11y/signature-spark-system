import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { RecentAnalysis } from '@/hooks/useDashboardData';

interface RecentAnalysesWidgetProps {
  analyses: RecentAnalysis[];
  isLoading?: boolean;
}

export function RecentAnalysesWidget({ analyses, isLoading }: RecentAnalysesWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Neueste Analysen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Neueste Analysen</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Noch keine KI-Analysen durchgeführt.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Neueste Analysen</CardTitle>
        <Link to="/app/calls" className="text-primary hover:underline">
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyses.map((analysis) => (
          <Link
            key={analysis.id}
            to={`/app/calls/${analysis.call_id}`}
            className="block p-3 -mx-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(analysis.created_at), {
                      addSuffix: true,
                      locale: de,
                    })}
                  </span>
                  <StructogramBadge type={analysis.primary_type} small />
                </div>
                <p className="text-sm font-medium truncate">
                  {analysis.lead_first_name} {analysis.lead_last_name}
                </p>
                {analysis.lead_company && (
                  <p className="text-xs text-muted-foreground truncate">
                    {analysis.lead_company}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-primary">
                  {analysis.purchase_readiness}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Erfolg: {analysis.success_probability}%
                </p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function StructogramBadge({ type, small }: { type: string; small?: boolean }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    mixed: 'bg-purple-500 text-white',
    unknown: 'bg-gray-500 text-white',
  };

  const label = type === 'red' ? 'ROT' : type === 'green' ? 'GRÜN' : type === 'blue' ? 'BLAU' : type.toUpperCase();

  return (
    <Badge 
      className={`${colorMap[type] || colorMap.unknown} ${small ? 'text-[10px] px-1.5 py-0' : ''}`}
    >
      {label}
    </Badge>
  );
}
