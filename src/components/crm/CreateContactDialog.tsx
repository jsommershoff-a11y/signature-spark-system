import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResponsiveFormDialog } from '@/components/app/ResponsiveFormDialog';

const schema = z.object({
  first_name: z.string().trim().min(1, 'Vorname erforderlich').max(100),
  last_name: z.string().trim().max(100).optional().or(z.literal('')),
  email: z.string().trim().email('Ungültige E-Mail').max(255),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  company: z.string().trim().max(200).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type CreateContactValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateContactValues) => Promise<void>;
}

export function CreateContactDialog({ open, onOpenChange, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<CreateContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: '', last_name: '', email: '', phone: '', company: '', notes: '' },
  });

  const handle = async (values: CreateContactValues) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Neuer Kontakt"
      description="Lege einen potenziellen Kunden an. Status: Kontakt (noch nicht in Pipeline)."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handle)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="first_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Vorname *</FormLabel>
                <FormControl><Input {...field} maxLength={100} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="last_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nachname</FormLabel>
                <FormControl><Input {...field} maxLength={100} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail *</FormLabel>
              <FormControl><Input type="email" {...field} maxLength={255} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl><Input {...field} maxLength={50} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="company" render={({ field }) => (
              <FormItem>
                <FormLabel>Firma</FormLabel>
                <FormControl><Input {...field} maxLength={200} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel>Notizen</FormLabel>
              <FormControl><Textarea {...field} maxLength={2000} rows={3} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichern…' : 'Kontakt anlegen'}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveFormDialog>
  );
}
