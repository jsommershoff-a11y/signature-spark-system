import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import { MemberKPI } from '@/types/members';

interface KPISummaryProps {
  currentKPI?: MemberKPI;
  previousKPI?: MemberKPI;
}

function TrendIndicator({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return null;
  
  const diff = current - previous;
  if (diff === 0) return null;
  
  return diff > 0 ? (
    <div className="flex items-center text-green-600 text-sm">
      <TrendingUp className="h-4 w-4 mr-1" />
      +{diff}%
    </div>
  ) : (
    <div className="flex items-center text-red-600 text-sm">
      <TrendingDown className="h-4 w-4 mr-1" />
      {diff}%
    </div>
  );
}

export function KPISummary({ currentKPI, previousKPI }: KPISummaryProps) {
  if (!currentKPI) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deine Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Noch keine KPI-Daten verfügbar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Deine Performance diese Woche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Tasks Completion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Aufgaben</span>
              <TrendIndicator 
                current={currentKPI.tasks_completion_rate} 
                previous={previousKPI?.tasks_completion_rate}
              />
            </div>
            <Progress value={currentKPI.tasks_completion_rate} className="h-3" />
            <p className="text-2xl font-bold">{currentKPI.tasks_completion_rate}%</p>
          </div>

          {/* Lesson Completion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Lektionen</span>
              <TrendIndicator 
                current={currentKPI.lesson_completion_rate} 
                previous={previousKPI?.lesson_completion_rate}
              />
            </div>
            <Progress value={currentKPI.lesson_completion_rate} className="h-3" />
            <p className="text-2xl font-bold">{currentKPI.lesson_completion_rate}%</p>
          </div>

          {/* Activity Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Aktivität
              </span>
              <TrendIndicator 
                current={currentKPI.activity_score} 
                previous={previousKPI?.activity_score}
              />
            </div>
            <Progress value={currentKPI.activity_score} className="h-3" />
            <p className="text-2xl font-bold">{currentKPI.activity_score}/100</p>
          </div>

          {/* Revenue (optional) */}
          {currentKPI.revenue_value !== undefined && currentKPI.revenue_value !== null && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Umsatz</span>
              <p className="text-2xl font-bold">
                {(currentKPI.revenue_value / 100).toLocaleString('de-DE', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </p>
            </div>
          )}
        </div>

        {currentKPI.notes && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{currentKPI.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
