import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertTriangle } from 'lucide-react';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ResponsiveFormDialog } from '@/components/app/ResponsiveFormDialog';
import { supabase } from '@/integrations/supabase/client';

const schema = z.object({
  first_name: z.string().trim().min(1, 'Vorname erforderlich').max(100),
  last_name: z.string().trim().max(100).optional().or(z.literal('')),
  email: z.string().trim().email('Ungültige E-Mail').max(255),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  company: z.string().trim().max(200).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type CreateContactValues = z.infer<typeof schema>;

type Duplicate = {
  id: string;
  source: string;
  match_type: string;
  full_name: string | null;
  email: string | null;
  company: string | null;
  record_status: string;
};

const STATUS_LABEL: Record<string, string> = {
  customer: 'Kunde',
  lead: 'Lead',
  contact: 'Kontakt',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateContactValues) => Promise<void>;
}

export function CreateContactDialog({ open, onOpenChange, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [checking, setChecking] = useState(false);
  const [forceCreate, setForceCreate] = useState(false);

  const form = useForm<CreateContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: '', last_name: '', email: '', phone: '', company: '', notes: '' },
  });

  const email = form.watch('email');
  const company = form.watch('company');

  // Debounced duplicate check
  useEffect(() => {
    const e = email?.trim();
    const c = company?.trim();
    const validEmail = !!e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
    if (!validEmail && (!c || c.length < 2)) {
      setDuplicates([]);
      return;
    }
    const t = setTimeout(async () => {
      setChecking(true);
      const { data, error } = await supabase.rpc('find_duplicate_contacts' as any, {
        _email: validEmail ? e : null,
        _company: c && c.length >= 2 ? c : null,
      });
      if (!error) setDuplicates((data ?? []) as Duplicate[]);
      setChecking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [email, company]);

  const hasEmailDup = duplicates.some((d) => d.match_type === 'email');

  const handle = async (values: CreateContactValues) => {
    if (hasEmailDup && !forceCreate) return; // Block
    setSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
      setDuplicates([]);
      setForceCreate(false);
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

          {/* Duplicate warning */}
          {duplicates.length > 0 && (
            <div className={`rounded-lg border p-3 space-y-2 ${
              hasEmailDup ? 'border-destructive/50 bg-destructive/5' : 'border-amber-500/50 bg-amber-500/5'
            }`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className={`h-4 w-4 ${hasEmailDup ? 'text-destructive' : 'text-amber-600'}`} />
                {hasEmailDup
                  ? 'E-Mail existiert bereits'
                  : `${duplicates.length} möglicher Treffer mit gleicher Firma`}
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {duplicates.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      {STATUS_LABEL[d.record_status] ?? d.record_status}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      Match: {d.match_type === 'email' ? 'E-Mail' : 'Firma'}
                    </Badge>
                    <span className="truncate">
                      {d.full_name || d.email}{d.company ? ` · ${d.company}` : ''}
                    </span>
                  </div>
                ))}
              </div>
              {hasEmailDup && (
                <label className="flex items-center gap-2 text-xs cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={forceCreate}
                    onChange={(e) => setForceCreate(e.target.checked)}
                  />
                  Trotzdem als neuen Kontakt anlegen
                </label>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting || checking || (hasEmailDup && !forceCreate)}>
              {submitting ? 'Speichern…' : 'Kontakt anlegen'}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveFormDialog>
  );
}
