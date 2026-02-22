

## Fehler im Angebotsbereich beheben

### Identifizierte Probleme

**1. React Ref-Warnung: "Function components cannot be given refs"**

Zwei Console-Errors erscheinen beim Laden der Offers-Seite:
- `CreateOfferDialog` wird von der Offers-Seite als Komponente gerendert. Radix `Dialog` versucht intern, einen Ref an das Kind-Element weiterzugeben, aber `CreateOfferDialog` ist eine einfache Funktionskomponente ohne `forwardRef`.
- Innerhalb von `CreateOfferDialog` tritt dasselbe Problem auf: `Dialog` versucht einen Ref an sein Kind zu geben.

**2. Angebote ohne zugeordneten Lead werden nicht angezeigt**

Die Supabase-Query in `useOffers` verwendet `crm_leads!inner(...)`. Das `!inner`-Keyword bedeutet: Nur Angebote MIT einem existierenden Lead werden zurueckgegeben. Falls ein Lead geloescht wurde, verschwinden alle zugehoerigen Angebote aus der Liste — ohne Fehlermeldung.

### Loesung

**Step 01 — CreateOfferDialog mit forwardRef umschliessen**

Datei: `src/components/offers/CreateOfferDialog.tsx`

Die Komponente wird mit `React.forwardRef` gewrappt, damit Radix Dialog den Ref korrekt weiterleiten kann. Die Export-Signatur bleibt gleich.

Aenderung:
```typescript
// Vorher:
export function CreateOfferDialog({ open, onOpenChange }: CreateOfferDialogProps) {

// Nachher:
import { forwardRef } from 'react';

export const CreateOfferDialog = forwardRef<HTMLDivElement, CreateOfferDialogProps>(
  function CreateOfferDialog({ open, onOpenChange }, ref) {
    // ... bestehender Code bleibt identisch
  }
);
```

**Step 02 — Inner Join durch Left Join ersetzen**

Datei: `src/hooks/useOffers.ts`

Das `!inner` in der Query wird entfernt, damit auch Angebote ohne zugeordneten Lead angezeigt werden (z.B. wenn ein Lead geloescht wurde). Der Code, der `item.crm_leads` mapped, wird mit einem Fallback abgesichert.

Aenderung:
```typescript
// Vorher:
crm_leads!inner (id, first_name, last_name, email, company)

// Nachher:
crm_leads (id, first_name, last_name, email, company)
```

Und im Mapping:
```typescript
lead: item.crm_leads || null,
```

### Ergebnis

- Keine Console-Errors mehr auf der Angebots-Seite
- Angebote bleiben sichtbar, auch wenn der zugehoerige Lead geloescht wurde
- Keine Aenderung an der Datenbankstruktur noetig (nur Frontend-Code)

