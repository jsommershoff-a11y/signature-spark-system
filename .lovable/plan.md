
# Step 07 — Primaerfarbe von Blau auf Orange umstellen

## Objective
Das komplette Farbschema wird von Blau auf Orange umgestellt. Orange wird zur neuen Primaerfarbe (`--primary`), waehrend Blau komplett aus dem Design entfernt wird. Dies betrifft CSS-Variablen, Gradient-Tokens und alle Komponenten.

## Farbstrategie

### Neue Farbpalette (Orange-basiert)
| Token | Alt (Blau) | Neu (Orange) |
|-------|-----------|--------------|
| `--primary` | 224 76% 48% (Blau) | 30 90% 55% (Brand Orange) |
| `--primary-deep` | 224 76% 36% | 25 85% 45% (dunkler Orange) |
| `--primary-dark` | 226 71% 24% | 20 70% 30% (sehr dunkel) |
| `--primary-light` | 217 91% 60% | 35 95% 65% (heller Orange) |
| `--accent` | 217 91% 60% | 35 95% 65% (heller Orange) |
| `--ring` | 224 76% 48% | 30 90% 55% (Brand Orange) |

### Gradient-Anpassung
Die Gradienten werden von Blau-Blau auf Orange-Orange umgestellt:
- `from-primary to-primary-light` → Orange zu hellem Orange
- `from-primary-dark via-primary to-primary-deep` → FinalCTA Hintergrund

## Betroffene Dateien (12)

### 1. Design System Kern
| Datei | Aenderung |
|-------|-----------|
| `src/index.css` | CSS-Variablen auf Orange umstellen (Light + Dark Mode) |
| `src/styles/landing-tokens.ts` | `ctaSecondary` hover-Farbe anpassen |

### 2. Landing Komponenten
| Datei | Aenderung |
|-------|-----------|
| `src/components/landing/Header.tsx` | Gradient-CTAs und hover:text-primary |
| `src/components/landing/Footer.tsx` | Bleibt unveraendert (nutzt foreground) |
| `src/components/landing/CTAButton.tsx` | Gradient bereits via CSS-Variablen, hover-shadow anpassen |
| `src/components/landing/FinalCTA.tsx` | Gradient-Hintergrund + Text-Farben |
| `src/components/landing/Hero.tsx` | Background decoration bg-primary/5 |
| `src/components/landing/OutcomeSection.tsx` | bg-primary, border-primary |
| `src/components/landing/PlatformProof.tsx` | bg-primary/10, text-primary |
| `src/components/landing/ProblemSection.tsx` | text-primary im Outro |
| `src/components/landing/SystemSection.tsx` | bg-primary/10, text-primary |
| `src/components/landing/FAQSection.tsx` | hover:text-primary |
| `src/components/landing/ContactModal.tsx` | Gradient-CTA, bg-primary/10 |

### 3. Formulare
| Datei | Aenderung |
|-------|-----------|
| `src/pages/landing/Qualifizierung.tsx` | Gradient-CTA Button |

## Technische Umsetzung

### index.css - Neue Farbwerte
```css
:root {
  /* Primary wird Orange */
  --primary: 30 90% 55%;
  --primary-foreground: 0 0% 100%;
  
  /* Custom landing page tokens (Orange-Palette) */
  --primary-deep: 25 85% 45%;
  --primary-dark: 20 70% 30%;
  --primary-light: 35 95% 65%;
  --gradient-start: 30 90% 55%;
  --gradient-end: 35 95% 65%;
  
  /* Accent und Ring auch Orange */
  --accent: 35 95% 65%;
  --ring: 30 90% 55%;
  
  /* Sidebar Primary */
  --sidebar-primary: 30 90% 55%;
  --sidebar-ring: 35 95% 65%;
}

.dark {
  --primary: 35 95% 65%;
  --primary-foreground: 20 70% 10%;
  
  --accent: 35 95% 65%;
  --ring: 35 95% 65%;
  
  --sidebar-primary: 35 95% 65%;
  --sidebar-ring: 35 95% 65%;
}
```

### Komponenten-Anpassungen

Da die CSS-Variablen global geaendert werden, aendern sich automatisch:
- Alle `bg-primary` → werden Orange
- Alle `text-primary` → werden Orange
- Alle `border-primary` → werden Orange
- Alle Gradienten `from-primary to-primary-light` → Orange-Gradient

### FinalCTA spezielle Anpassung
Der Hintergrund-Gradient muss explizit angepasst werden:
```tsx
// Vorher: blaue Toene
className="bg-gradient-to-br from-primary-dark via-primary to-primary-deep"

// Nachher: automatisch orange durch CSS-Variablen
// Keine Code-Aenderung noetig, da Variablen geaendert werden
```

### CTAButton Hover-Shadow
Der orange Glow ist bereits implementiert:
```tsx
"hover:shadow-[0_0_20px_rgba(230,126,34,0.3)]"
```
Dies passt perfekt zur neuen Orange-Primaerfarbe.

## Dateien im Detail

### src/index.css (Hauptaenderung)

**Light Mode (:root)**
- `--primary`: 224 76% 48% → 30 90% 55%
- `--primary-deep`: 224 76% 36% → 25 85% 45%
- `--primary-dark`: 226 71% 24% → 20 70% 30%
- `--primary-light`: 217 91% 60% → 35 95% 65%
- `--gradient-start`: 224 76% 48% → 30 90% 55%
- `--gradient-end`: 217 91% 60% → 35 95% 65%
- `--accent`: 217 91% 60% → 35 95% 65%
- `--ring`: 224 76% 48% → 30 90% 55%
- `--sidebar-primary`: 224 76% 48% → 30 90% 55%
- `--sidebar-ring`: 217 91% 60% → 35 95% 65%

**Dark Mode (.dark)**
- `--primary`: 217 91% 60% → 35 95% 65%
- `--primary-foreground`: 226 71% 8% → 20 70% 10%
- `--accent`: 217 91% 60% → 35 95% 65%
- `--ring`: 217 91% 60% → 35 95% 65%
- `--sidebar-primary`: 217 91% 60% → 35 95% 65%
- `--sidebar-ring`: 217 91% 60% → 35 95% 65%

## Visuelle Auswirkung

### Vorher (Blau-Schema)
```
+------------------+
|  [Blaue CTAs]    |
|  [Blaue Badges]  |
|  [Blaue Icons]   |
+------------------+
```

### Nachher (Orange-Schema)
```
+-------------------+
|  [Orange CTAs]    |
|  [Orange Badges]  |
|  [Orange Icons]   |
+-------------------+
```

## Automatische Aenderungen durch CSS-Variablen

Durch die Aenderung der CSS-Variablen werden automatisch alle folgenden Elemente orange:

1. **Header**: CTA-Button, Navigation-Hover
2. **Hero**: Hintergrund-Dekoration
3. **OutcomeSection**: Checkmark-Kreise, Borders
4. **PlatformProof**: Checkmark-Icons
5. **SystemSection**: Modul-Nummern, Icons
6. **FinalCTA**: Kompletter Gradient-Hintergrund
7. **FAQSection**: Accordion-Trigger Hover
8. **ContactModal**: Submit-Button, Success-Icon
9. **Qualifizierung**: Submit-Button

## Keine Code-Aenderungen noetig in

Diese Komponenten nutzen bereits `primary`-Variablen und werden automatisch orange:
- PersonalSupport.tsx (bereits bg-brand-orange)
- MasterHome.tsx (badgeAccent bereits orange)
- CTAButton.tsx (nutzt primary-Variablen)

## Validation Checklist

- [ ] Build erfolgreich (0 TypeScript-Fehler)
- [ ] Alle CTAs sind orange
- [ ] FinalCTA-Hintergrund ist orange-Gradient
- [ ] Header-Navigation hover zeigt Orange
- [ ] Checkmarks und Icons sind konsistent orange
- [ ] Dark Mode funktioniert mit Orange-Palette
- [ ] Keine blauen Elemente mehr sichtbar
- [ ] Responsive: Mobile und Desktop konsistent
