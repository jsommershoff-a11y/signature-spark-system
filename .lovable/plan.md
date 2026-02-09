

# Step 08 — FinalCTA-Button auf Orange-Gradient umstellen

## Objective
Der Button in der FinalCTA-Sektion wird vom aktuellen weißen Stil auf den konsistenten Orange-Gradient umgestellt, damit alle CTA-Buttons im gesamten Design einheitlich aussehen.

## Aktuelle Situation

Der FinalCTA-Button überschreibt aktuell den Standard-Gradient:
```tsx
<CTAButton 
  onClick={onCtaClick}
  className="bg-white text-primary hover:bg-white/90 hover:text-primary-deep"
>
```

Das ergibt einen **weißen Button mit orangem Text** auf einem orangen Hintergrund.

## Geplante Änderung

Die custom className wird entfernt, sodass der Button den Standard-Orange-Gradient der CTAButton-Komponente verwendet:
```tsx
<CTAButton onClick={onCtaClick}>
  {ctaText}
</CTAButton>
```

## Visueller Effekt

| Vorher | Nachher |
|--------|---------|
| Weißer Button, oranger Text | Oranger Gradient-Button, weißer Text |
| Weniger auffällig | Einheitlich mit allen anderen CTAs |

## Datei

| Aktion | Datei | Beschreibung |
|--------|-------|--------------|
| UPDATE | `src/components/landing/FinalCTA.tsx` | className-Override entfernen |

## Technische Details

**Zeile 29-33 in FinalCTA.tsx:**

Vorher:
```tsx
<CTAButton 
  onClick={onCtaClick}
  className="bg-white text-primary hover:bg-white/90 hover:text-primary-deep"
>
  {ctaText}
</CTAButton>
```

Nachher:
```tsx
<CTAButton onClick={onCtaClick}>
  {ctaText}
</CTAButton>
```

Der Button übernimmt dann automatisch:
- `bg-gradient-to-r from-primary to-primary-light` (Orange-Gradient)
- `hover:from-primary-deep hover:to-primary` (Hover-Effekt)
- `hover:shadow-[0_0_20px_rgba(230,126,34,0.3)]` (Orange Glow)
- `text-primary-foreground` (Weißer Text)

## Validation Checklist

- [ ] Build erfolgreich (0 TypeScript-Fehler)
- [ ] FinalCTA-Button zeigt Orange-Gradient
- [ ] Hover-Effekt mit Orange-Glow funktioniert
- [ ] Button ist auf orangem Hintergrund gut sichtbar
- [ ] Konsistenz mit anderen CTAs auf der Seite

