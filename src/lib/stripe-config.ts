// Stripe Product & Price Configuration
// KRS Immobilien GmbH — Stand: 27.04.2026
// Alle Preise: netto zzgl. 19 % USt. Brutto-Display in der UI.
// Checkout läuft direkt über Stripe Payment Links (neuer Tab).

export type ProductCategory = 'automation' | 'education';
export type ProductMode = 'one_time' | 'subscription';

export interface StripeProduct {
  /** Internal short code, e.g. A01, EDU01 */
  code: string;
  /** Stable id used in URLs / keys (lowercase code) */
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  mode: ProductMode;
  /** Net price in cents (EUR) */
  priceNetCents: number;
  /** Gross price in cents (EUR, incl. 19 % USt.) */
  priceGrossCents: number;
  /** Display string, gross */
  priceDisplay: string;
  /** Optional suffix for recurring offers, e.g. "/Monat" */
  pricePeriodLabel?: string;
  /** Delivery time in days (0 = sofort) */
  deliveryDays: number;
  productId: string;
  priceId: string;
  /** Direct Stripe Payment Link */
  paymentLink: string;
  /** Optional minimum-term hint shown under the price */
  termLabel?: string;
}

const fmtEUR = (cents: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);

const A = (
  code: string,
  name: string,
  subtitle: string,
  netEur: number,
  grossEur: number,
  deliveryDays: number,
  productId: string,
  priceId: string,
  paymentLink: string,
): StripeProduct => ({
  code,
  id: code.toLowerCase(),
  name,
  subtitle,
  category: 'automation',
  mode: 'one_time',
  priceNetCents: netEur * 100,
  priceGrossCents: Math.round(grossEur * 100),
  priceDisplay: fmtEUR(Math.round(grossEur * 100)),
  deliveryDays,
  productId,
  priceId,
  paymentLink,
});

export const STRIPE_PRODUCTS: StripeProduct[] = [
  A('A01', 'KI-Terminbot', 'Voice + Web: Termine automatisch vergeben', 3900, 4641, 7,
    'prod_UONcaBrtm6cPoO', 'price_1TPasVGfeNRIZPeJOtg4firg',
    'https://buy.stripe.com/28EdR970Ydme4B53Eeebu03'),
  A('A02', 'KI-E-Mail-Assistent', 'Inbox-Zero für Geschäftsführung und Team', 2900, 3451, 5,
    'prod_UONcbTWUiXjn8d', 'price_1TPasbGfeNRIZPeJN9mL4iBk',
    'https://buy.stripe.com/fZueVdfxucia9Vpgr0ebu04'),
  A('A03', 'KI-Lead-Qualifizierer', 'Web-Formular mit KI-Scoring + CRM-Sync', 2400, 2856, 5,
    'prod_UONcrDjdcjWmQP', 'price_1TPasiGfeNRIZPeJTYg4UC9N',
    'https://buy.stripe.com/00wdR92KI0zs8Rl8Yyebu05'),
  A('A04', 'KI-Angebots-Generator', 'Briefing oder Call → fertiges Angebots-PDF', 3400, 4046, 7,
    'prod_UONcNxJN6MtDzS', 'price_1TPasnGfeNRIZPeJvoMxsyBy',
    'https://buy.stripe.com/dRmeVdfxudme5F9fmWebu06'),
  A('A05', 'KI-Call-Summary-Pipeline', 'Automatisches Protokoll, Tasks, CRM-Sync', 1900, 2261, 5,
    'prod_UONcwNRqD5N3J9', 'price_1TPasuGfeNRIZPeJr9MypfYU',
    'https://buy.stripe.com/7sYdR92KI3LE8Rla2Cebu07'),
  A('A06', 'KI-Dokumenten-Extraktion', 'PDF, Scan, Foto → strukturierte Daten', 2900, 3451, 7,
    'prod_UONc3scJsLXj73', 'price_1TPat0GfeNRIZPeJbcEnOayl',
    'https://buy.stripe.com/fZudR98523LEgjN3Eeebu08'),
  A('A07', 'KI-Content-Maschine', 'LinkedIn, Blog, Newsletter automatisch', 2900, 3451, 7,
    'prod_UONcUzwaBwynY9', 'price_1TPat6GfeNRIZPeJ3Q4LygP3',
    'https://buy.stripe.com/dRm8wP70Y6XQ8Rlb6Gebu09'),
  A('A08', 'KI-Bewerber-Screening', 'CV → Ranking + Interview-Fragen', 2400, 2856, 5,
    'prod_UONdf1c92gdTmb', 'price_1TPatDGfeNRIZPeJPkdg6S9s',
    'https://buy.stripe.com/fZu00j996eqiffJ1w6ebu0a'),
  A('A09', 'KI-Kundenservice-Bot', 'Chat-Widget mit Wissensbasis', 3400, 4046, 7,
    'prod_UONdFhPgGiLlHU', 'price_1TPatJGfeNRIZPeJ5ueBvp2q',
    'https://buy.stripe.com/5kQeVd70Y6XQ7Nh5Mmebu0b'),
  A('A10', 'KI-Reporting-Bot', 'Wöchentliche KPI-Auswertung automatisch', 1900, 2261, 5,
    'prod_UONdOiZqVbqvPj', 'price_1TPatQGfeNRIZPeJrpAIrV0x',
    'https://buy.stripe.com/7sY28r4SQ5TMgjNb6Gebu0c'),
  A('A11', 'KI-Rechnungs-Assistent', 'Eingangsrechnungen → DATEV-Vorbereitung', 2900, 3451, 7,
    'prod_UONdj2OKWNqm7H', 'price_1TPatWGfeNRIZPeJHEDoC37S',
    'https://buy.stripe.com/6oUcN5bheeqic3xdeOebu0d'),
  A('A12', 'KI-Voice-Assistent Empfang', 'KI nimmt Anrufe an wie Ihr Team', 4900, 5831, 10,
    'prod_UONdidX5r7452D', 'price_1TPatdGfeNRIZPeJ46FvYnUr',
    'https://buy.stripe.com/aFa00j9960zs5F9gr0ebu0e'),
  A('A13', 'KI-Post-Assistent', 'Social-Media-Posts automatisch erstellen, planen, messen', 1499, 1784, 7,
    'prod_UOOZfQwMbSWB1S', 'price_1TPbmbGfeNRIZPeJgsw5gFLP',
    'https://buy.stripe.com/3cI00j99695YgjNgr0ebu0f'),
  {
    code: 'EDU01',
    id: 'edu01',
    name: 'KI-Profi Programm – Kickoff',
    subtitle: 'Einmalige Startgebühr für 6-monatiges Intensivprogramm',
    category: 'education',
    mode: 'one_time',
    priceNetCents: 150000,
    priceGrossCents: 178500,
    priceDisplay: fmtEUR(178500),
    deliveryDays: 0,
    productId: 'prod_UOOZYMvZ1vXOCW',
    priceId: 'price_1TPbmjGfeNRIZPeJ4fcdB50m',
    paymentLink: 'https://buy.stripe.com/bJebJ1fxu4PI9Vpb6Gebu0g',
  },
  {
    code: 'EDU02',
    id: 'edu02',
    name: 'KI-Profi Programm – Monatsbeitrag',
    subtitle: '6-monatiges Intensivprogramm · 899 €/Monat',
    category: 'education',
    mode: 'subscription',
    priceNetCents: 89900,
    priceGrossCents: 107000,
    priceDisplay: fmtEUR(107000),
    pricePeriodLabel: '/Monat',
    termLabel: 'Mindestlaufzeit 6 Monate',
    deliveryDays: 0,
    productId: 'prod_UOOZShlFBdHsKf',
    priceId: 'price_1TPbmrGfeNRIZPeJqGmCQ2e4',
    paymentLink: 'https://buy.stripe.com/aFa5kD99681UffJ0s2ebu0h',
  },
];

export const STRIPE_PRODUCTS_LIST = STRIPE_PRODUCTS;

export const STRIPE_PRODUCTS_BY_CODE: Record<string, StripeProduct> = Object.fromEntries(
  STRIPE_PRODUCTS.map((p) => [p.code, p]),
);

export const STRIPE_AUTOMATION_PRODUCTS = STRIPE_PRODUCTS.filter((p) => p.category === 'automation');
export const STRIPE_EDUCATION_PRODUCTS = STRIPE_PRODUCTS.filter((p) => p.category === 'education');

// Account-Hinweis für Rechtstexte / Footer
export const STRIPE_ACCOUNT_LABEL = 'Rechnungsstellung durch KRS Immobilien GmbH';
