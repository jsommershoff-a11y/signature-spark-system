

## Plan: Community-Seite zur Conversion-Landingpage umbauen

### Kontext
Die `/community`-Seite wird zur verkaufsfertigen Landingpage für 61 bestehende Skool-Mitglieder. Founder Price: 199 €/Jahr. Ab 21. März 2026: 50 €/Monat. Stripe Pricing Table wird direkt eingebettet.

### Aufbau der neuen Seite

**1. Urgency-Banner (oben, sticky)**
- Countdown bis 21. März 2026 (festes Datum, kein Fake-Timer)
- Text: "Founder-Preis endet in X Tagen X:XX:XX – Danach 50 €/Monat"

**2. Hero-Section**
- Badge: "Exklusiv für bestehende Mitglieder"
- Headline: "Sichere dir den Founder-Preis: 199 €/Jahr statt bald 600 €/Jahr"
- Subline: Klare Ansage – wer nicht bucht, verliert den Zugang
- Preisvergleich visuell: ~~50 €/Monat (600 €/Jahr)~~ → 199 €/Jahr = 16,58 €/Monat
- CTA-Button scrollt zur Stripe-Sektion

**3. Benefits-Grid (bleibt ähnlich)**
- 4 Benefit-Cards wie bisher

**4. Was du verlierst-Sektion (Loss Aversion)**
- Liste: Community-Zugang, Live-Calls, Gründer-Kontakt, Netzwerk
- Framing: "Ohne Buchung wird dein Zugang am 21. März entfernt"

**5. Pricing + Stripe Checkout**
- Founder-Preis prominent: 199 €/Jahr hervorgehoben
- Durchgestrichener Normalpreis (600 €/Jahr)
- Ersparnis-Badge: "Spare 401 € im ersten Jahr"
- Stripe Pricing Table eingebettet (gleiche IDs wie auf /agb)
- Darunter: Vertrauenssignale (sichere Zahlung, jederzeit kündbar)

**6. FAQ-Bereich (kurz)**
- Was passiert wenn ich nicht buche?
- Kann ich monatlich kündigen?
- Was ist im Founder-Preis enthalten?

**7. Finaler CTA**
- Nochmal Countdown + Button

### Technische Umsetzung

- **Datei**: `src/pages/landing/Community.tsx` komplett überarbeiten
- **Countdown**: Festes Zieldatum `2026-03-21T23:59:59` (kein Fake-Midnight-Reset)
- **Stripe**: `<stripe-pricing-table>` mit den bestehenden Keys aus der AGB-Seite
- **Scroll-to-Checkout**: CTA-Buttons scrollen per `useRef` zur Stripe-Sektion
- **Keine neuen Abhängigkeiten** nötig

