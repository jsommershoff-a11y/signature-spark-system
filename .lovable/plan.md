

# Plan: Startseite CRO/SEO/UX-Optimierung — Veröffentlichungsreife Version

## Zusammenfassung

Komplette Neustrukturierung der MasterHome-Startseite: neue Seitenarchitektur, geschärfte Copy nach exaktem Briefing, vereinheitlichtes CTA-System, verbesserte SEO-Meta-Tags und neue Sektionen (Branchen-Links, Prozess-Sektion). Bestehende Komponenten werden überarbeitet, nicht neu erfunden.

---

## Seitenarchitektur (neue Reihenfolge in MasterHome.tsx)

```text
Header
 └ Hero (komplett neu strukturiert)
 └ TrustLogosSection (bleibt, nur Überschrift anpassen)
 └ ProblemSection (EmotionalHookSection → komplett neue Copy)
 └ VulnerabilitySection (radikal geschärft)
 └ AiRealitySection (auf Kernthema "eigene Informationen" gedreht)
 └ ResultsSection (Outcome-Sektion neu formuliert)
 └ ProcessSection (neue 5-Schritte-Sektion)
 └ BranchenSection (NEU — interne Links für SEO)
 └ CaseStudiesSection (bleibt)
 └ FAQSection (komplett neue Fragen)
 └ FinalCtaSection (vereinheitlicht)
Footer
 └ StickyCtaBanner (optimiert)
```

**Entfernte Sektionen**: FivePillarsSection, SolutionSection, CompetitionSection, OfferSection, AiAnalysisWidget, TransformationFinancingSection, AboutFounderSection, FloatingCTA (zu aggressiv mit Sticky), ExitIntentPopup.

---

## Schritt-für-Schritt Änderungen

### Step 01 — Header CTA vereinheitlichen
**Datei**: `src/components/landing/Header.tsx`
- CTA-Text von "Potenzial-Analyse buchen" → "Kostenlose Potenzial-Analyse"
- Mobile CTA-Button ebenso anpassen
- "Anmelden" bleibt als sekundärer Textlink

### Step 02 — HeroSection komplett neu
**Datei**: `src/components/landing/home/HeroSection.tsx`
- Neue Struktur: Eyebrow + H1 + Subheadline + Unterstützende Zeile + 1 primärer CTA + Microcopy
- Rechts: Gründer-Trust-Modul (Bild kleiner, Name, Rolle, Positionierung)
- 4 Nutzenpunkte-Karten unterhalb
- Exakte Copy laut Briefing
- Nur ein CTA: "Kostenlose Potenzial-Analyse"
- "System verstehen"-Button entfernen

### Step 03 — EmotionalHookSection → ProblemSection
**Datei**: `src/components/landing/home/EmotionalHookSection.tsx`
- Neue H2: "Das Problem ist nicht fehlende KI. Das Problem ist fehlende Systemkontrolle."
- Neue Copy + 3 Problemkarten (statt 7 Bullet-Points)
- CTA am Ende: "Kostenlose Potenzial-Analyse"

### Step 04 — VulnerabilitySection schärfen
**Datei**: `src/components/landing/home/VulnerabilitySection.tsx`
- Neue H2, neue Copy, neue Leitzeile laut Briefing
- Risiko-Karten beibehalten, aber Copy präzisieren
- CTA: "Kostenlose Potenzial-Analyse"

### Step 05 — AiRealitySection auf Kernthema drehen
**Datei**: `src/components/landing/home/AiRealitySection.tsx`
- Radikal vereinfachen: nur H2, Copy, 4-Punkt-Checkliste, Abschlusszeile
- Falsch/Richtig-Vergleich, Danger-Cards, Prozess-Tags, Visual-Banner, Handwerker-Block entfernen
- CTA: "Kostenlose Potenzial-Analyse"

### Step 06 — ResultsSection als Outcome-Sektion
**Datei**: `src/components/landing/home/ResultsSection.tsx`
- Neue H2: "Was sich verändert, wenn dein Unternehmen systematisiert ist"
- 4 Outcome-Blöcke mit exakter Copy laut Briefing
- Gründer-Bild beibehalten
- Kein CTA hier (folgt in Prozess-Sektion)

### Step 07 — ProcessStepsSection auf 5 Schritte
**Datei**: `src/components/landing/home/ProcessStepsSection.tsx`
- 5 Schritte: Analyse → System-Mapping → Priorisierung → Umsetzung → Übergabe
- CTA + Microcopy am Ende

### Step 08 — Neue BranchenSection erstellen
**Neue Datei**: `src/components/landing/home/BranchenSection.tsx`
- H2: "Für diese Unternehmen ist Systematisierung besonders relevant"
- 5 Karten mit internem Link zu /handwerk, /praxen, /dienstleister, /immobilien, /kurzzeitvermietung
- Jede Karte: Überschrift + 1 Satz Problembezug + Link

### Step 09 — FAQSection neue Inhalte
**Datei**: `src/pages/landing/MasterHome.tsx`
- 6 neue FAQ-Items laut Briefing ersetzen die bestehenden
- FAQ-Schema wird automatisch aus den sichtbaren Inhalten generiert (bereits implementiert)

### Step 10 — FinalCtaSection vereinheitlichen
**Datei**: `src/components/landing/home/FinalCtaSection.tsx`
- CTA-Text: "Kostenlose Potenzial-Analyse" (statt "Signature System aufbauen")
- "System verstehen"-Button entfernen
- Microcopy: "30 Minuten. Klare Prioritäten. Keine Tool-Demo."

### Step 11 — MasterHome Seitenarchitektur + SEO
**Datei**: `src/pages/landing/MasterHome.tsx`
- Neue Section-Reihenfolge
- Entferne: FivePillarsSection, SolutionSection, CompetitionSection, OfferSection, AiAnalysisWidget, TransformationFinancingSection, AboutFounderSection, FloatingCTA, ExitIntentPopup
- Füge hinzu: ProcessStepsSection, BranchenSection
- SEO-Title: "Automatisierung für Unternehmen | Informationen im eigenen System"
- Meta Description: "KRS Signature systematisiert Prozesse, Wissen und Übergaben, damit Unternehmen Automatisierung und KI sinnvoll nutzen können. Kostenlose Potenzial-Analyse."
- Organization JSON-LD anpassen

### Step 12 — StickyCtaBanner optimieren
**Datei**: `src/components/landing/conversion/StickyCtaBanner.tsx`
- Scroll-Threshold auf Hero-Höhe (~700px statt 600px)
- CTA-Text: "Kostenlose Potenzial-Analyse"
- Dezenter: keine Alarm-Sprache im Begleittext
- Mobile sauber lesbar

### Step 13 — FloatingCTA deaktivieren
**Datei**: `src/pages/landing/MasterHome.tsx`
- FloatingCTA-Import und Rendering entfernen (Sticky CTA reicht)

### Step 14 — PublicLayout bereinigen
**Datei**: `src/components/landing/PublicLayout.tsx`
- FloatingCTA-Import entfernen falls dort eingebunden

---

## SEO-Verbesserungen

- Title + Meta Description geschärft
- Nur 1 H1 pro Seite
- Saubere H2/H3-Hierarchie
- FAQ-Schema mit exakt sichtbaren Inhalten
- Interne Links auf Branchen-Seiten (neue BranchenSection)
- Alt-Texte für Bilder verbessern
- Canonical bleibt auf "/"

## CTA-Konsistenz

Einziger primärer CTA-Text überall: **"Kostenlose Potenzial-Analyse"**

---

## Dateien

| Aktion | Datei |
|--------|-------|
| Ändern | `src/components/landing/Header.tsx` |
| Ändern | `src/components/landing/home/HeroSection.tsx` |
| Ändern | `src/components/landing/home/EmotionalHookSection.tsx` |
| Ändern | `src/components/landing/home/VulnerabilitySection.tsx` |
| Ändern | `src/components/landing/home/AiRealitySection.tsx` |
| Ändern | `src/components/landing/home/ResultsSection.tsx` |
| Ändern | `src/components/landing/home/ProcessStepsSection.tsx` |
| Ändern | `src/components/landing/home/FinalCtaSection.tsx` |
| Ändern | `src/components/landing/conversion/StickyCtaBanner.tsx` |
| Ändern | `src/components/landing/FAQSection.tsx` (keine Änderung, nur neue Items) |
| Ändern | `src/pages/landing/MasterHome.tsx` |
| Ändern | `src/components/landing/PublicLayout.tsx` |
| Erstellen | `src/components/landing/home/BranchenSection.tsx` |

