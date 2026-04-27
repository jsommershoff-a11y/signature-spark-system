/**
 * Reicht User-Daten an einen Stripe Payment Link weiter:
 *  - prefilled_email   : füllt das Email-Feld in Stripe Checkout
 *  - client_reference_id : wird im Webhook (checkout.session.completed) als
 *                          session.client_reference_id geliefert -> Mapping zu Account.
 */
export function buildPaymentLink(opts: {
  base: string;
  email?: string | null;
  userId?: string | null;
  refCode?: string | null;
}): string {
  const url = new URL(opts.base);
  if (opts.email) url.searchParams.set('prefilled_email', opts.email);
  if (opts.userId) url.searchParams.set('client_reference_id', opts.userId);
  // Stripe metadata via utm_* lands in `utm` of the session — useful for affiliate attribution
  if (opts.refCode) url.searchParams.set('utm_source', `ref_${opts.refCode}`);
  return url.toString();
}

/**
 * Fires a `begin_checkout` event to gtag/dataLayer if available.
 * Failures are silent (consent-blocked / adblock).
 */
export function trackBeginCheckout(p: {
  code: string;
  name: string;
  category: string;
  priceNetCents: number;
  currency?: string;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const value = p.priceNetCents / 100;
    const payload = {
      event: 'begin_checkout',
      currency: p.currency ?? 'EUR',
      value,
      items: [
        {
          item_id: p.code,
          item_name: p.name,
          item_category: p.category,
          price: value,
          quantity: 1,
        },
      ],
    };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        currency: payload.currency,
        value,
        items: payload.items,
      });
    }
  } catch {
    /* ignore */
  }
}
