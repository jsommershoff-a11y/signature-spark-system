// Stripe Product & Price Configuration
// All Stripe product/price IDs for the KRS Signature System

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
  membershipProduct?: 'starter' | 'growth' | 'premium';
  directPurchase: boolean; // true = Stripe Checkout, false = Angebot erforderlich
}

export const STRIPE_PRODUCTS: Record<string, StripeProduct> = {
  schnupper: {
    id: 'schnupper',
    name: 'Schnuppermitgliedschaft',
    price: '19,99 €',
    priceId: 'price_1TF2FZBmqjP8eJrSQYLveamR',
    productId: 'prod_UDTBcyC9oz2oIC',
    priceCents: 1999,
    description: '12 Monate Zugang zur Community, Live Calls, Events und KI Prompts.',
    features: [
      'Community-Zugang',
      'Wöchentliche Live Calls',
      'Events & Networking',
      'KI Prompt-Bibliothek',
      'Grundlagen-Kurse',
    ],
    membershipProduct: 'starter',
    directPurchase: true,
  },
  website: {
    id: 'website',
    name: 'Website Starter',
    price: '999 €',
    priceId: 'price_1TF2M2BmqjP8eJrSIqFAANcb',
    productId: 'prod_UDTIV8upy908ms',
    priceCents: 99900,
    description: 'Professionelle Website für dein Unternehmen.',
    features: [
      'Alles aus Schnuppermitgliedschaft',
      'Professionelle Website',
      'SEO-Grundoptimierung',
      'Mobile-Responsive Design',
      'Content-Management',
      '4 Wochen Support',
    ],
    membershipProduct: 'starter',
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
      'Alles aus Website Starter',
      'CRM-System Setup',
      'Automatisierungs-Workflows',
      'Persönlicher Implementierungs-Plan',
      '1:1 Strategie-Calls',
      '8 Wochen persönlicher Support',
    ],
    highlighted: true,
    badge: 'Beliebteste Wahl',
    membershipProduct: 'growth',
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
  },
};

export const STRIPE_PRODUCTS_LIST = Object.values(STRIPE_PRODUCTS);
