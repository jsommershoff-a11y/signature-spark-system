

# Fix Step 01.1 – React Ref Warnings beheben

## Problem

Die Console zeigt 2 Warnings:
```
Warning: Function components cannot be given refs.
Check the render method of `MasterHome`.
  at CTAButton
  at Footer
```

## Ursache

In `MasterHome.tsx` wird `CTAButton` als Child von `<Link>` verwendet:
```tsx
<Link to="/qualifizierung">
  <CTAButton>Kostenloses Analysegespräch sichern</CTAButton>
</Link>
```

React Router's `<Link>` versucht eine `ref` an das Child-Element zu übergeben. Function Components können ohne `forwardRef` keine refs empfangen.

---

## Lösung

### Option A: CTAButton mit forwardRef (empfohlen)

`CTAButton` wird mit `React.forwardRef` umgebaut, sodass refs korrekt weitergeleitet werden:

```tsx
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "default" | "lg";
}

export const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ children, onClick, className, size = "lg" }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        size={size}
        className={cn(
          "bg-gradient-to-r from-primary to-primary-light hover:from-primary-deep hover:to-primary",
          "text-primary-foreground font-semibold text-lg px-8 py-6",
          "shadow-lg hover:shadow-xl transition-all duration-300",
          "rounded-lg",
          className
        )}
      >
        {children}
      </Button>
    );
  }
);

CTAButton.displayName = "CTAButton";
```

### Option B: MasterHome Link-Struktur anpassen

Alternativ die Link-Struktur in `MasterHome.tsx` ändern, um das Nesting zu vermeiden:

```tsx
// Statt:
<Link to="/qualifizierung">
  <CTAButton>...</CTAButton>
</Link>

// Besser:
<CTAButton onClick={() => navigate("/qualifizierung")}>
  Kostenloses Analysegespräch sichern
</CTAButton>
```

---

## Empfehlung

**Option A** ist die sauberere Lösung, da:
- `CTAButton` wird zukunftssicher für alle Anwendungsfälle
- Keine Änderungen an den aufrufenden Komponenten nötig
- Best Practice für wiederverwendbare Button-Komponenten

---

## Dateien zu ändern

| Datei | Aktion |
|-------|--------|
| `src/components/landing/CTAButton.tsx` | Mit `forwardRef` umbauen |

---

## Validierung nach Fix

| Test | Erwartetes Ergebnis |
|------|---------------------|
| Console Logs prüfen | 0 Warnings |
| `/` aufrufen | Seite lädt ohne Errors |
| CTA-Button klicken | Navigation zu `/qualifizierung` |
| Build prüfen | 0 TypeScript Errors |

