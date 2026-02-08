// Offer & Order Type Definitions

// =============================================
// ENUMS
// =============================================

export type OfferStatus = 'draft' | 'pending_review' | 'approved' | 'sent' | 'viewed' | 'expired';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type PaymentProvider = 'stripe' | 'copecart' | 'bank_transfer' | 'manual';

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
  type: 'one_time' | 'subscription' | 'installments';
  frequency?: 'monthly' | 'quarterly' | 'yearly';
  installments?: number;
}

export interface OfferAiGenerated {
  personalized_intro: string;
  value_propositions: string[];
  objection_responses: Record<string, string>;
  urgency_message?: string;
}

export interface OfferContent {
  // Header
  title: string;
  subtitle?: string;
  valid_until: string;
  
  // Kunde
  customer: {
    name: string;
    company?: string;
    email: string;
  };
  
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
  
  // KI-generierte Inhalte
  ai_generated?: OfferAiGenerated;
  
  // Terms
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
  expired: 'Abgelaufen',
};

export const OFFER_STATUS_COLORS: Record<OfferStatus, string> = {
  draft: 'bg-gray-500',
  pending_review: 'bg-yellow-500',
  approved: 'bg-blue-500',
  sent: 'bg-purple-500',
  viewed: 'bg-indigo-500',
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

// =============================================
// HELPER FUNCTIONS
// =============================================

export function formatCents(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(cents / 100);
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
