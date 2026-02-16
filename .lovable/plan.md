

# Step 38 -- Messaging-Erweiterung: Von "Neukunden" zu "KI-Prozessoptimierung"

Die gesamte Landingpage spricht aktuell ausschliesslich von Kundengewinnung und Neukunden. Die Ansprache wird breiter aufgestellt, sodass alle Unternehmensprozesse abgedeckt werden, die durch KI-Einsatz Einsparungen bringen oder Ressourcen freisetzen (z.B. Vertrieb, Verwaltung, Kommunikation, Auftragsprozesse, Personalplanung).

---

## Betroffene Dateien und Aenderungen

### 1. `src/pages/landing/MasterHome.tsx` -- Hero + Final CTA

**Hero-Bereich (Zeilen 56-84):**
- Headline: Von "Jeden Tag verlieren Sie Kunden an Ihre Konkurrenz" zu etwas wie: **"Ihr Unternehmen arbeitet haerter als noetig -- weil Prozesse fehlen, die KI laengst uebernehmen kann"**
- Subline: Von "Wettbewerber gewinnen Kunden" zu: "Waehrend Sie manuell planen, verwalten und nachfassen, automatisieren Ihre Wettbewerber laengst -- mit KI-Systemen, die rund um die Uhr arbeiten."
- CTA-Button: Von "Ja, ich will mehr Kunden!" zu **"Ja, ich will effizientere Prozesse!"** oder **"Jetzt Potenzial aufdecken!"**

**Final CTA (Zeilen 115-143):**
- Option 1: "Weiter manuell arbeiten, Zeit und Geld verschwenden..."
- Option 2: "KI-Systeme installieren, die Prozesse automatisieren und Ressourcen freisetzen."

**FAQ-Items (Zeilen 16-37):**
- Antworten breiter formulieren (nicht nur "Anfragen/Kunden", sondern auch "Effizienz, Zeitersparnis, Prozessautomatisierung")
- FAQ "Ist das nicht zu teuer" -- Antwort auf Einsparungen und ROI durch Prozessoptimierung ausweiten

### 2. `src/components/landing/conversion/StickyConversionHeader.tsx`
- CTA-Text: Von "Ja, ich will mehr Kunden!" zu **"Jetzt Potenzial aufdecken!"**

### 3. `src/components/landing/conversion/ProblemAmplifier.tsx`
- Pain Points breiter formulieren:
  - "Repetitive Aufgaben fressen Ihre wertvolle Zeit"
  - "Ihr Team verbringt Stunden mit manueller Verwaltung statt mit dem Kerngeschaeft"
  - "Kundenanfragen, Angebote und Follow-ups laufen unstrukturiert"
  - "Sie wissen, dass Potenzial in Automatisierung liegt -- aber nicht wo anfangen"
- Graph-Label: Von "Kundengewinnung ohne System" zu "Ihre Produktivitaet ohne KI-Systeme"

### 4. `src/components/landing/conversion/SolutionSection.tsx`
- Benefits breiter:
  - "KI-gestuetzte Automatisierung von Vertrieb, Verwaltung und Kommunikation"
  - "Zeitersparnis durch intelligente Prozesse -- rund um die Uhr"
  - "Mehr Kapazitaet fuer Ihr Kerngeschaeft statt Verwaltungsaufwand"
  - "Messbare Ergebnisse ab den ersten 30 Tagen"
- Graph-Label: "Ihre Effizienz mit KRS System"
- CTA: "Ja, ich will effizientere Prozesse!"

### 5. `src/components/landing/conversion/TestimonialGrid.tsx`
- Testimonials diversifizieren (nicht nur Anfragen-Steigerung):
  - Thomas M.: Fokus auf Zeitersparnis und Automatisierung (z.B. "20 Stunden pro Woche eingespart")
  - Sandra K.: Fokus auf Prozessoptimierung (z.B. "Verwaltungsaufwand halbiert")
  - Michael R.: ROI bleibt, aber bezogen auf Gesamteffizienz

### 6. `src/components/landing/conversion/PricingSection.tsx`
- Untertitel: Von "Mehr Kunden fuer Ihr Unternehmen" zu "Mehr Effizienz, weniger Aufwand."
- Paket-Namen und Features breiter:
  - Kickstart: "KI-Prozessanalyse", "Automatisierungsplan", "Effizienz-Reports"
  - Komplett: "Komplett-Setup aller Geschaeftsprozesse", "Automatisierte Workflows", etc.

### 7. `src/components/landing/conversion/GuaranteeSection.tsx`
- Garantie-Text: Von "30% mehr qualifizierte Anfragen" zu **"messbare Effizienzsteigerung in Ihren Kernprozessen"**

### 8. `src/components/landing/conversion/ExitIntentPopup.tsx`
- Text: Von "KI-Sichtbarkeitsanalyse" und "wo Ihr Unternehmen Kunden verliert" zu **"KI-Potenzialanalyse"** und **"wo Ihr Unternehmen Zeit und Geld verschwendet"**

---

## Nicht betroffen

- Keine strukturellen Aenderungen (Layout, Komponenten, Routing bleiben gleich)
- Keine neuen Dateien oder Dependencies
- Rein textliche Ueberarbeitung in 8 Dateien

---

## Sequenz

1. Alle 8 Dateien parallel aktualisieren (reine Text-Aenderungen)
2. Build-Test
3. Visuelle Pruefung der Seite

