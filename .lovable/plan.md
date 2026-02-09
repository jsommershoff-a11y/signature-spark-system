
# Step 05 — Footer Logo-Update

## Objective
Der Footer wird mit dem neuen KRS Signature Logo aktualisiert, um konsistentes Branding auf allen oeffentlichen Seiten zu gewaehrleisten.

## Aktuelle Situation

Der Footer verwendet derzeit ein einfaches Platzhalter-Logo:
```text
<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
  <span className="text-primary-foreground font-bold">K</span>
</div>
<span className="text-primary-foreground font-semibold">KRS Signature</span>
```

## Geplante Aenderung

Ersetzen des Platzhalters durch das offizielle Logo:
```text
<Link to="/" className="flex items-center mb-4">
  <img 
    src={logoSignature} 
    alt="KRS Signature Logo" 
    className="h-10 w-auto"
  />
</Link>
```

## Technische Details

### Logo-Import
```text
import logoSignature from "@/assets/logo-krs-signature.png";
```

### Styling-Ueberlegungen
- **Hoehe**: h-10 (40px) im Footer (etwas kleiner als h-12 im Header)
- **Hintergrund**: Der Footer hat `bg-foreground` (dunkler Hintergrund)
- **Logo-Sichtbarkeit**: Das Logo ist auf dunklem Hintergrund gut sichtbar (orangene Elemente)
- **Link**: Logo wird klickbar und fuehrt zur Startseite

### Entfallende Elemente
- Das blaue "K"-Quadrat Platzhalter
- Der separate "KRS Signature" Text (im Logo enthalten)

## Dateien (1)

| Aktion | Datei | Beschreibung |
|--------|-------|--------------|
| UPDATE | `src/components/landing/Footer.tsx` | Logo-Import und Ersetzung des Platzhalters |

## Vorher/Nachher Vergleich

**Vorher:**
```text
+--------+  KRS Signature
|   K    |  Die Plattform + ...
+--------+
```

**Nachher:**
```text
+------------------+
| [KRS Logo Image] |  (klickbar -> /)
+------------------+
Die Plattform + ...
```

## Validation Checklist
- [ ] Build erfolgreich (0 TypeScript-Fehler)
- [ ] Logo wird im Footer korrekt angezeigt
- [ ] Logo ist auf dunklem Hintergrund gut sichtbar
- [ ] Logo-Link fuehrt zur Startseite
- [ ] Responsive: Footer sieht auf Mobile gut aus
- [ ] Konsistenz: Header und Footer nutzen dasselbe Logo
