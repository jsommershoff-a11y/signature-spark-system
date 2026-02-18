import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useGoalBreakdowns } from '@/hooks/useGoalBreakdowns';
import { useGoals, type Goal } from '@/hooks/useGoals';
import { GoalBreakdownCard } from '@/components/goals/GoalBreakdownCard';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { GoalDetailModal } from '@/components/goals/GoalDetailModal';
import type { GoalBreakdown } from '@/lib/goalBreakdown';

const TABS = [
  { value: 'YEAR', label: 'Jahr' },
  { value: 'HALF_YEAR', label: '6 Monate' },
  { value: 'MONTH', label: 'Monat' },
  { value: 'ALL', label: 'Alle' },
] as const;

export default function Goals() {
  const [searchParams] = useSearchParams();
  const focusGoalId = searchParams.get('goalId');
  const [tab, setTab] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const { breakdowns, byHorizon, isLoading } = useGoalBreakdowns();
  const { goals: allGoals } = useGoals();

  // Scroll to focused goal
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    if (focusGoalId && cardRefs.current[focusGoalId]) {
      cardRefs.current[focusGoalId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusGoalId, breakdowns]);

  const handleCardClick = (b: GoalBreakdown) => {
    const goal = allGoals.find((g) => g.id === b.goalId) ?? null;
    if (goal) setSelectedGoal(goal);
  };

  const displayedBreakdowns = tab === 'ALL' ? breakdowns : (byHorizon[tab as keyof typeof byHorizon] ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ziele</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Ziel
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <p className="text-muted-foreground">Laden...</p>
          ) : displayedBreakdowns.length === 0 ? (
            <p className="text-muted-foreground">Keine aktiven Ziele in diesem Horizont.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedBreakdowns.map((b) => (
                <div
                  key={b.goalId}
                  ref={(el) => { cardRefs.current[b.goalId] = el; }}
                >
                  <GoalBreakdownCard
                    breakdown={b}
                    onClick={() => handleCardClick(b)}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateGoalDialog open={createOpen} onOpenChange={setCreateOpen} />
      <GoalDetailModal
        goal={selectedGoal}
        open={!!selectedGoal}
        onOpenChange={(o) => !o && setSelectedGoal(null)}
      />
    </div>
  );
}
