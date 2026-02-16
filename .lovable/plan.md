

## Testimonial von Rene Schreiner erweitern und Website verlinken

### Aenderung

Das bestehende Testimonial in `src/components/landing/conversion/TestimonialGrid.tsx` wird inhaltlich erweitert:

**Aktualisierte Daten:**
- **Firma**: AS Gaerten GmbH, Koeln (statt Hennef)
- **Link**: https://as-gaerten-gmbh.de (bleibt, wird auch im Zitat-Kontext erwaehnt)
- **Zitat**: Ausfuehrlicher -- beschreibt die konkreten Ergebnisse:
  - Neue Website implementiert
  - Eigenes CRM, Planungs-, Mitarbeiter- und Kundenportal integriert
  - 40 Bewerbungen generiert, neue Mitarbeiter gewonnen
  - Gesamte Prozesse extrem erleichtert
  - "Der Value ist unmessbar"
- **Badge**: Anpassung auf z.B. "Unmessbarer Value" oder "40+ Bewerbungen"

### Technische Umsetzung

**Datei:** `src/components/landing/conversion/TestimonialGrid.tsx`

1. `company` aendern auf "AS Gaerten GmbH, Koeln"
2. `quote` durch ein laengeres, detailliertes Zitat ersetzen, das alle genannten Ergebnisse abdeckt
3. `badge` anpassen (z.B. "40+ Bewerbungen generiert")
4. Link bleibt wie gehabt als klickbarer Firmenname

Keine Layout- oder Strukturaenderungen noetig -- die einzelne zentrierte Karte traegt auch ein laengeres Zitat gut.

