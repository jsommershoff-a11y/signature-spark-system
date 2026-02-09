
# Step 06 — Brand-Farben Integration (brand-orange)

## Objective
Die neuen Brand-Farben (insbesondere `brand-orange`) werden als Akzentfarben in CTAs, Badges und UI-Elementen eingesetzt, um das Branding vom Logo auf die gesamte Benutzeroberflaeche zu uebertragen.

## Designstrategie

Das bestehende Blau-Schema bleibt als Hauptfarbe erhalten. Die Brand-Farbe Orange wird strategisch als **Aufmerksamkeits-Akzent** eingesetzt:

| Element | Aktuelle Farbe | Neue Farbe | Begruendung |
|---------|----------------|------------|-------------|
| Umsatz-Badge (Homepage) | Grauer Border | Orange Border + Text | Eye-Catcher fuer Qualifikation |
| CTA Hover-State | Dunkelblau | Orange Glow/Akzent | Erhoehte Klick-Motivation |
| Checkmarks (PersonalSupport) | Blau | Orange | Konsistenz mit Logo |
| Dekorative Elemente | Blau/10 | Orange/20 | Subtiler Marken-Akzent |

## Geplante Aenderungen

### 1. Landing-Tokens erweitern
**Datei:** `src/styles/landing-tokens.ts`

Neuer Badge-Stil mit Brand-Orange:
```text
badgeAccent: "inline-flex items-center rounded-full border-2 border-brand-orange/60 bg-brand-orange/10 px-4 py-1 text-sm font-semibold text-brand-orange"
```

### 2. Homepage Badge aktualisieren
**Datei:** `src/pages/landing/MasterHome.tsx`

Das "Nur fuer Unternehmer ab 100.000 EUR"-Badge erhaelt den neuen Orange-Akzent-Stil.

### 3. CTAButton Hover-Akzent
**Datei:** `src/components/landing/CTAButton.tsx`

Subtiler Orange-Glow beim Hover:
```text
hover:shadow-[0_0_20px_rgba(230,126,34,0.3)]
```

### 4. PersonalSupport Checkmarks
**Datei:** `src/components/landing/PersonalSupport.tsx`

Checkmark-Kreise von `bg-primary` zu `bg-brand-orange` aendern, um die Logo-Farbe aufzugreifen.

### 5. Dekorative Elemente
**Datei:** `src/components/landing/PersonalSupport.tsx`

Die dekorativen Quadrate neben dem Portrait von `bg-primary/10` zu `bg-brand-orange/20` aendern.

## Dateien (4)

| Aktion | Datei | Beschreibung |
|--------|-------|--------------|
| UPDATE | `src/styles/landing-tokens.ts` | Neuen `badgeAccent` Token hinzufuegen |
| UPDATE | `src/pages/landing/MasterHome.tsx` | Badge mit Orange-Akzent |
| UPDATE | `src/components/landing/CTAButton.tsx` | Orange Hover-Glow |
| UPDATE | `src/components/landing/PersonalSupport.tsx` | Checkmarks + Deko in Orange |

## Farbharmonie

```text
Primaer (Blau)     + Akzent (Orange)
+---------------+  +---------------+
| CTA Buttons   |  | Badges        |
| Backgrounds   |  | Checkmarks    |
| Links         |  | Hover-Effects |
| Headers       |  | Deko-Elemente |
+---------------+  +---------------+
```

Die Komplementaerfarben Blau und Orange erzeugen einen professionellen, aber auffaelligen Kontrast, der die Conversion steigern kann.

## Technische Details

### CSS Variablen (bereits vorhanden)
```css
--brand-orange: 30 90% 55%;  /* HSL */
```

### Tailwind Klassen (bereits verfuegbar)
- `bg-brand-orange` — Hintergrund
- `text-brand-orange` — Textfarbe
- `border-brand-orange` — Rahmenfarbe
- Mit Opacity: `bg-brand-orange/20`, `border-brand-orange/60`

### Hover Shadow (RGB fuer box-shadow)
Da Tailwind keine HSL-Shadows unterstuetzt, verwenden wir RGB:
```text
rgba(230, 126, 34, 0.3)  /* Brand Orange mit 30% Opacity */
```

## Validation Checklist
- [ ] Build erfolgreich (0 TypeScript-Fehler)
- [ ] Badge auf Homepage zeigt Orange-Akzent
- [ ] CTA-Buttons haben Orange-Glow beim Hover
- [ ] Checkmarks in PersonalSupport sind orange
- [ ] Dekorative Elemente greifen Logo-Farbe auf
- [ ] Farbharmonie zwischen Blau und Orange ist stimmig
- [ ] Responsive: Alle Aenderungen funktionieren auf Mobile
