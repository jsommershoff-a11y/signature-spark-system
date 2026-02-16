

# Step 41 -- Pricing-Section: 3 Pakete, Value-First Darstellung, VIP mit Schulungs-Fokus

## Zusammenfassung

Die Pricing-Section wird von 2 auf 3 Pakete erweitert, Preise werden angepasst, und die Darstellung wird auf "Value-First" umgestellt (erst Wert zeigen, dann Investition). Im VIP-Paket wird statt "unbegrenzte Prozesse" der Fokus auf Befaehigung gelegt: Du bzw. ein Mitarbeiter lernt, die KI-Prozesse selbst zu steuern.

---

## Neue Paketstruktur

| Paket | Investition | Wert | Badge |
|---|---|---|---|
| KI-Prozess-Kickstart | 998 EUR | 2.500+ EUR | -- |
| KI-Komplettpaket | 2.998 EUR | 8.000+ EUR | BELIEBTESTE WAHL |
| KI-VIP Done-for-You | 9.998 EUR | 25.000+ EUR | MAXIMALER IMPACT |

### VIP-Paket Features (angepasst -- Schulung statt "unbegrenzt")
- Alles aus dem Komplettpaket
- Komplettes KI-Setup fuer Ihr Unternehmen
- Sie oder ein Mitarbeiter werden zum KI-Prozess-Experten ausgebildet
- Dediziertes Experten-Team an Ihrer Seite
- 90-Tage intensive 1:1 Betreuung
- Quartalsweise Strategie-Optimierung
- Direkter Draht zum Geschaeftsfuehrer
- Premium-Support mit 4h Reaktionszeit
- 100% Erfolgs-Garantie

---

## Value-First Preisdarstellung (pro Karte)

Jede Karte zeigt:
1. **Paketname**
2. **"Gesamtwert der Leistungen:"** z.B. 8.000+ EUR (als Anker)
3. **"Ihre Investition:"** z.B. 2.998 EUR (hervorgehoben)
4. **"Sie sparen ueber X EUR"** (Ersparnis explizit benannt)
5. Feature-Liste
6. CTA-Button

---

## Technische Aenderungen

### Datei: `src/components/landing/conversion/PricingSection.tsx`

1. **Datenstruktur**: Felder `valuePrice` und `savings` pro Plan hinzufuegen
2. **3. Paket**: VIP Done-for-You mit Schulungs-Features einfuegen
3. **Grid**: Von `md:grid-cols-2` auf `lg:grid-cols-3` aendern, `max-w-4xl` auf `max-w-6xl`
4. **Preisbereich**: Umbauen auf Value-First-Layout (Wert oben, Investition darunter, Ersparnis-Badge)
5. **Subtitle**: "Drei Stufen. Ein Ziel: Mehr Effizienz, weniger Aufwand."
6. **VIP-Button**: Separater Stil (z.B. gold/accent) fuer Premiumwirkung

### Keine weiteren Dateien betroffen

