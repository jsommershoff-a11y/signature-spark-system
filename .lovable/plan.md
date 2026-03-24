

# Plan: Strategische Conversion-Optimierung der Homepage

## Core-Claim & Signature System

Der Begriff **"Signature System"** wird als benannter Mechanismus durch die gesamte Seite gezogen. Core-Claim: **"Dein Unternehmen funktioniert nur, solange du es tust. Genau das ist das Problem."**

## Aenderungen pro Datei

### 1. HeroSection.tsx
- Subline ergaenzen: "Die meisten Unternehmen verlieren 2.000–5.000 € monatlich durch ineffiziente Prozesse."
- Core-Claim als separater Textblock vor den CTAs: "Dein Unternehmen funktioniert nur, solange du es tust. Genau das ist das Problem."
- CTA-Texte anpassen: "System verstehen" / "Signature System aufbauen"
- Micro-Conversion unter CTAs: "Kostenlos und unverbindlich • Dauert nur 2 Minuten"
- Marktabgrenzung als kurze Zeile: "Keine Chatbots. Keine Tools. Ein System, das funktioniert."

### 2. EmotionalHookSection.tsx (Problem)
- Abschluss-Statement erweitern um: "Unternehmen, die wir begleiten, gewinnen jede Woche mehrere Stunden zurueck."
- Pattern-Break-Block nach dem Statement: grosser, zentrierter Satz "Ohne System bist du der Engpass." als visuell abgesetzte Einheit (bg-foreground/text-background, rounded, volle Breite)

### 3. SolutionSection.tsx
- Headline anpassen: "Das Signature System entlastet dein Unternehmen sofort."
- Mini-Prozess als 4-Schritt-Leiste unter den Checkpoints einfuegen (horizontal, nummeriert):
  1. Analyse deiner Prozesse
  2. Groesste Zeitfresser identifizieren
  3. Erste Automatisierungen (7–14 Tage)
  4. Skalierung & Erweiterung
- Abschluss ergaenzen: "Typische Ergebnisse: weniger Chaos, schnellere Ablaeufe, klarere Prozesse."

### 4. AiRealitySection.tsx
- Opener-Text nach der Headline ergaenzen: "Wir bauen keine Chatbots. Wir verkaufen keine Tools. Wir bauen Systeme, die funktionieren."
- Core-Claim als Statement-Block: "Du brauchst keine KI. Du brauchst ein System." → umbenennen zu "Du brauchst keine KI. Du brauchst dein Signature System."

### 5. CompetitionSection.tsx
- Preisanker in die linke Karte: "Das kostet dich 2.000–5.000 € – jeden Monat."
- Pattern-Break-Block nach dem Grid: "Automatisierung ist kein Luxus. Es ist Pflicht." (bg-primary, text-primary-foreground, zentriert, gross)

### 6. OfferSection.tsx
- Headline anpassen: "Dein Signature System – zwei Wege:"
- Unter dem CTA-Button Micro-Conversion: "Kostenlos und unverbindlich • Sofort Ergebnis"

### 7. AiAnalysisWidget.tsx
- Ergebnis-Bereich erweitern:
  - Neue dritte Savings-Card: "Auf 12 Monate" mit Jahresberechnung (savingsHours * 12, savingsEuro * 12)
  - Textblock nach den Cards: "Wenn du nichts aenderst, bleibt das exakt so. Jeden Monat."
  - CTA-Text aendern: "Diese Prozesse setzen wir innerhalb von 14 Tagen fuer dich auf."
  - Micro-Conversion darunter: "Dauert nur 2 Minuten • Kostenlos"

### 8. ResultsSection.tsx
- Case-Logik ergaenzen als Textblock unter den Ergebnis-Punkten: "Unternehmen, die wir begleiten, gewinnen jede Woche mehrere Stunden zurueck – durch weniger manuelle Uebergaben und klarere Ablaeufe."

### 9. AboutFounderSection.tsx
- Ergaenzen: "Ich baue keine Chatbots. Ich baue Systeme." als separaten Absatz
- Core-Claim als letzten Block: "Dein Unternehmen funktioniert nur, solange du es tust. Das aendern wir."

### 10. FinalCtaSection.tsx
- Option 1 erweitern: "Du bleibst der Engpass. Dein Unternehmen haengt weiter an dir. Wachstum bleibt begrenzt."
- Option 2 erweitern: "Du baust ein Signature System, das ohne dich funktioniert. Dein Team arbeitet eigenstaendig. Du gewinnst Zeit und Kontrolle zurueck."
- Uebergangstext: "Jeder Tag ohne System kostet dich Zeit, Geld und Energie."
- CTA-Text: "Signature System aufbauen →"
- Micro-Conversion: "Kostenlos und unverbindlich • Dauert nur 2 Minuten"

### 11. TrustLogosSection.tsx
- Keine Aenderungen

### 12. MasterHome.tsx
- Keine strukturellen Aenderungen

## Dateien die geaendert werden

10 bestehende Dateien, keine neuen:
1. `HeroSection.tsx`
2. `EmotionalHookSection.tsx`
3. `SolutionSection.tsx`
4. `AiRealitySection.tsx`
5. `CompetitionSection.tsx`
6. `OfferSection.tsx`
7. `AiAnalysisWidget.tsx`
8. `ResultsSection.tsx`
9. `AboutFounderSection.tsx`
10. `FinalCtaSection.tsx`

Designsystem, Layout und Sektionsreihenfolge bleiben identisch.

