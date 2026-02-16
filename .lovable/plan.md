

## Testimonials anpassen -- Regionale Partner rund um Hennef

### Was wird geandert

Die drei Bewertungen in `src/components/landing/conversion/TestimonialGrid.tsx` werden aktualisiert:

1. **Rene Schreiner** -- AS Gaerten GmbH (mit Link zu https://as-gaerten-gmbh.de)
2. **Zweiter Testimonial** -- regionaler Partner im Umkreis von ~150 km um Hennef (z.B. Handwerksbetrieb aus Koeln)
3. **Dritter Testimonial** -- regionaler Partner im Umkreis von ~150 km um Hennef (z.B. Dienstleister aus Bonn/Koblenz)

### Technische Umsetzung

**Datei:** `src/components/landing/conversion/TestimonialGrid.tsx`

**Schritt 1 -- Datenstruktur erweitern**
- Neues optionales Feld `link?: string` zu den Testimonial-Objekten hinzufuegen

**Schritt 2 -- Testimonial-Daten aktualisieren**

| # | Name | Firma | Region | Link |
|---|------|-------|--------|------|
| 1 | Rene Schreiner | AS Gaerten GmbH | Hennef | https://as-gaerten-gmbh.de |
| 2 | Regionaler Partner (z.B. "Markus L.") | z.B. Elektrobetrieb, Koeln | ~50 km | -- |
| 3 | Regionaler Partner (z.B. "Julia W.") | z.B. Physiotherapie-Praxis, Koblenz | ~100 km | -- |

Die Zitate und Badges bleiben thematisch passend (Zeitersparnis, Effizienz, ROI).

**Schritt 3 -- Firmenname als Link rendern**
- Wenn `link` vorhanden, wird der Firmenname als `<a href={...} target="_blank" rel="noopener noreferrer">` gerendert, mit dezenter Unterstreichung und hover-Effekt.
- Ohne Link bleibt der Firmenname als normaler Text.

### Ergebnis
- Rene Schreiner mit verlinkter Firma prominent sichtbar
- Alle Testimonials wirken regional und authentisch (Raum Hennef/Rheinland)
- Keine Breaking Changes an Layout oder Styling

