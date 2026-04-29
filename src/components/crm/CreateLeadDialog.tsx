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
  CreateLeadInput,
  SOURCE_TYPE_LABELS,
} from '@/types/crm';

const formSchema = z.object({
  first_name: z.string().min(1, 'Vorname ist erforderlich'),
  last_name: z.string().optional(),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website_url: z.string().url('Ungültige URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  location: z.string().optional(),
  source_type: z.enum([
    'inbound_paid',
    'inbound_organic',
    'referral',
    'outbound_ai',
    'outbound_manual',
    'partner',
  ]),
  source_detail: z.string().optional(),
  icp_fit_score: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateLeadInput) => Promise<void>;
}

export function CreateLeadDialog({ open, onOpenChange, onSubmit }: CreateLeadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      website_url: '',
      industry: '',
      location: '',
      source_type: 'inbound_organic',
      source_detail: '',
      notes: '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        website_url: values.website_url || undefined,
      } as CreateLeadInput);
      form.reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formId = 'create-lead-form';
  // Mobile touch-target: 44px minimum (h-11). Desktop reverts to h-10.
  const touchInput = 'h-11 sm:h-10 text-base sm:text-sm';

  return (
    <ResponsiveFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Neuen Lead erstellen"
      description="Füge einen neuen Lead zum CRM hinzu."
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
            {isSubmitting ? 'Erstelle...' : 'Lead erstellen'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vorname *</FormLabel>
                  <FormControl>
                    <Input placeholder="Max" autoComplete="given-name" className={touchInput} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nachname</FormLabel>
                  <FormControl>
                    <Input placeholder="Mustermann" autoComplete="family-name" className={touchInput} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="max@beispiel.de"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+49 123 456789"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firma</FormLabel>
                  <FormControl>
                    <Input placeholder="Beispiel GmbH" autoComplete="organization" className={touchInput} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      placeholder="https://beispiel.de"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branche</FormLabel>
                  <FormControl>
                    <Input placeholder="IT / Software" className={touchInput} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Standort</FormLabel>
                  <FormControl>
                    <Input placeholder="Berlin, DE" className={touchInput} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="source_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quelle *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 sm:h-10">
                        <SelectValue placeholder="Quelle wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
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
              name="source_detail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quellendetail</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Facebook Ads, Google" className={touchInput} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notizen</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Zusätzliche Informationen zum Lead..."
                    className="min-h-[100px]"
                    {...field}
                  />
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
