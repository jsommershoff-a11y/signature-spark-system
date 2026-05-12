import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
  CrmTask,
  TaskType,
  UpdateTaskInput,
  TASK_TYPE_LABELS,
} from '@/types/crm';

const formSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().optional(),
  type: z.enum(Object.keys(TASK_TYPE_LABELS) as [TaskType, ...TaskType[]]),
  due_at: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateTaskInput) => Promise<CrmTask | null>;
  task: CrmTask | null;
}

function toDateTimeLocal(iso?: string): string {
  if (!iso) return '';
  return format(new Date(iso), "yyyy-MM-dd'T'HH:mm");
}

export function EditTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
}: EditTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'call',
      due_at: '',
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description ?? '',
        type: task.type,
        due_at: toDateTimeLocal(task.due_at),
      });
    }
  }, [task, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!task) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        id: task.id,
        title: values.title,
        description: values.description,
        type: values.type,
        due_at: values.due_at ? new Date(values.due_at).toISOString() : null,
      });
      if (result) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formId = 'edit-task-form';

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Aufgabe bearbeiten"
      description="Aktualisiere die Details dieser Aufgabe."
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
            {isSubmitting ? 'Speichere...' : 'Änderungen speichern'}
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
                <Select onValueChange={field.onChange} value={field.value}>
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
        </form>
      </Form>
    </ResponsiveFormDialog>
  );
}
