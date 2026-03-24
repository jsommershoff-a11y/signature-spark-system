

# Plan: Finale Homepage-Optimierung fuer Go-Live

## Identifizierte Probleme

1. **Doppelte AboutFounderSection** in MasterHome.tsx (Zeile 65-66) -- kritischer Bug
2. **FAQ-Fragen zu generisch** -- brauchen schaerfere, einwandbezogene Formulierungen
3. **Savings-Cards im KI-Widget** brechen auf Mobile (3 Spalten bei 375px zu eng)
4. **Footer-Beschreibung veraltet** -- "Ganzheitliche Unternehmensberatung" passt nicht zur Signature-System-Positionierung
5. **Textliche Dopplungen** zwischen CompetitionSection und AiRealitySection (beide sagen "KI bringt mir nichts")
6. **SolutionSection Redundanz** -- "Typische Ergebnisse: weniger Chaos" wiederholt die Headline darueber
7. **CTA-Text im Widget** zu lang fuer einen Button ("Diese Prozesse setzen wir innerhalb von 14 Tagen fuer dich auf.")
8. **Keine Uebergangslogik zwischen Sektionen** -- manche Bloecke enden abrupt

## Aenderungen

### 1. MasterHome.tsx
- Doppelte `<AboutFounderSection />` entfernen (Zeile 66)
- FAQ-Items inhaltlich ueberarbeiten: staerker auf Einwaende abzielen (keine Zeit, zu teuer, falsche Branche, schon versucht, Cashflow-Angst)

### 2. AiAnalysisWidget.tsx (Mobile-Fix + CTA-Schaerfung)
- Savings-Cards Grid: `grid-cols-3` → `grid-cols-1 sm:grid-cols-3` fuer Mobile-Lesbarkeit
- CTA-Button Text kuerzen: "Potenzial-Analyse sichern" (der 14-Tage-Hinweis wird Subtext)
- Darunter: "Wir setzen die ersten Automatisierungen innerhalb von 14 Tagen um."

### 3. CompetitionSection.tsx (Dopplung entfernen)
- Headline links aendern von "KI bringt mir nichts..." (identisch mit AiRealitySection) zu: "Du verlierst jeden Monat Geld durch manuelle Prozesse."
- Konsistenz sicherstellen

### 4. SolutionSection.tsx (Redundanz entfernen)
- Letzten Absatz "Typische Ergebnisse: weniger Chaos, schnellere Ablaeufe, klarere Prozesse." entfernen (Redundanz zur Headline darueber)

### 5. Footer.tsx
- Beschreibung von "Ganzheitliche Unternehmensberatung..." aendern zu: "Einfache Automatisierungen fuer Unternehmen – Struktur, Entlastung, Kontrolle."

### 6. FAQ-Items in MasterHome.tsx ueberarbeiten
Neue FAQ-Items (6 statt 5), direkt auf Einwaende ausgerichtet:
- "Funktioniert das in meiner Branche?" -- bleibt
- "Ich habe keine Zeit fuer so ein Projekt." -- NEU, direkt adressiert
- "Was genau bekomme ich?" -- NEU, Angebot greifbar machen
- "Wie schnell sehe ich Ergebnisse?" -- bleibt, leicht geschaerft
- "Ist das nicht zu teuer?" -- bleibt, geschaerft auf ROI
- "Ich habe schon Tools ausprobiert, die nichts gebracht haben." -- NEU, Differenzierung

### 7. HeroSection.tsx (Feinschliff)
- Microcopy "Kostenlos und unverbindlich" Abstand zum CTA leicht vergroessern (mb-6 → mb-8)

### 8. FinalCtaSection.tsx (Feinschliff)
- Option 2 letzte Zeile kuerzer: entferne "Dein Unternehmen waechst, ohne dass du mehr arbeitest" (zu generisch)

## Dateien die geaendert werden

1. `src/pages/landing/MasterHome.tsx` -- Dopplung entfernen + FAQ ueberarbeiten
2. `src/components/landing/home/AiAnalysisWidget.tsx` -- Mobile-Fix + CTA
3. `src/components/landing/home/CompetitionSection.tsx` -- Dopplung entfernen
4. `src/components/landing/home/SolutionSection.tsx` -- Redundanz entfernen
5. `src/components/landing/Footer.tsx` -- Beschreibung aktualisieren
6. `src/components/landing/home/FinalCtaSection.tsx` -- Feinschliff

Keine neuen Dateien. Keine Strukturaenderungen. Designsystem bleibt identisch.

