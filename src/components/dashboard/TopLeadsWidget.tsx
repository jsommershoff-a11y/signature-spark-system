import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TopLead } from '@/hooks/useDashboardData';
import { STRUCTOGRAM_LABELS } from '@/types/calls';

interface TopLeadsWidgetProps {
  leads: TopLead[];
  isLoading?: boolean;
}

export function TopLeadsWidget({ leads, isLoading }: TopLeadsWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Top Leads nach Kaufbereitschaft</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Top Leads nach Kaufbereitschaft</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Noch keine analysierten Leads vorhanden.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Top Leads nach Kaufbereitschaft</CardTitle>
        <Link to="/app/leads" className="text-primary hover:underline">
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {leads.map((lead, index) => (
          <div key={lead.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                <div>
                  <p className="text-sm font-medium">
                    {lead.first_name} {lead.last_name}
                  </p>
                  {lead.company && (
                    <p className="text-xs text-muted-foreground">{lead.company}</p>
                  )}
                </div>
              </div>
              <StructogramBadge type={lead.primary_type} />
            </div>
            <div className="flex items-center gap-2">
              <Progress value={lead.purchase_readiness} className="flex-1 h-2" />
              <span className="text-sm font-bold w-12 text-right">
                {lead.purchase_readiness}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Erfolgswahrscheinlichkeit: {lead.success_probability}%
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StructogramBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    mixed: 'bg-purple-500 text-white',
    unknown: 'bg-gray-500 text-white',
  };

  const label = type === 'red' ? 'ROT' : type === 'green' ? 'GRÜN' : type === 'blue' ? 'BLAU' : type.toUpperCase();

  return (
    <Badge className={colorMap[type] || colorMap.unknown}>
      {label}
    </Badge>
  );
}
