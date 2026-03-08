import { useGoalBreakdowns } from '@/hooks/useGoalBreakdowns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Phone, Calendar, Handshake, Euro, ArrowRight, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { GoalBreakdown } from '@/lib/goalBreakdown';

const HORIZON_ORDER: Record<string, number> = { MONTH: 0, HALF_YEAR: 1, YEAR: 2 };
const HORIZON_LABELS: Record<string, string> = { YEAR: 'Jahr', HALF_YEAR: '6M', MONTH: 'Monat' };

const UNIT_ICONS: Record<string, React.ReactNode> = {
  Calls: <Phone className="h-5 w-5" />,
  Termine: <Calendar className="h-5 w-5" />,
  Deals: <Handshake className="h-5 w-5" />,
  EUR: <Euro className="h-5 w-5" />,
  '€': <Euro className="h-5 w-5" />,
};

interface GoalReward {
  id: string;
  reward_title: string | null;
  reward_image_url: string | null;
  reward_amount_cents: number | null;
  target_amount_cents: number | null;
  title: string;
}

function formatAmount(cents: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default function GoalsMotivationPanel() {
  const { breakdowns, isLoading } = useGoalBreakdowns();

  // Load reward data for goals
  const goalIds = breakdowns.map((b) => b.goalId);
  const { data: rewards } = useQuery({
    queryKey: ['goal-rewards', goalIds.join(',')],
    queryFn: async () => {
      if (goalIds.length === 0) return [];
      const { data, error } = await supabase
        .from('goals')
        .select('id, title, reward_title, reward_image_url, reward_amount_cents, target_amount_cents')
        .in('id', goalIds);
      if (error) throw error;
      return (data || []) as GoalReward[];
    },
    enabled: goalIds.length > 0,
  });

  const rewardMap = new Map((rewards || []).map((r) => [r.id, r]));

  // Sort by horizon priority (MONTH first), take top 3
  const sorted = [...breakdowns].sort(
    (a, b) => (HORIZON_ORDER[a.horizon] ?? 9) - (HORIZON_ORDER[b.horizon] ?? 9),
  );
  const top3 = sorted.slice(0, 3);

  // Aggregate today's todos by unit
  const todayAgg = new Map<string, { label: string; value: number; unit: string }>();
  for (const b of breakdowns) {
    for (const todo of b.todosToday) {
      const key = todo.unit || todo.label;
      const existing = todayAgg.get(key);
      if (existing) {
        existing.value += todo.value;
      } else {
        todayAgg.set(key, { ...todo });
      }
    }
  }
  const todayItems = Array.from(todayAgg.values());

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Ziele
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 rounded-lg bg-muted" />
            <div className="h-20 rounded-lg bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (breakdowns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Ziele
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Keine aktiven Ziele vorhanden.</p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link to="/app/goals">Ziele verwalten</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Ziele & Motivation
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/app/goals" className="flex items-center gap-1">
            Alle Ziele <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Panel 1: Motivation Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {top3.map((b) => {
            const reward = rewardMap.get(b.goalId);
            return (
              <MotivationCard
                key={b.goalId}
                breakdown={b}
                reward={reward}
                onClick={() => navigate(`/app/goals?goalId=${b.goalId}`)}
              />
            );
          })}
        </div>

        {/* Panel 2: Heute zu tun */}
        {todayItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Heute zu tun
            </h4>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {todayItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <div className="text-primary">
                    {UNIT_ICONS[item.unit] || <Target className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/calls" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Power-Session starten
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MotivationCard({
  breakdown,
  reward,
  onClick,
}: {
  breakdown: GoalBreakdown;
  reward?: GoalReward;
  onClick: () => void;
}) {
  const progressPercent =
    breakdown.targetTotal > 0
      ? Math.min(100, Math.round((breakdown.actualToDate / breakdown.targetTotal) * 100))
      : 0;

  const displayTitle = reward?.reward_title || breakdown.goalTitle;
  const amountCents = reward?.reward_amount_cents || reward?.target_amount_cents;
  const imageUrl = reward?.reward_image_url;

  return (
    <button
      onClick={onClick}
      className="flex gap-3 rounded-lg border bg-card p-3 text-left transition-shadow hover:shadow-md w-full"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={displayTitle}
          className="h-16 w-16 rounded-md object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate">{displayTitle}</span>
          <Badge
            variant={breakdown.status === 'green' ? 'default' : 'destructive'}
            className={
              breakdown.status === 'green'
                ? 'bg-emerald-500/15 text-emerald-700 border-emerald-200 hover:bg-emerald-500/20'
                : ''
            }
          >
            {breakdown.status === 'green' ? '✓' : '!'}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5">
            {HORIZON_LABELS[breakdown.horizon] || breakdown.horizon}
          </Badge>
        </div>
        {amountCents != null && amountCents > 0 && (
          <div className="text-xs font-medium text-primary">
            {formatAmount(amountCents)}
          </div>
        )}
        <Progress value={progressPercent} className="h-1.5" />
        <div className="text-[11px] text-muted-foreground">
          Soll/Tag: <span className="font-semibold text-foreground">{breakdown.requiredPerDay.toFixed(1)}</span>
        </div>
      </div>
    </button>
  );
}
