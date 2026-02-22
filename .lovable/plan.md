

## Header-Farbe auf exaktes Logo-Orange anpassen

### Problem

Der Header-Gradient spannt sich von dunklem Braun-Orange (`primary-deep`, HSL 25 85% 45%) bis hellem Gelb-Orange (`primary-light`, HSL 35 95% 65%). Das ergibt einen breiten Farbverlauf, der nicht dem einheitlichen Orange des KRS-Logos entspricht.

### Loesung

Den Header-Gradient deutlich enger um den Logo-Orange-Ton (`--primary`, HSL 30 90% 55%) zentrieren. Der Gradient bleibt bestehen fuer Tiefe, aber alle drei Stufen liegen nah beieinander, sodass das Gesamtbild einheitlich orange wirkt — wie das Logo.

### Aenderungen

**1. `src/index.css`** — Landing-Token-Werte anpassen (Light + Dark Mode)

Die Custom-Tokens werden naeher an den Primary-Ton gerueckt:

- `--primary-deep`: von `25 85% 45%` auf `28 88% 48%` (weniger braun, naeher am Logo-Orange)
- `--primary-light`: von `35 95% 65%` auf `32 92% 60%` (weniger gelb, naeher am Logo-Orange)
- `--gradient-start` und `--gradient-end` analog anpassen

Damit wird der Gradient im Header nur noch ein subtiler Helligkeitsunterschied innerhalb desselben Orange-Tons — kein sichtbarer Farbwechsel mehr von Braun nach Gelb.

**2. Betroffene Header-Komponenten**

`StickyConversionHeader.tsx`, `Header.tsx` und `AppLayout.tsx` nutzen alle `from-primary-deep via-primary to-primary-light`. Durch die Token-Anpassung in CSS aendern sich alle drei Header automatisch — keine Code-Aenderung in den Komponenten noetig.

### Ergebnis

Alle Header (Landing + App) zeigen ein einheitliches, sattes Orange, das dem Logo-Farbton entspricht. Der subtile Gradient sorgt weiterhin fuer visuelle Tiefe, ohne den Farbton zu verfaelschen.

