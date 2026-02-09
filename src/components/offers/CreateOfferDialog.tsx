import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useOffers } from '@/hooks/useOffers';
import { calculateOfferTotals, formatCents } from '@/types/offers';
import type { OfferLineItem, OfferContent } from '@/types/offers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const lineItemSchema = z.object({
  name: z.string().min(1, 'Name erforderlich').max(200),
  description: z.string().max(500).optional(),
  quantity: z.coerce.number().min(1, 'Mindestens 1'),
  unit_price_cents: z.coerce.number().min(0, 'Preis erforderlich'),
});

const formSchema = z.object({
  lead_id: z.string().min(1, 'Lead auswählen'),
  title: z.string().min(1, 'Titel erforderlich').max(200),
  subtitle: z.string().max(300).optional(),
  valid_until: z.string().min(1, 'Gültigkeitsdatum erforderlich'),
  line_items: z.array(lineItemSchema).min(1, 'Mindestens eine Position'),
  discount_cents: z.coerce.number().min(0).default(0),
  discount_reason: z.string().max(200).optional(),
  tax_rate: z.coerce.number().min(0).max(100).default(19),
  payment_type: z.enum(['one_time', 'subscription', 'installments']),
  payment_frequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  installments: z.coerce.number().min(2).optional(),
  notes: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Lead {
  id: string;
  first_name: string;
  last_name: string | null;
  company: string | null;
  email: string;
}

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOfferDialog({ open, onOpenChange }: CreateOfferDialogProps) {
  const { createOffer, isCreating } = useOffers();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSearch, setLeadSearch] = useState('');

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lead_id: '',
      title: '',
      subtitle: '',
      valid_until: defaultDate.toISOString().split('T')[0],
      line_items: [{ name: '', description: '', quantity: 1, unit_price_cents: 0 }],
      discount_cents: 0,
      discount_reason: '',
      tax_rate: 19,
      payment_type: 'one_time',
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'line_items',
  });

  // Load leads
  useEffect(() => {
    if (!open) return;
    const fetchLeads = async () => {
      const { data } = await supabase
        .from('crm_leads')
        .select('id, first_name, last_name, company, email')
        .order('first_name');
      if (data) setLeads(data);
    };
    fetchLeads();
  }, [open]);

  const watchedItems = form.watch('line_items');
  const watchedDiscount = form.watch('discount_cents') || 0;
  const watchedTaxRate = form.watch('tax_rate') || 19;

  const computedItems: OfferLineItem[] = (watchedItems || []).map((item) => ({
    name: item.name || '',
    description: item.description,
    quantity: item.quantity || 0,
    unit_price_cents: item.unit_price_cents || 0,
    total_cents: (item.quantity || 0) * (item.unit_price_cents || 0),
  }));

  const totals = calculateOfferTotals(computedItems, watchedDiscount, watchedTaxRate);

  const filteredLeads = leadSearch
    ? leads.filter(
        (l) =>
          l.first_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
          l.last_name?.toLowerCase().includes(leadSearch.toLowerCase()) ||
          l.company?.toLowerCase().includes(leadSearch.toLowerCase())
      )
    : leads;

  const onSubmit = useCallback(
    async (values: FormValues) => {
      const selectedLead = leads.find((l) => l.id === values.lead_id);

      const lineItems: OfferLineItem[] = values.line_items.map((item) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        total_cents: item.quantity * item.unit_price_cents,
      }));

      const calcTotals = calculateOfferTotals(
        lineItems,
        values.discount_cents,
        values.tax_rate
      );

      const offerJson: Partial<OfferContent> = {
        title: values.title,
        subtitle: values.subtitle,
        valid_until: values.valid_until,
        customer: {
          name: selectedLead
            ? `${selectedLead.first_name} ${selectedLead.last_name || ''}`.trim()
            : '',
          company: selectedLead?.company || undefined,
          email: selectedLead?.email || '',
        },
        line_items: lineItems,
        subtotal_cents: calcTotals.subtotal,
        discount_cents: values.discount_cents || 0,
        discount_reason: values.discount_reason,
        tax_rate: values.tax_rate,
        tax_cents: calcTotals.tax,
        total_cents: calcTotals.total,
        payment_terms: {
          type: values.payment_type,
          frequency: values.payment_type === 'subscription' ? values.payment_frequency : undefined,
          installments: values.payment_type === 'installments' ? values.installments : undefined,
        },
      };

      await createOffer({
        lead_id: values.lead_id,
        offer_json: offerJson,
        notes: values.notes,
      });

      form.reset();
      onOpenChange(false);
    },
    [createOffer, form, leads, onOpenChange]
  );

  const paymentType = form.watch('payment_type');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Angebot erstellen</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Lead Selection */}
            <FormField
              control={form.control}
              name="lead_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Lead auswählen..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Suchen..."
                          value={leadSearch}
                          onChange={(e) => setLeadSearch(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {filteredLeads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.first_name} {lead.last_name || ''}{' '}
                          {lead.company ? `(${lead.company})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Premium Paket" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gültig bis *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Untertitel</FormLabel>
                  <FormControl>
                    <Input placeholder="Optionaler Untertitel..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Positionen *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ name: '', description: '', quantity: 1, unit_price_cents: 0 })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Position
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-muted-foreground">Position {index + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <FormField
                      control={form.control}
                      name={`line_items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Bezeichnung" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`line_items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Beschreibung (optional)" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`line_items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Menge</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`line_items.${index}.unit_price_cents`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Einzelpreis (Cent)</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      Gesamt: {formatCents(computedItems[index]?.total_cents || 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Discount + Tax */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="discount_cents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rabatt (Cent)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rabattgrund</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Frühbucher" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MwSt (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Totals Preview */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Zwischensumme:</span>
                <span>{formatCents(totals.subtotal)}</span>
              </div>
              {watchedDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Rabatt:</span>
                  <span>-{formatCents(watchedDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>MwSt ({watchedTaxRate}%):</span>
                <span>{formatCents(totals.tax)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Gesamt:</span>
                <span>{formatCents(totals.total)}</span>
              </div>
            </div>

            {/* Payment Terms */}
            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zahlungsbedingungen</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one_time">Einmalzahlung</SelectItem>
                      <SelectItem value="subscription">Abonnement</SelectItem>
                      <SelectItem value="installments">Ratenzahlung</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {paymentType === 'subscription' && (
              <FormField
                control={form.control}
                name="payment_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequenz</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Frequenz wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                        <SelectItem value="quarterly">Quartalsweise</SelectItem>
                        <SelectItem value="yearly">Jährlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            {paymentType === 'installments' && (
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anzahl Raten</FormLabel>
                    <FormControl>
                      <Input type="number" min={2} max={60} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interne Notizen</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Interne Anmerkungen..." rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Entwurf speichern
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
