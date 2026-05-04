// Offer & Order Type Definitions

// =============================================
// ENUMS
// =============================================

export type OfferMode = 'performance' | 'rocket_performance' | 'variable';
export type OfferStatus = 'draft' | 'pending_review' | 'approved' | 'sent' | 'viewed' | 'accepted' | 'paid' | 'expired';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type PaymentProvider = 'stripe' | 'copecart' | 'bank_transfer' | 'manual';

// =============================================
// DISCOVERY DATA (Pain-Point Erfassung)
// =============================================

export interface DiscoveryPainPoint {
  id: string;
  label: string;
  selected: boolean;
  severity?: number; // 1 = kritisch, 10 = funktioniert gut
  notes?: string;
}

export interface BudgetResponse {
  question: string;
  range?: string;
  freetext?: string;
}

export type StructogramQuickType = 'rot' | 'gruen' | 'blau' | 'mixed';
export type UrgencyLevel = 'sofort' | '2_4_wochen' | '1_3_monate';
export type TeamAvailability = 'ja' | 'teilweise' | 'nein';

export interface DiscoveryData {
  pain_points: DiscoveryPainPoint[];
  budget_responses: BudgetResponse[];
  urgency: UrgencyLevel;
  structogram_type: StructogramQuickType;
  has_team: TeamAvailability;
  recommended_mode?: OfferMode;
  notes?: string;
}

// =============================================
// VARIABLE OFFER DATA
// =============================================

export interface ProgressUpdate {
  date: string;
  text: string;
  author: string;
  published: boolean;
}

export interface VariableOfferData {
  expected_service: string;
  estimated_completion: string;
  estimated_cost_cents: number;
  additional_cost_note: string;
  progress_percent: number;
  progress_updates: ProgressUpdate[];
}

// =============================================
// OFFER JSON SCHEMA
// =============================================

export interface OfferLineItem {
  name: string;
  description?: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

export interface OfferPaymentTerms {
  type: 'one_time' | 'installments';
  installments?: number; // 3 or 6
}

export interface OfferAiGenerated {
  personalized_intro: string;
  value_propositions: string[];
  objection_responses: Record<string, string>;
  urgency_message?: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  ust_id: string;
  hrb: string;
  geschaeftsfuehrer: string;
}

export interface OfferContent {
  // Header
  title: string;
  subtitle?: string;
  valid_until: string;
  
  // Program
  offer_mode?: OfferMode;
  duration_months?: number;
  selected_modules?: string[];
  
  // Company
  company_info?: CompanyInfo;
  
  // Kunde
  customer: {
    name: string;
    company?: string;
    email: string;
  };
  
  // Intro
  intro_text?: string;
  
  // Produkte/Leistungen
  line_items: OfferLineItem[];
  
  // Zusammenfassung
  subtotal_cents: number;
  discount_cents?: number;
  discount_reason?: string;
  tax_rate: number;
  tax_cents: number;
  total_cents: number;
  
  // Zahlungsbedingungen
  payment_terms: OfferPaymentTerms;
  payment_provider_choice?: 'stripe' | 'copecart';
  
  // Legal
  service_description?: string;
  terms_and_conditions?: string;
  withdrawal_policy?: string;
  
  // Contract acceptance
  contract_accepted?: boolean;
  contract_accepted_at?: string;
  signature_data?: string;
  signer_name?: string;
  
  // Discovery
  discovery_data?: DiscoveryData;
  
  // Variable Offer Data
  variable_offer_data?: VariableOfferData;
  
  // Kosten-Nutzen-Rechnung (ROI)
  roi_data?: import('@/lib/roi-calc').RoiData;
  
  // KI-generierte Inhalte
  ai_generated?: OfferAiGenerated;
  
  // Validity
  validity_note?: string;
  attachments_note?: string;
  
  // Legacy
  terms_accepted_at?: string;
  signature_url?: string;
}

// =============================================
// INTERFACES
// =============================================

export interface Offer {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  analysis_id?: string;
  created_by?: string;
  approved_by?: string;
  status: OfferStatus;
  approved_at?: string;
  sent_at?: string;
  viewed_at?: string;
  expires_at?: string;
  offer_json: OfferContent;
  public_token?: string;
  payment_unlocked: boolean;
  payment_unlocked_at?: string;
  payment_unlocked_by?: string;
  notes?: string;
  version: number;
  // Joined data
  lead?: {
    id: string;
    first_name: string;
    last_name?: string;
    email: string;
    company?: string;
  };
  creator?: {
    id: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
  approver?: {
    id: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  offer_id?: string;
  lead_id: string;
  member_id?: string;
  provider: PaymentProvider;
  provider_order_id?: string;
  provider_customer_id?: string;
  amount_cents: number;
  currency: string;
  status: OrderStatus;
  paid_at?: string;
  failed_at?: string;
  refunded_at?: string;
  metadata?: Record<string, unknown>;
  error_message?: string;
  // Joined data
  offer?: Offer;
  lead?: {
    id: string;
    first_name: string;
    last_name?: string;
    email: string;
    company?: string;
  };
}

// =============================================
// FORM TYPES
// =============================================

export interface CreateOfferInput {
  lead_id: string;
  analysis_id?: string;
  offer_json: Partial<OfferContent>;
  notes?: string;
}

export interface UpdateOfferInput {
  id: string;
  status?: OfferStatus;
  offer_json?: OfferContent;
  approved_by?: string;
  approved_at?: string;
  sent_at?: string;
  payment_unlocked?: boolean;
  payment_unlocked_by?: string;
  notes?: string;
}

// =============================================
// UI LABELS
// =============================================

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  draft: 'Entwurf',
  pending_review: 'In Prüfung',
  approved: 'Genehmigt',
  sent: 'Gesendet',
  viewed: 'Angesehen',
  accepted: 'Angenommen',
  paid: 'Bezahlt',
  expired: 'Abgelaufen',
};

export const OFFER_STATUS_COLORS: Record<OfferStatus, string> = {
  draft: 'bg-gray-500',
  pending_review: 'bg-yellow-500',
  approved: 'bg-blue-500',
  sent: 'bg-purple-500',
  viewed: 'bg-indigo-500',
  accepted: 'bg-emerald-500',
  paid: 'bg-green-600',
  expired: 'bg-red-500',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Ausstehend',
  paid: 'Bezahlt',
  failed: 'Fehlgeschlagen',
  refunded: 'Erstattet',
  cancelled: 'Storniert',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500',
  paid: 'bg-green-500',
  failed: 'bg-red-500',
  refunded: 'bg-orange-500',
  cancelled: 'bg-gray-500',
};

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  stripe: 'Stripe',
  copecart: 'CopeCart',
  bank_transfer: 'Banküberweisung',
  manual: 'Manuell',
};

export const OFFER_MODE_LABELS: Record<OfferMode, string> = {
  performance: 'Performance',
  rocket_performance: 'Rocket Performance',
  variable: 'Variables Angebot',
};

// =============================================
// HELPER FUNCTIONS
// =============================================

export function formatCents(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function formatEuro(euros: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros);
}

export function calculateOfferTotals(
  lineItems: OfferLineItem[],
  discountCents = 0,
  taxRate = 19
): { subtotal: number; tax: number; total: number } {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total_cents, 0);
  const afterDiscount = subtotal - discountCents;
  const tax = Math.round(afterDiscount * (taxRate / 100));
  const total = afterDiscount + tax;
  
  return { subtotal, tax, total };
}
