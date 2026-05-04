import { useState, useEffect, useCallback, forwardRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOffers } from '@/hooks/useOffers';
import { calculateOfferTotals, formatCents, formatEuro } from '@/types/offers';
import type { OfferLineItem, OfferContent, DiscoveryData, OfferMode, VariableOfferData } from '@/types/offers';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Trash2, Loader2, ChevronLeft, ChevronRight, AlertCircle, Check,
} from 'lucide-react';
import { PainPointDiscovery } from './PainPointDiscovery';
import { ProgramThumbnail } from './ProgramThumbnail';
import { OfferPreview } from './OfferPreview';
import { RoiCalculatorForm } from './RoiCalculatorForm';
import type { RoiData } from '@/lib/roi-calc';
import {
  OFFER_MODULES, REQUIRED_MODULES, MODULE_DEPENDENCIES,
  validateOfferPrice, validateModuleSelection, checkModuleDependencies,
  PROGRAM_MIN_PRICES, PROGRAM_LABELS, generateIntroText,
} from '@/lib/offer-modules';
import { generateServiceDescription, DEFAULT_AGB, DEFAULT_WITHDRAWAL_POLICY, VARIABLE_OFFER_AGB_ADDENDUM } from '@/lib/legal-templates';

// =============================================
// Types
// =============================================

interface Lead {
  id: string;
  first_name: string;
  last_name: string | null;
  company: string | null;
  email: string;
}

interface LineItemInput {
  name: string;
  description: string;
  quantity: number;
  unit_price_euro: number;
}

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// =============================================
// Component
// =============================================

export const CreateOfferDialog = forwardRef<HTMLDivElement, CreateOfferDialogProps>(function CreateOfferDialog({ open, onOpenChange }, _ref) {
  const { createOffer, isCreating } = useOffers();
  const [step, setStep] = useState(0);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSearch, setLeadSearch] = useState('');

  // Step 0: Lead selection + Discovery
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);

  // Step 1: Program
  const [offerMode, setOfferMode] = useState<OfferMode>('performance');
  const [durationMonths, setDurationMonths] = useState(6);

  // Step 2: Modules + Line Items (standard) OR Variable data
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [lineItems, setLineItems] = useState<LineItemInput[]>([
    { name: '', description: '', quantity: 1, unit_price_euro: 0 },
  ]);
  const [discountEuro, setDiscountEuro] = useState(0);
  const [discountReason, setDiscountReason] = useState('');
  const [taxRate, setTaxRate] = useState(19);

  // Variable offer fields
  const [expectedService, setExpectedService] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [estimatedCostEuro, setEstimatedCostEuro] = useState(0);
  const [additionalCostNote, setAdditionalCostNote] = useState(
    'Sollte sich während der Umsetzung herausstellen, dass der geschätzte Aufwand überschritten wird, werden Sie vorab informiert und eine Freigabe eingeholt. Ohne Ihre Zustimmung entstehen keine Mehrkosten über 15% der ursprünglichen Schätzung.'
  );

  // Step 3: Payment
  const [paymentType, setPaymentType] = useState<'one_time' | 'installments'>('one_time');
  const [installments, setInstallments] = useState(3);
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'copecart'>('stripe');

  // Notes
  const [notes, setNotes] = useState('');

  // Validation
  const [priceError, setPriceError] = useState('');

  const isVariable = offerMode === 'variable';

  // Dynamic steps based on mode
  const getSteps = () => {
    if (isVariable) {
      return ['Programmauswahl', 'Leistung & Kosten', 'Zahlung', 'Zusammenfassung'] as const;
    }
    return ['Bedarfsermittlung', 'Programmauswahl', 'Bausteine & Positionen', 'Zahlung', 'Zusammenfassung'] as const;
  };

  const STEPS = getSteps();
  const maxStep = STEPS.length - 1;

  // ---- Load leads ----
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

  // ---- Reset on close ----
  useEffect(() => {
    if (!open) {
      setStep(0);
      setSelectedLeadId('');
      setDiscoveryData(null);
      setOfferMode('performance');
      setDurationMonths(6);
      setSelectedModules([]);
      setLineItems([{ name: '', description: '', quantity: 1, unit_price_euro: 0 }]);
      setDiscountEuro(0);
      setDiscountReason('');
      setTaxRate(19);
      setPaymentType('one_time');
      setInstallments(3);
      setPaymentProvider('stripe');
      setNotes('');
      setPriceError('');
      setExpectedService('');
      setEstimatedCompletion('');
      setEstimatedCostEuro(0);
      setAdditionalCostNote(
        'Sollte sich während der Umsetzung herausstellen, dass der geschätzte Aufwand überschritten wird, werden Sie vorab informiert und eine Freigabe eingeholt. Ohne Ihre Zustimmung entstehen keine Mehrkosten über 15% der ursprünglichen Schätzung.'
      );
    }
  }, [open]);

  // ---- Init required modules when mode changes ----
  useEffect(() => {
    if (!isVariable) {
      setSelectedModules(REQUIRED_MODULES[offerMode]);
    }
    // Reset step when switching modes
    if (isVariable && step > 0) {
      setStep(0);
    }
  }, [offerMode]);

  // ---- Computed totals (standard mode) ----
  const computedLineItems: OfferLineItem[] = lineItems.map(item => ({
    name: item.name,
    description: item.description || undefined,
    quantity: item.quantity,
    unit_price_cents: Math.round(item.unit_price_euro * 100),
    total_cents: Math.round(item.quantity * item.unit_price_euro * 100),
  }));

  const discountCents = Math.round(discountEuro * 100);
  const totals = isVariable
    ? { subtotal: Math.round(estimatedCostEuro * 100), tax: Math.round(estimatedCostEuro * 100 * taxRate / 100), total: Math.round(estimatedCostEuro * 100 * (1 + taxRate / 100)) }
    : calculateOfferTotals(computedLineItems, discountCents, taxRate);
  const minPrice = PROGRAM_MIN_PRICES[offerMode];
  const minPriceEuro = minPrice / 100;

  // ---- Validate price ----
  useEffect(() => {
    if (isVariable) {
      setPriceError('');
      return;
    }
    const validation = validateOfferPrice(offerMode, totals.total);
    setPriceError(validation.valid ? '' : validation.message || '');
  }, [totals.total, offerMode, isVariable]);

  // ---- Helpers ----
  const selectedLead = leads.find(l => l.id === selectedLeadId);
  const filteredLeads = leadSearch
    ? leads.filter(l =>
        l.first_name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.last_name?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.company?.toLowerCase().includes(leadSearch.toLowerCase())
      )
    : leads;

  const toggleModule = (moduleId: string) => {
    const required = REQUIRED_MODULES[offerMode];
    if (required.includes(moduleId)) return;
    setSelectedModules(prev =>
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  const canProceed = (): boolean => {
    if (isVariable) {
      switch (step) {
        case 0: return !!selectedLeadId && !!offerMode;
        case 1: return !!expectedService && estimatedCostEuro > 0;
        case 2: return true;
        case 3: return true;
        default: return true;
      }
    }
    switch (step) {
      case 0: return !!selectedLeadId;
      case 1: return !!offerMode;
      case 2: return lineItems.some(li => li.name && li.unit_price_euro > 0);
      case 3: return true;
      case 4: return !priceError;
      default: return true;
    }
  };

  // ---- Build offer content ----
  const buildOfferContent = useCallback((): Partial<OfferContent> => {
    const customerName = selectedLead
      ? `${selectedLead.first_name} ${selectedLead.last_name || ''}`.trim()
      : '';

    if (isVariable) {
      const variableData: VariableOfferData = {
        expected_service: expectedService,
        estimated_completion: estimatedCompletion,
        estimated_cost_cents: Math.round(estimatedCostEuro * 100),
        additional_cost_note: additionalCostNote,
        progress_percent: 0,
        progress_updates: [],
      };

      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);

      return {
        title: 'Variables Angebot',
        subtitle: expectedService.substring(0, 60),
        valid_until: defaultDate.toISOString().split('T')[0],
        offer_mode: 'variable',
        customer: {
          name: customerName,
          company: selectedLead?.company || undefined,
          email: selectedLead?.email || '',
        },
        intro_text: generateIntroText('variable', customerName),
        line_items: [{
          name: expectedService.substring(0, 80),
          description: expectedService,
          quantity: 1,
          unit_price_cents: Math.round(estimatedCostEuro * 100),
          total_cents: Math.round(estimatedCostEuro * 100),
        }],
        subtotal_cents: Math.round(estimatedCostEuro * 100),
        tax_rate: taxRate,
        tax_cents: Math.round(estimatedCostEuro * 100 * taxRate / 100),
        total_cents: Math.round(estimatedCostEuro * 100 * (1 + taxRate / 100)),
        payment_terms: { type: paymentType, installments: paymentType === 'installments' ? installments : undefined },
        payment_provider_choice: paymentProvider,
        service_description: generateServiceDescription('variable', []),
        terms_and_conditions: DEFAULT_AGB + VARIABLE_OFFER_AGB_ADDENDUM,
        withdrawal_policy: DEFAULT_WITHDRAWAL_POLICY,
        variable_offer_data: variableData,
      };
    }

    const serviceDesc = generateServiceDescription(offerMode, selectedModules);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);

    return {
      title: `KI-Automationen – ${PROGRAM_LABELS[offerMode]}`,
      subtitle: `${durationMonths} Monate Laufzeit`,
      valid_until: defaultDate.toISOString().split('T')[0],
      offer_mode: offerMode,
      duration_months: durationMonths,
      selected_modules: selectedModules,
      customer: {
        name: customerName,
        company: selectedLead?.company || undefined,
        email: selectedLead?.email || '',
      },
      intro_text: generateIntroText(offerMode, customerName),
      line_items: computedLineItems.filter(li => li.name),
      subtotal_cents: totals.subtotal,
      discount_cents: discountCents,
      discount_reason: discountReason || undefined,
      tax_rate: taxRate,
      tax_cents: totals.tax,
      total_cents: totals.total,
      payment_terms: {
        type: paymentType,
        installments: paymentType === 'installments' ? installments : undefined,
      },
      payment_provider_choice: paymentProvider,
      service_description: serviceDesc,
      terms_and_conditions: DEFAULT_AGB,
      withdrawal_policy: DEFAULT_WITHDRAWAL_POLICY,
      discovery_data: discoveryData || undefined,
    };
  }, [
    selectedLead, offerMode, durationMonths, selectedModules, computedLineItems,
    totals, discountCents, discountReason, taxRate, paymentType, installments,
    paymentProvider, discoveryData, isVariable, expectedService, estimatedCompletion,
    estimatedCostEuro, additionalCostNote,
  ]);

  // ---- Submit ----
  const handleSubmit = async () => {
    if (!isVariable && priceError) return;
    if (!selectedLeadId) return;

    await createOffer({
      lead_id: selectedLeadId,
      offer_json: buildOfferContent(),
      notes: notes || undefined,
    });

    onOpenChange(false);
  };

  // =============================================
  // RENDER: Lead + Program selection (shared first step for variable)
  // =============================================

  const renderLeadAndProgramStep = () => (
    <div className="space-y-6">
      {/* Lead Selection */}
      <div className="space-y-2">
        <Label>Lead auswählen *</Label>
        <Select onValueChange={setSelectedLeadId} value={selectedLeadId}>
          <SelectTrigger>
            <SelectValue placeholder="Lead auswählen..." />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2">
              <Input
                placeholder="Suchen..."
                value={leadSearch}
                onChange={e => setLeadSearch(e.target.value)}
                className="mb-2"
              />
            </div>
            {filteredLeads.map(lead => (
              <SelectItem key={lead.id} value={lead.id}>
                {lead.first_name} {lead.last_name || ''}{' '}
                {lead.company ? `(${lead.company})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium mb-3">Programmauswahl</h3>
        <div className="grid grid-cols-3 gap-3">
          <ProgramThumbnail
            mode="performance"
            selected={offerMode === 'performance'}
            onSelect={() => setOfferMode('performance')}
          />
          <ProgramThumbnail
            mode="rocket_performance"
            selected={offerMode === 'rocket_performance'}
            onSelect={() => setOfferMode('rocket_performance')}
          />
          <ProgramThumbnail
            mode="variable"
            selected={offerMode === 'variable'}
            onSelect={() => setOfferMode('variable')}
          />
        </div>
      </div>

      {!isVariable && (
        <>
          <div className="space-y-2">
            <Label>Laufzeit (Monate)</Label>
            <Select value={String(durationMonths)} onValueChange={v => setDurationMonths(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Monate</SelectItem>
                <SelectItem value="6">6 Monate</SelectItem>
                <SelectItem value="9">9 Monate</SelectItem>
                <SelectItem value="12">12 Monate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Mindestpreis: <span className="font-medium">{formatEuro(minPriceEuro)}</span> netto
          </p>
        </>
      )}
    </div>
  );

  // =============================================
  // RENDER: Standard steps
  // =============================================

  const renderStandardStep0 = () => (
    <div className="space-y-6">
      {/* Lead Selection */}
      <div className="space-y-2">
        <Label>Lead auswählen *</Label>
        <Select onValueChange={setSelectedLeadId} value={selectedLeadId}>
          <SelectTrigger>
            <SelectValue placeholder="Lead auswählen..." />
          </SelectTrigger>
          <SelectContent>
            <div className="p-2">
              <Input
                placeholder="Suchen..."
                value={leadSearch}
                onChange={e => setLeadSearch(e.target.value)}
                className="mb-2"
              />
            </div>
            {filteredLeads.map(lead => (
              <SelectItem key={lead.id} value={lead.id}>
                {lead.first_name} {lead.last_name || ''}{' '}
                {lead.company ? `(${lead.company})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Bedarfsermittlung</h3>
          <Badge variant="secondary" className="text-xs">Optional</Badge>
        </div>
        <PainPointDiscovery
          onComplete={setDiscoveryData}
          initialData={discoveryData || undefined}
        />
      </div>
    </div>
  );

  const renderStandardStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Programmauswahl</h3>
        <div className="grid grid-cols-3 gap-3">
          <ProgramThumbnail mode="performance" selected={offerMode === 'performance'} onSelect={() => setOfferMode('performance')} />
          <ProgramThumbnail mode="rocket_performance" selected={offerMode === 'rocket_performance'} onSelect={() => setOfferMode('rocket_performance')} />
          <ProgramThumbnail mode="variable" selected={offerMode === 'variable'} onSelect={() => setOfferMode('variable')} />
        </div>
      </div>
      {!isVariable && (
        <>
          <div className="space-y-2">
            <Label>Laufzeit (Monate)</Label>
            <Select value={String(durationMonths)} onValueChange={v => setDurationMonths(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Monate</SelectItem>
                <SelectItem value="6">6 Monate</SelectItem>
                <SelectItem value="9">9 Monate</SelectItem>
                <SelectItem value="12">12 Monate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Mindestpreis: <span className="font-medium">{formatEuro(minPriceEuro)}</span> netto
          </p>
        </>
      )}
    </div>
  );

  const renderStandardStep2 = () => {
    const requiredModules = REQUIRED_MODULES[offerMode];
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Bausteine</h3>
          <div className="grid grid-cols-2 gap-2">
            {OFFER_MODULES.map(mod => {
              const isRequired = requiredModules.includes(mod.id);
              const isSelected = selectedModules.includes(mod.id);
              const deps = checkModuleDependencies(mod.id, selectedModules);
              const isDisabled = isRequired || !deps.satisfied;
              return (
                <div key={mod.id} className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${isSelected ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleModule(mod.id)} disabled={isDisabled} />
                  <div className="min-w-0">
                    <p className="font-medium leading-tight">
                      {mod.label}
                      {isRequired && <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">Pflicht</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                    {!deps.satisfied && <p className="text-xs text-destructive mt-0.5">Benötigt: {deps.requires.join(', ')}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Positionen</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => setLineItems(prev => [...prev, { name: '', description: '', quantity: 1, unit_price_euro: 0 }])}>
              <Plus className="h-4 w-4 mr-1" /> Position
            </Button>
          </div>
          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Position {index + 1}</span>
                  {lineItems.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLineItems(prev => prev.filter((_, i) => i !== index))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input placeholder="Bezeichnung" value={item.name} onChange={e => { const u = [...lineItems]; u[index] = { ...u[index], name: e.target.value }; setLineItems(u); }} />
                <Input placeholder="Beschreibung (optional)" value={item.description} onChange={e => { const u = [...lineItems]; u[index] = { ...u[index], description: e.target.value }; setLineItems(u); }} />
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Menge</Label><Input type="number" min={1} value={item.quantity} onChange={e => { const u = [...lineItems]; u[index] = { ...u[index], quantity: Number(e.target.value) || 1 }; setLineItems(u); }} /></div>
                  <div><Label className="text-xs">Einzelpreis (€)</Label><Input type="number" min={0} step="0.01" value={item.unit_price_euro} onChange={e => { const u = [...lineItems]; u[index] = { ...u[index], unit_price_euro: Number(e.target.value) || 0 }; setLineItems(u); }} /></div>
                </div>
                <p className="text-xs text-muted-foreground text-right">Gesamt: {formatEuro(item.quantity * item.unit_price_euro)}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-3">
          <div><Label className="text-xs">Rabatt (€)</Label><Input type="number" min={0} step="0.01" value={discountEuro} onChange={e => setDiscountEuro(Number(e.target.value) || 0)} /></div>
          <div><Label className="text-xs">Rabattgrund</Label><Input placeholder="z.B. Frühbucher" value={discountReason} onChange={e => setDiscountReason(e.target.value)} /></div>
          <div><Label className="text-xs">MwSt (%)</Label><Input type="number" min={0} max={100} value={taxRate} onChange={e => setTaxRate(Number(e.target.value) || 19)} /></div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Zwischensumme:</span><span>{formatCents(totals.subtotal)}</span></div>
          {discountCents > 0 && <div className="flex justify-between text-primary"><span>Rabatt:</span><span>-{formatCents(discountCents)}</span></div>}
          <div className="flex justify-between"><span>MwSt ({taxRate}%):</span><span>{formatCents(totals.tax)}</span></div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold"><span>Gesamt:</span><span>{formatCents(totals.total)}</span></div>
          {priceError && <div className="flex items-center gap-2 text-destructive mt-2"><AlertCircle className="h-4 w-4" /><span className="text-xs">{priceError}</span></div>}
        </div>
      </div>
    );
  };

  // =============================================
  // RENDER: Variable-specific step
  // =============================================

  const renderVariableServiceStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Erwartete Leistung *</Label>
        <Textarea
          placeholder="Beschreiben Sie die zu erbringende Leistung..."
          rows={4}
          value={expectedService}
          onChange={e => setExpectedService(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Voraussichtlicher Fertigstellungszeitpunkt</Label>
        <Input
          placeholder="z.B. 2 Wochen nach Auftragserteilung"
          value={estimatedCompletion}
          onChange={e => setEstimatedCompletion(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Geschätzte Kosten (€ netto) *</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={estimatedCostEuro}
            onChange={e => setEstimatedCostEuro(Number(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label>MwSt (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={taxRate}
            onChange={e => setTaxRate(Number(e.target.value) || 19)}
          />
        </div>
      </div>

      {estimatedCostEuro > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
          <div className="flex justify-between"><span>Netto:</span><span>{formatEuro(estimatedCostEuro)}</span></div>
          <div className="flex justify-between"><span>MwSt ({taxRate}%):</span><span>{formatEuro(estimatedCostEuro * taxRate / 100)}</span></div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold"><span>Brutto:</span><span>{formatEuro(estimatedCostEuro * (1 + taxRate / 100))}</span></div>
        </div>
      )}

      <Separator />

      <div className="space-y-2">
        <Label>Hinweis auf Mehrkosten</Label>
        <Textarea
          rows={3}
          value={additionalCostNote}
          onChange={e => setAdditionalCostNote(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Dieser Hinweis wird dem Kunden im Angebot angezeigt und ist Teil der AGB.
        </p>
      </div>
    </div>
  );

  // =============================================
  // RENDER: Payment step (shared)
  // =============================================

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Zahlungsweise</Label>
        <Select value={paymentType} onValueChange={v => setPaymentType(v as 'one_time' | 'installments')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="one_time">Einmalzahlung</SelectItem>
            {!isVariable && <SelectItem value="installments">Ratenzahlung</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {paymentType === 'installments' && !isVariable && (
        <div className="space-y-2">
          <Label>Anzahl Raten</Label>
          <Select value={String(installments)} onValueChange={v => setInstallments(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Raten</SelectItem>
              <SelectItem value="6">6 Raten</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator />

      <div className="space-y-2">
        <Label>Zahlungsanbieter</Label>
        <Select value={paymentProvider} onValueChange={v => setPaymentProvider(v as 'stripe' | 'copecart')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="copecart">CopeCart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Interne Notizen</Label>
        <Textarea placeholder="Interne Anmerkungen..." rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
    </div>
  );

  // =============================================
  // RENDER: Summary step (shared)
  // =============================================

  const renderSummaryStep = () => {
    const content = buildOfferContent() as OfferContent;
    return (
      <div className="space-y-4">
        <OfferPreview content={content} />
        {priceError && (
          <div className="flex items-center gap-2 text-destructive p-3 rounded-lg border border-destructive/30 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{priceError}</span>
          </div>
        )}
      </div>
    );
  };

  // =============================================
  // RENDER: Current step dispatch
  // =============================================

  const renderCurrentStep = () => {
    if (isVariable) {
      switch (step) {
        case 0: return renderLeadAndProgramStep();
        case 1: return renderVariableServiceStep();
        case 2: return renderPaymentStep();
        case 3: return renderSummaryStep();
        default: return null;
      }
    }
    // Standard flow
    switch (step) {
      case 0: return renderStandardStep0();
      case 1: return renderStandardStep1();
      case 2: return renderStandardStep2();
      case 3: return renderPaymentStep();
      case 4: return renderSummaryStep();
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col sm:rounded-2xl rounded-none">
        <DialogHeader className="px-4 sm:px-6 pt-5 pb-3 border-b border-border/40 shrink-0">
          <DialogTitle>Neues Angebot erstellen</DialogTitle>
          <div className="flex items-center gap-1 mt-2 overflow-x-auto -mx-1 px-1 scrollbar-none">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-1 flex-1 min-w-[28px]">
                <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium shrink-0 ${
                  i < step ? 'bg-primary text-primary-foreground'
                  : i === step ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }`}>
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className={`text-xs truncate hidden md:block ${i === step ? 'font-medium' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border ml-1" />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4">
          {renderCurrentStep()}
        </div>

        <DialogFooter
          className="px-4 sm:px-6 py-3 border-t border-border/40 shrink-0 flex-row justify-between gap-2 sm:gap-2"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div>
            {step > 0 && (
              <Button type="button" variant="outline" size="sm" className="h-11 sm:h-9" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Zurück</span>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" className="h-11 sm:h-9 hidden sm:inline-flex" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            {step < maxStep ? (
              <Button type="button" className="h-11 sm:h-9" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                Weiter <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="button" className="h-11 sm:h-9" onClick={handleSubmit} disabled={isCreating || !!priceError}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Entwurf speichern
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
