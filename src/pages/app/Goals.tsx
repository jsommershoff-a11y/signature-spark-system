import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useGoals, type Goal } from '@/hooks/useGoals';
import { GoalCard } from '@/components/goals/GoalCard';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { GoalDetailModal } from '@/components/goals/GoalDetailModal';

export default function Goals() {
  const [tab, setTab] = useState('active');
  const { goals, isLoading } = useGoals(tab === 'all' ? undefined : tab);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

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
          <TabsTrigger value="active">Aktiv</TabsTrigger>
          <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
          <TabsTrigger value="all">Alle</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <p className="text-muted-foreground">Laden...</p>
          ) : goals.length === 0 ? (
            <p className="text-muted-foreground">Keine Ziele vorhanden.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onClick={() => setSelectedGoal(goal)} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateGoalDialog open={createOpen} onOpenChange={setCreateOpen} />
      <GoalDetailModal goal={selectedGoal} open={!!selectedGoal} onOpenChange={(o) => !o && setSelectedGoal(null)} />
    </div>
  );
}
