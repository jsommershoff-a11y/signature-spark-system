

## Testimonial-Section auf 1 echtes Testimonial reduzieren

### Aenderung

Die zwei fiktiven Testimonials (Markus L., Julia W.) werden entfernt. Es bleibt ausschliesslich das reale Testimonial von **Rene Schreiner, AS Gaerten GmbH** mit Link.

### Technische Umsetzung

**Datei:** `src/components/landing/conversion/TestimonialGrid.tsx`

1. **Daten**: Das `testimonials`-Array wird auf einen einzigen Eintrag reduziert (Rene Schreiner mit Link).
2. **Layout**: Das Grid wechselt von `grid md:grid-cols-3` zu einem zentrierten Einzel-Card-Layout (`max-w-lg mx-auto`), damit die einzelne Karte nicht verloren wirkt.
3. **Keine weiteren Aenderungen** an Styling, Header oder Sternebewertung.

