/**
 * Zentrale WhatsApp-Business-Konfiguration.
 * Nummer in internationalem E.164-Format ohne "+" oder Leerzeichen.
 */
export const WHATSAPP_BUSINESS_NUMBER = "491751127114";
export const WHATSAPP_BUSINESS_DISPLAY = "+49 175 1127114";

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
}
