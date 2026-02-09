

# Step 09 — Impressum & Datenschutz Links im Footer einfügen

## Objective
Die Platzhalter "Impressum (folgt)" und "Datenschutz (folgt)" im Footer werden durch funktionierende externe Links zur KRS Immobilien Website ersetzt.

## Aktuelle Situation

Der Footer enthält aktuell inaktive Platzhalter:
```tsx
<span className="text-muted text-sm">Impressum (folgt)</span>
<span className="text-muted text-sm">Datenschutz (folgt)</span>
```

## Geplante Änderung

Die `<span>`-Elemente werden durch externe `<a>`-Links ersetzt:

| Platzhalter | Neuer Link |
|-------------|------------|
| Impressum (folgt) | https://krsimmobilien.de/impressum |
| Datenschutz (folgt) | https://krsimmobilien.de/datenschutz |

## Technische Details

**Zeile 57-58 in Footer.tsx:**

Vorher:
```tsx
<span className="text-muted text-sm">Impressum (folgt)</span>
<span className="text-muted text-sm">Datenschutz (folgt)</span>
```

Nachher:
```tsx
<a 
  href="https://krsimmobilien.de/impressum"
  target="_blank"
  rel="noopener noreferrer"
  className="text-muted hover:text-primary-foreground transition-colors text-sm"
>
  Impressum
</a>
<a 
  href="https://krsimmobilien.de/datenschutz"
  target="_blank"
  rel="noopener noreferrer"
  className="text-muted hover:text-primary-foreground transition-colors text-sm"
>
  Datenschutz
</a>
```

## Wichtige Attribute

- `target="_blank"` — Öffnet in neuem Tab (externe Domain)
- `rel="noopener noreferrer"` — Sicherheit bei externen Links

## Datei

| Aktion | Datei | Beschreibung |
|--------|-------|--------------|
| UPDATE | `src/components/landing/Footer.tsx` | Platzhalter durch externe Links ersetzen |

## Validation Checklist

- [ ] Build erfolgreich (0 TypeScript-Fehler)
- [ ] Impressum-Link öffnet krsimmobilien.de/impressum in neuem Tab
- [ ] Datenschutz-Link öffnet krsimmobilien.de/datenschutz in neuem Tab
- [ ] Hover-Effekt funktioniert (text-muted → text-primary-foreground)
- [ ] Links erscheinen konsistent mit anderen Footer-Links

