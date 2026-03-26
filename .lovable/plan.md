

# Plan: Kauflogik trennen — Paket 1+2 direkt, Paket 3-5 nur per Angebot

## Zusammenfassung

Pakete 1 (Schnuppermitgliedschaft) und 2 (Website Starter) bekommen einen direkten "Jetzt kaufen"-Button mit Stripe Checkout. Pakete 3, 4 und 5 (Wachstum, Ernsthaft, Raketenstarter) zeigen stattdessen einen "Angebot anfordern"-Hinweis — kein direkter Kauf moeglich. AGB-Links werden bei allen Paketen eingebunden.

## Aenderungen

### 1. `src/lib/stripe-config.ts`

- Neues Feld `directPurchase: boolean` zum `StripeProduct`-Interface hinzufuegen
- `schnupper` und `website`: `directPurchase: true`
- `wachstum`, `ernsthaft`, `rakete`: `directPurchase: false`

### 2. `src/pages/app/Pricing.tsx`

- Button-Bereich pro Card aendern:
  - Wenn `product.directPurchase === true` → "Jetzt kaufen"-Button mit Stripe Checkout (wie bisher)
  - Wenn `product.directPurchase === false` → Stattdessen Text "Individuelles Angebot erforderlich" + Button "Angebot anfordern" der z.B. zur Kontaktseite oder einem Formular fuehrt (vorerst als disabled/Info-Button)
- Unter jeder Card einen kleinen Link "Es gelten unsere AGB" mit Link auf `/agb` einblenden
- Beim "einmalig · zzgl. MwSt."-Text fuer High-Ticket Pakete (3-5): "Preis nach Angebot" anzeigen statt fester Preisangabe (optional, abhaengig von deiner spaeteren Textlieferung)

### 3. Kein Datenbankumbau noetig

Die Logik ist rein Frontend-seitig ueber das `directPurchase`-Flag gesteuert.

## Dateien

1. **Aendern**: `src/lib/stripe-config.ts` — `directPurchase`-Feld hinzufuegen
2. **Aendern**: `src/pages/app/Pricing.tsx` — Bedingte Button-Logik + AGB-Link pro Card

