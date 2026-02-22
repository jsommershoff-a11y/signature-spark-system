

## Fix: Bild-Darstellung in der Kundenberichte-Section

### Problem

Das Bild wird mit `object-cover` und fester Hoehe angezeigt, wodurch es stark beschnitten wird. Es ist nur ein kleiner Ausschnitt (Firmenname-Text) sichtbar statt des gesamten Ergebnis-Screenshots.

### Loesung

In `src/components/landing/conversion/ResultsShowcase.tsx`:

1. **`object-cover` durch `object-contain` ersetzen** — damit das gesamte Bild sichtbar bleibt, ohne abgeschnitten zu werden
2. **Hintergrundfarbe fuer den Bildbereich hinzufuegen** (`bg-muted`) — damit bei `object-contain` kein leerer weisser Raum entsteht, sondern ein dezenter Hintergrund
3. **Mindesthoehe anpassen** — `h-64 md:h-full` durch `min-h-[300px] md:min-h-[400px]` ersetzen, damit das Bild genug Platz bekommt

### Betroffene Datei

`src/components/landing/conversion/ResultsShowcase.tsx` — nur die `<img>` und deren Container-`<div>` werden angepasst (2 Zeilen).

