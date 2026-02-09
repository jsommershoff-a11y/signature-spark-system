import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { TaskList } from '@/components/crm/TaskList';
import { CreateTaskDialog } from '@/components/crm/CreateTaskDialog';
import { CrmTask, CreateTaskInput } from '@/types/crm';
import { useAuth } from '@/contexts/AuthContext';

export default function Tasks() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { profile } = useAuth();
  
  const { 
    openTasks, 
    doneTasks,
    blockedTasks,
    loading, 
    createTask,
    completeTask,
    reopenTask,
    deleteTask,
  } = useTasks();

  const handleCreateTask = async (data: CreateTaskInput) => {
    await createTask(data);
  };

  const handleTaskClick = (task: CrmTask) => {
    // TODO: Open task detail modal - placeholder for future implementation
  };

  const handleEditTask = (task: CrmTask) => {
    // TODO: Open edit modal - placeholder for future implementation
  };

  const todayTasks = openTasks.filter(task => {
    if (!task.due_at) return false;
    const dueDate = new Date(task.due_at);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });

  const upcomingTasks = openTasks.filter(task => {
    if (!task.due_at) return true;
    const dueDate = new Date(task.due_at);
    const today = new Date();
    return dueDate.toDateString() !== today.toDateString();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aufgaben</h1>
          <p className="text-muted-foreground">
            Deine anstehenden und erledigten Aufgaben
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Aufgabe
        </Button>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">
            Heute ({todayTasks.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Anstehend ({upcomingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="blocked">
            Blockiert ({blockedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="done">
            Erledigt ({doneTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <TaskList
            tasks={todayTasks}
            loading={loading}
            onComplete={completeTask}
            onReopen={reopenTask}
            onEdit={handleEditTask}
            onDelete={deleteTask}
            onTaskClick={handleTaskClick}
            emptyMessage="Keine Aufgaben für heute"
          />
        </TabsContent>

        <TabsContent value="upcoming">
          <TaskList
            tasks={upcomingTasks}
            loading={loading}
            onComplete={completeTask}
            onReopen={reopenTask}
            onEdit={handleEditTask}
            onDelete={deleteTask}
            onTaskClick={handleTaskClick}
            emptyMessage="Keine anstehenden Aufgaben"
          />
        </TabsContent>

        <TabsContent value="blocked">
          <TaskList
            tasks={blockedTasks}
            loading={loading}
            onComplete={completeTask}
            onReopen={reopenTask}
            onEdit={handleEditTask}
            onDelete={deleteTask}
            onTaskClick={handleTaskClick}
            emptyMessage="Keine blockierten Aufgaben"
          />
        </TabsContent>

        <TabsContent value="done">
          <TaskList
            tasks={doneTasks}
            loading={loading}
            onComplete={completeTask}
            onReopen={reopenTask}
            onEdit={handleEditTask}
            onDelete={deleteTask}
            onTaskClick={handleTaskClick}
            emptyMessage="Keine erledigten Aufgaben"
          />
        </TabsContent>
      </Tabs>

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
