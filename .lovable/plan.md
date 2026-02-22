

## Kompletter Relaunch der KRS Signature Homepage

### Zusammenfassung

Die bestehende Homepage (`/` -- `MasterHome.tsx`) wird komplett durch eine neue Long-Form Sales Page ersetzt. Die Positionierung wechselt von "KI-Tool-Installateur" zu "ganzheitlicher Unternehmensberater". Preise, Countdown-Timer und kuenstliche Verknappung werden entfernt. Die Anrede wechselt von "Sie" auf "Du". Der primaere CTA fuehrt zur kostenlosen Potenzial-Analyse (`/qualifizierung`).

Die Branchen-Landingpages (Handwerk, Praxen, etc.) bleiben unveraendert.

---

### Betroffene Dateien

**Neue Dateien erstellen:**

1. `src/pages/landing/MasterHome.tsx` -- Komplett neu geschrieben mit 7 Abschnitten
2. `src/components/landing/home/HeroSection.tsx` -- Hero mit Founder-Bild, Video-Platzhalter, Social Proof
3. `src/components/landing/home/EmotionalHookSection.tsx` -- Emotionaler Hook & Problembewusstsein
4. `src/components/landing/home/FivePillarsSection.tsx` -- Das 5-Saeulen-System mit Infoboxen
5. `src/components/landing/home/CaseStudiesSection.tsx` -- 3 Fallstudien (1 echt, 2 Platzhalter)
6. `src/components/landing/home/AboutFounderSection.tsx` -- Ueber Jan Sommershoff mit Foto
7. `src/components/landing/home/ProcessStepsSection.tsx` -- 3-Schritte-Prozess
8. `src/components/landing/home/FinalCtaSection.tsx` -- Finaler CTA-Block

**Bestehende Dateien aendern:**

9. `src/components/landing/conversion/ExitIntentPopup.tsx` -- Anrede auf "Du" umstellen, Wertversprechen anpassen
10. `src/components/landing/Header.tsx` -- CTA-Text aktualisieren ("Potenzial-Analyse buchen")
11. `src/components/landing/Footer.tsx` -- Beschreibungstext aktualisieren

**Nicht mehr von MasterHome importiert (aber nicht geloescht, da von Branchen-Pages genutzt):**
- CountdownBanner, PricingSection, ProblemAmplifier, SolutionSection, TestimonialGrid, ResultsShowcase, GuaranteeSection, StickyConversionHeader

---

### Technische Details

#### Step 01 -- Hero-Sektion (`HeroSection.tsx`)

- Nutzt `founder-portrait.jpeg` als Hintergrundbild (CSS background mit Overlay)
- H1: "Die 5 unternehmerischen Fesseln, die dich aktuell davon abhalten, dein Unternehmen wirklich zu skalieren."
- H2 als Subline
- Video-Platzhalter: 16:9 AspectRatio-Container mit Play-Icon und Thumbnail (nutzt `founder-portrait.jpeg` als Fallback)
- Primaer-CTA-Button mit Orange-Gradient
- Social Proof Zeile mit Sternen: "Bereits ueber 150+ Unternehmern geholfen..."

#### Step 02 -- Emotionaler Hook (`EmotionalHookSection.tsx`)

- H2: "Wenn ehrgeizige Ziele auf die operative Realitaet treffen..."
- Langer Fliesstext exakt wie vorgegeben, in Absaetze unterteilt
- Clean, zentriertes Layout mit max-w-3xl

#### Step 03 -- 5-Saeulen-System (`FivePillarsSection.tsx`)

- H2 + Subline
- 5 Karten nebeneinander (Desktop: 5-Spalten-Grid, Mobile: 1 Spalte)
- Jede Karte mit Icon (Lucide), Titel und Beschreibungstext
- Icons: Target, BarChart3, Bot, Users, Compass (passend zu den Saeulen)
- Sekundaer-CTA am Ende

#### Step 04 -- Fallstudien (`CaseStudiesSection.tsx`)

- H2: "Ergebnisse unserer Partner"
- 3 Karten im "Problem - Ziel - Loesung - Ergebnis"-Format
- Fallstudie 1: Echte Daten von Rene Schreiner (nutzt `testimonial-rene-schreiner.jpeg`)
- Fallstudien 2+3: Platzhalter mit eckigen Klammern und grauen Avatar-Fallbacks
- Karten mit border-left Orange-Akzent

#### Step 05 -- Ueber den Gruender (`AboutFounderSection.tsx`)

- Zwei-Spalten-Layout: Bild links (`founder-portrait.jpeg`), Text rechts
- H2: "Dein Partner auf Augenhoehe -- aus der Praxis, fuer die Praxis."
- Text exakt wie vorgegeben

#### Step 06 -- 3-Schritte-Prozess (`ProcessStepsSection.tsx`)

- H2: "In 3 Schritten zu einem systemgesteuerten Unternehmen"
- 3 nummerierte Schritte mit Verbindungspfeilen (horizontales Layout Desktop)
- Jeder Schritt: Nummer-Badge, Titel, Beschreibung

#### Step 07 -- Finaler CTA (`FinalCtaSection.tsx`)

- H2: "Bist du bereit, dein Unternehmen wirklich zu steuern..."
- Zwei Optionen nebeneinander (wie bestehend, aber mit neuem Text)
- Grosser, zentrierter CTA-Button
- Trust-Zeile: "100% kostenlos - Unverbindlich - Garantiert ohne Verkaufsdruck"

#### Step 08 -- MasterHome.tsx neu zusammenbauen

- Import der neuen Sektionen statt der alten Conversion-Komponenten
- Nutzt `Header` + `Footer` (kein StickyConversionHeader mehr)
- Reihenfolge: Hero - Hook - 5 Saeulen - Fallstudien - Gruender - Prozess - Final CTA
- FAQSection bleibt mit aktualisierten Fragen (Anrede "Du")
- ExitIntentPopup bleibt (mit aktualisiertem Text)

#### Step 09 -- ExitIntentPopup aktualisieren

- "Warten Sie" wird zu "Warte"
- "Sichern Sie sich" wird zu "Sichere dir"
- Bezug auf Potenzial-Analyse statt KI-Potenzialanalyse

#### Step 10 -- Header und Footer aktualisieren

- Header: CTA-Button-Text auf "Potenzial-Analyse buchen" aendern
- Footer: Beschreibungstext anpassen auf Berater-Positionierung

---

### Was entfernt wird (nur von der Homepage)

- Countdown-Timer (CountdownBanner)
- Preispakete (PricingSection)
- Kuenstliche Verknappung ("Nur noch 2 Plaetze")
- StickyConversionHeader (wird durch normalen Header ersetzt)
- Recharts-Graphen (ProblemAmplifier, SolutionSection)
- GuaranteeSection (100% Erfolgs-Garantie Sektion)

Diese Komponenten werden NICHT geloescht, da sie von anderen Seiten genutzt werden koennten.

---

### Design-Prinzipien

- Bestehendes Orange-Branding und `landing-tokens.ts` werden weiterverwendet
- Bestehende UI-Komponenten (Button, Card, etc.) werden genutzt
- Responsives Design: Mobile-first mit Tailwind Breakpoints
- Keine neuen Dependencies noetig

