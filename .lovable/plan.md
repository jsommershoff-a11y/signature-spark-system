

# Plan: Neue Sektion "Signature Transformation Finanzierung"

## Zusammenfassung

Neue eigenstaendige Sektion, die das Finanzierungsmodell als Einwandbehandlung positioniert: "Du kannst dein Unternehmen umbauen, ohne deinen Cashflow zu gefaehrden." Platzierung zwischen ResultsSection und AboutFounderSection.

## Neue Datei

### `src/components/landing/home/TransformationFinancingSection.tsx`

Aufbau (alle Texte woertlich aus Vorgabe):

1. **Opener-Block** (zentriert, max-w-3xl):
   - Badge: "Transformation ohne Risiko"
   - Headline h2: "Die meisten Unternehmer wissen, dass sie ihr Unternehmen veraendern muessen."
   - Subtext: "Sie tun es nicht. Nicht, weil sie es nicht verstehen. Sondern weil ihnen die Zeit fehlt – und weil der Cashflow an ihnen haengt."

2. **Angst-Block** (bg-destructive/5, border-destructive/20, rounded):
   - "Genau hier scheitern die meisten..."
   - Zitat: „Dann verliere ich Umsatz."
   - Aufloesung: "Das Gegenteil ist der Fall." + 3 Gewinne (Struktur, Kontrolle, Wachstum) als CheckCircle2-Liste

3. **Finanzierungs-Erklaerung** (bg-primary/5, border-primary/20, rounded):
   - "Deshalb haben wir die Signature Transformation Finanzierung aufgebaut."
   - Erklaerung des Modells
   - Statement: "Du kannst dein Unternehmen umbauen, waehrend es weiterlaeuft."

4. **Konkretes Beispiel** (Card mit Icon):
   - "2 Tage pro Woche → nur noch halbtags = 1 Tag pro Woche zurueckgewonnen"
   - "Diese Zeit nutzt du, um dein Unternehmen richtig aufzubauen."

5. **Realitaets-Block**:
   - Zitat nochmal: „Dann verliere ich Umsatz."
   - Aufloesung: "Du verlierst kurzfristig operative Zeit, gewinnst aber ein System..."

6. **Finanzierungsrahmen** (Card, zentriert):
   - "Je nach Unternehmensgroesse sind Finanzierungen von bis zu 250.000 € moeglich."
   - Disclaimer: "Keine pauschale Zusage, sondern basiert auf individuellen Voraussetzungen"
   - Abschluss: "Es zeigt, was moeglich ist, wenn Unternehmen diesen Schritt gehen."

Styling: Bestehende landingTokens (sectionPadding, headline, card, badgeAccent), Icons aus lucide-react (Shield, TrendingUp, CheckCircle2, Clock, Banknote).

## Bestehende Datei aendern

### `src/pages/landing/MasterHome.tsx`
- Import der neuen Komponente
- Einfuegen zwischen `<ResultsSection />` und `<AboutFounderSection />`

## Dateien

- **Neu**: `src/components/landing/home/TransformationFinancingSection.tsx`
- **Aendern**: `src/pages/landing/MasterHome.tsx` (1 Import + 1 Zeile im Render)

