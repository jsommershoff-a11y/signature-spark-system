

## Neue Section: Kundenberichte / Referenzen mit Ergebnis-Bildern

### Uebersicht

Eine neue Landingpage-Section "Kundenberichte" wird zwischen dem bestehenden Testimonial (Zitat) und der Pricing-Section eingefuegt. Sie zeigt konkrete, visuelle Ergebnisse (Screenshots/Bilder) als Beweis fuer die Leistung.

### Aenderungen

**1. Bild kopieren**

Das hochgeladene Bild (53 Bewerber Screenshot) wird nach `src/assets/result-as-gaerten-bewerber.jpeg` kopiert.

**2. Neue Komponente: `src/components/landing/conversion/ResultsShowcase.tsx`**

- Headline: "Echte Ergebnisse unserer Kunden"
- Ergebnis-Karten mit:
  - Bild (Screenshot) links
  - Rechts: Kundenname, Beschreibung, Kennzahl (z.B. "53 Bewerber"), Link zur Website (https://www.as-gaerten-gmbh.de)
- Responsives Layout (gestapelt auf Mobile, nebeneinander auf Desktop)
- Datenstruktur als Array, damit spaeter weitere Ergebnisse einfach ergaenzt werden koennen
- Link zur externen Kundenbewertungsseite

**3. Einbau in MasterHome.tsx**

Die neue Section wird direkt nach `<TestimonialGrid />` und vor `<PricingSection />` eingefuegt:

```text
<TestimonialGrid />
<ResultsShowcase />     <-- NEU
<PricingSection />
```

**4. Export in `src/components/landing/conversion/index.ts`**

`ResultsShowcase` wird zum barrel export hinzugefuegt.

### Technische Details

- Das Bild wird als ES6-Import eingebunden (`import resultImg from "@/assets/result-as-gaerten-bewerber.jpeg"`)
- Styling folgt die bestehenden Landing-Patterns: `py-16 md:py-24`, `max-w-6xl mx-auto`, `rounded-2xl` Karten
- Die Kennzahl "53" wird gross und prominent dargestellt (aehnlich einer KPI-Zahl)
- Der Firmenlink zeigt auf https://www.as-gaerten-gmbh.de und oeffnet in neuem Tab
- Die Komponente ist erweiterbar: Weitere Ergebnisse koennen spaeter als zusaetzliche Array-Eintraege hinzugefuegt werden

