

# Step 04 — Logo-Integration + Markenfarben-Export

## Objective
Das neue KRS Signature Logo wird als offizielles Logo integriert und die Markenfarben aus dem Logo werden in das Design-System exportiert, um als Akzentfarben verwendet zu werden.

## Farbanalyse aus dem Logo

Aus dem hochgeladenen Logo wurden folgende Farben extrahiert:

| Farbe | Verwendung | HSL-Wert |
|-------|------------|----------|
| **Brand Orange** | Hintergrund, Akzent | 30 90% 55% |
| **Brand Cream** | Balken hell | 35 25% 75% |
| **Brand Brown** | Balken mittel | 20 30% 35% |
| **Brand Charcoal** | Balken dunkel | 20 20% 25% |

## Scope

### 1. Logo-Datei kopieren
Das hochgeladene Logo wird in den Assets-Ordner kopiert als `logo-krs-signature.png` (neuer Name zur Unterscheidung vom alten Logo).

### 2. CSS-Variablen erweitern
**Datei:** `src/index.css`

Neue Brand-Farben im CSS hinzufügen:
```css
/* Brand Colors from Logo */
--brand-orange: 30 90% 55%;
--brand-cream: 35 25% 75%;
--brand-brown: 20 30% 35%;
--brand-charcoal: 20 20% 25%;
```

### 3. Tailwind-Config erweitern
**Datei:** `tailwind.config.ts`

Neue Farben in Tailwind verfügbar machen:
```text
brand: {
  orange: "hsl(var(--brand-orange))",
  cream: "hsl(var(--brand-cream))",
  brown: "hsl(var(--brand-brown))",
  charcoal: "hsl(var(--brand-charcoal))",
}
```

### 4. Header aktualisieren
**Datei:** `src/components/landing/Header.tsx`

Neues Logo importieren und verwenden:
- Import von `logo-krs-signature.png`
- Groessere Logo-Darstellung (h-12 statt h-10)
- Optional: Nur Logo ohne Text-Marke

## Dateien (4)

| Aktion | Datei | Beschreibung |
|--------|-------|--------------|
| COPY | `user-uploads://...png` → `src/assets/logo-krs-signature.png` | Logo-Datei kopieren |
| UPDATE | `src/index.css` | Brand-Farbvariablen hinzufuegen |
| UPDATE | `tailwind.config.ts` | Brand-Farben in Tailwind |
| UPDATE | `src/components/landing/Header.tsx` | Neues Logo verwenden |

## Technische Details

### Farbverwendung im Design
Die neuen Brand-Farben ergaenzen das bestehende Blau-Schema:
- **brand-orange**: Fuer Akzente, Badges, Hover-States
- **brand-cream/brown/charcoal**: Fuer subtile Hintergruende, Borders, Variationen

### Logo-Groesse
Das neue Logo hat mehr Details, daher:
- Header Desktop: h-12 (48px)
- Header Mobile: h-10 (40px)

### Abwaertskompatibilitaet
Das alte `logo-signature.png` bleibt bestehen fuer eventuelle Fallbacks.

## Farbpalette Visualisierung

```text
+-------------+-------------+-------------+-------------+
| Brand Orange| Brand Cream | Brand Brown | Brand Charcoal|
| #E67E22     | #C9B896     | #73503C     | #4A3D33     |
| 30 90% 55%  | 35 25% 75%  | 20 30% 35%  | 20 20% 25%  |
+-------------+-------------+-------------+-------------+
```

## Validation Checklist
- [ ] Build erfolgreich (0 TypeScript-Fehler)
- [ ] Logo wird korrekt im Header angezeigt
- [ ] Brand-Farben sind ueber Tailwind-Klassen nutzbar
- [ ] Responsive: Logo skaliert auf Mobile
- [ ] Keine Regression auf bestehenden Seiten

