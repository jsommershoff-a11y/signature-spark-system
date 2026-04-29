import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResponsiveFormDialog } from '@/components/app/ResponsiveFormDialog';
import {
  CreateTaskInput,
  TASK_TYPE_LABELS,
} from '@/types/crm';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().optional(),
  type: z.enum(['call', 'followup', 'review_offer', 'intervention']),
  due_at: z.string().optional(),
  lead_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  leadId?: string;
  leads?: { id: string; name: string }[];
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  leadId,
  leads = [],
}: CreateTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'call',
      due_at: '',
      lead_id: leadId || '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    if (!profile?.id) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        assigned_user_id: profile.id,
        lead_id: values.lead_id || undefined,
        due_at: values.due_at ? new Date(values.due_at).toISOString() : undefined,
      } as CreateTaskInput);
      form.reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formId = 'create-task-form';

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Neue Aufgabe erstellen"
      description="Erstelle eine neue Aufgabe für dich oder dein Team."
      desktopMaxWidth="max-w-md"
      footer={
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 sm:h-10"
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting}
            className="h-11 sm:h-10"
          >
            {isSubmitting ? 'Erstelle...' : 'Aufgabe erstellen'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Typ *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 sm:h-10">
                      <SelectValue placeholder="Typ wählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel *</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Erstgespräch führen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschreibung</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Zusätzliche Details..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fällig am</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {leads.length > 0 && !leadId && (
            <FormField
              control={form.control}
              name="lead_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verknüpfter Lead</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 sm:h-10">
                        <SelectValue placeholder="Lead wählen (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
    </ResponsiveFormDialog>
  );
}
