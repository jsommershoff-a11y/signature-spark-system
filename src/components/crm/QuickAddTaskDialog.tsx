import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResponsiveFormDialog } from '@/components/app/ResponsiveFormDialog';
import { TASK_TYPE_LABELS } from '@/types/crm';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const schema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['call', 'followup', 'review_offer', 'intervention']),
  due_at: z.string().optional(),
  assigned_user_id: z.string().uuid().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** ID des CRM-Leads ODER des Profils (Mitglied) */
  targetId: string;
  targetSource: 'crm_lead' | 'profile';
  onCreated?: () => void;
  /** Optionale Liste für Zuweisung — wenn leer, wird aktueller User genutzt */
  assignableUsers?: { id: string; name: string }[];
}

export function QuickAddTaskDialog({
  open, onOpenChange, targetId, targetSource, onCreated, assignableUsers = [],
}: Props) {
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      type: 'followup',
      due_at: '',
      assigned_user_id: profile?.id,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    if (!profile?.id) {
      toast.error('Nicht angemeldet.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        title: values.title,
        description: values.description || null,
        type: values.type,
        status: 'open',
        assigned_user_id: values.assigned_user_id || profile.id,
        due_at: values.due_at ? new Date(values.due_at).toISOString() : null,
      };
      if (targetSource === 'crm_lead') payload.lead_id = targetId;
      else payload.member_id = targetId;

      const { error } = await supabase.from('crm_tasks').insert(payload);
      if (error) throw error;

      toast.success('Aufgabe erstellt');
      form.reset({
        title: '', description: '', type: 'followup', due_at: '',
        assigned_user_id: profile.id,
      });
      onOpenChange(false);
      onCreated?.();
    } catch (e: any) {
      toast.error(e?.message ?? 'Aufgabe konnte nicht erstellt werden.');
    } finally {
      setSubmitting(false);
    }
  };

  const formId = 'quickadd-task-form';

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Aufgabe hinzufügen"
      description="Schnell eine Aufgabe für diesen Datensatz anlegen."
      desktopMaxWidth="max-w-md"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 sm:h-10">
            Abbrechen
          </Button>
          <Button type="submit" form={formId} disabled={submitting} className="h-11 sm:h-10">
            {submitting ? 'Erstelle…' : 'Erstellen'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Typ *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 sm:h-10"><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(TASK_TYPE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Titel *</FormLabel>
              <FormControl><Input placeholder="z. B. Rückruf einplanen" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Notiz</FormLabel>
              <FormControl><Textarea placeholder="Kontext oder nächster Schritt…" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="due_at" render={({ field }) => (
            <FormItem>
              <FormLabel>Fällig am</FormLabel>
              <FormControl><Input type="datetime-local" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {assignableUsers.length > 0 && (
            <FormField control={form.control} name="assigned_user_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Zugewiesen an</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 sm:h-10"><SelectValue placeholder="User wählen" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assignableUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          )}
        </form>
      </Form>
    </ResponsiveFormDialog>
  );
}
