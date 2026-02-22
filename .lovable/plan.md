

## Header-Farbe auf exakten Farbcode #f6711f anpassen

### Farbumrechnung

Hex `#f6711f` = HSL `23 92% 54%`

### Aenderungen in `src/index.css` (Light + Dark Mode)

Folgende Tokens werden auf den exakten Logo-Farbton zentriert:

| Token | Aktuell | Neu |
|---|---|---|
| `--primary` | `30 90% 55%` | `23 92% 54%` |
| `--primary-deep` | `28 88% 48%` | `23 92% 47%` |
| `--primary-light` | `32 92% 60%` | `23 92% 61%` |
| `--gradient-start` | `28 88% 48%` | `23 92% 47%` |
| `--gradient-end` | `32 92% 60%` | `23 92% 61%` |
| `--brand-orange` | `30 90% 55%` | `23 92% 54%` |
| `--ring` | `30 90% 55%` | `23 92% 54%` |
| `--sidebar-primary` | `30 90% 55%` | `23 92% 54%` |

Der Farbton (Hue 23) und die Saettigung (92%) bleiben bei allen Stufen identisch — nur die Helligkeit variiert leicht (47% / 54% / 61%) fuer den subtilen Gradient-Effekt.

### Betroffene Bereiche (automatisch)

- Landing-Header (`StickyConversionHeader`, `Header`)
- App-Header (`AppLayout`)
- CTA-Buttons, Badges, Links
- Sidebar-Highlights

Keine Komponenten-Dateien muessen geaendert werden — alles laeuft ueber die CSS-Variablen.

