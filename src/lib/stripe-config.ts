// Stripe Product & Price Configuration
// All Stripe product/price IDs for the KRS Signature System
// Alle Preise inkl. 19% MwSt.

export interface StripeProduct {
  id: string;
  name: string;
  price: string; // Display price
  priceId: string;
  productId: string;
  priceCents: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  membershipProduct?: 'basic' | 'starter' | 'growth' | 'premium';
  directPurchase: boolean;
  mode: 'subscription' | 'payment'; // Stripe checkout mode
}

export const STRIPE_PRODUCTS: Record<string, StripeProduct> = {
  mitgliedschaft: {
    id: 'mitgliedschaft',
    name: 'Mitgliedschaft',
    price: '19,99 €/Monat',
    priceId: 'price_1TF3F5BmqjP8eJrSof3ZWh7g',
    productId: 'prod_UDUDyr4KjEJQB4',
    priceCents: 1999,
    description: 'Dein Einstieg ins KRS System – Community, Basis-Prompts und Live-Calls.',
    features: [
      'Zugang zur kuratieren Basis-Prompt-Bibliothek (5 Vorlagen)',
      'Erste praxisnahe Automatisierungs-Ansätze',
      'Einstieg in Systemdenken statt Tool-Chaos',
      'Grundlagenwissen zu Automatisierung & Prozessen',
      'Teilnahme an Live-Calls (Einblick & Lernen)',
      'Zugang zu Community-Gruppen + WhatsApp Austausch',
      'Einblick in reale Use-Cases & Umsetzungen',
      'Sichtbarer Zugang zu weiteren gesperrten Inhalten',
      'Risikofrei das System kennenlernen',
    ],
    membershipProduct: 'basic',
    directPurchase: true,
    mode: 'subscription',
  },
  starter: {
    id: 'starter',
    name: 'Starter Paket',
    price: '999 €',
    priceId: 'price_1TF2M2BmqjP8eJrSIqFAANcb',
    productId: 'prod_UDTIV8upy908ms',
    priceCents: 99900,
    description: 'Individualisierte Prompts + Implementierung für dein Unternehmen.',
    features: [
      'Alles aus der Mitgliedschaft',
      '4 individualisierte Prompts (Vertrieb, Marketing, Prozesse)',
      'Schritt-für-Schritt Implementierungsanleitung',
      'Sofort nutzbare Strukturen für den Alltag',
      'Fokus auf schnelle Ergebnisse statt Theorie',
      'Kickoff-Gespräch zur Einrichtung',
      'Abschlussgespräch zur Optimierung',
      'Zugriff auf Live-Calls & Aufzeichnungen',
      'Grundlage für erste Automatisierungen',
      'Jederzeit erweiterbar (Upsell möglich)',
    ],
    highlighted: true,
    badge: 'Empfohlen',
    membershipProduct: 'starter',
    directPurchase: true,
    mode: 'payment',
  },
  wachstum: {
    id: 'wachstum',
    name: 'Wachstum',
    price: '4.999 €',
    priceId: 'price_1TF2MMBmqjP8eJrSeZtOoIQU',
    productId: 'prod_UDTImKXl8RdXyL',
    priceCents: 499900,
    description: 'CRM, Automatisierung und Coaching für messbares Wachstum.',
    features: [
      'Alles aus dem Starter Paket',
      'CRM-System Setup',
      'Automatisierungs-Workflows',
      'Persönlicher Implementierungs-Plan',
      '1:1 Strategie-Calls',
      '8 Wochen persönlicher Support',
    ],
    membershipProduct: 'growth',
    directPurchase: false,
    mode: 'payment',
  },
  ernsthaft: {
    id: 'ernsthaft',
    name: 'Ernsthaft',
    price: '9.999 €',
    priceId: 'price_1TF2MnBmqjP8eJrSYwS92OAj',
    productId: 'prod_UDTJx9P04DYXgB',
    priceCents: 999900,
    description: 'Done-with-you System-Implementierung mit persönlichem Sparring.',
    features: [
      'Alles aus Wachstum',
      'Done-with-you Implementierung',
      'Custom Automatisierungen',
      'Sales-Funnel Setup',
      '1:1 Betreuung (12 Wochen)',
      'Priorisierter Support',
    ],
    membershipProduct: 'premium',
    directPurchase: false,
    mode: 'payment',
  },
  rakete: {
    id: 'rakete',
    name: 'Raketenstarter',
    price: '17.999 €',
    priceId: 'price_1TF2NBBmqjP8eJrSN3DiMsES',
    productId: 'prod_UDTJ6NcsaVWjb8',
    priceCents: 1799900,
    description: 'Premium-Paket mit vollständiger System-Transformation.',
    features: [
      'Alles aus Ernsthaft',
      'Vollständige System-Transformation',
      'Multi-Channel Marketing Setup',
      'Team-Onboarding & Training',
      'Quartals-Review & Optimierung',
      'VIP Slack-Channel',
      'Laufende Betreuung',
    ],
    membershipProduct: 'premium',
    directPurchase: false,
    mode: 'payment',
  },
};

// Zusatzleistung: Einzel-Session (paketübergreifend)
export const ADDON_SESSION = {
  name: 'Einzel-Session',
  price: '199 €/Stunde',
  priceCents: 19900,
  description: 'Individuelle 1:1 Session – buchbar zu jedem Paket.',
};

export const STRIPE_PRODUCTS_LIST = Object.values(STRIPE_PRODUCTS);

// Map Stripe product IDs to membership tiers
export const PRODUCT_ID_TO_TIER: Record<string, string> = {
  'prod_UDUDyr4KjEJQB4': 'basic',
  'prod_UDTIV8upy908ms': 'starter',
  'prod_UDTImKXl8RdXyL': 'growth',
  'prod_UDTJx9P04DYXgB': 'premium',
  'prod_UDTJ6NcsaVWjb8': 'premium',
};
