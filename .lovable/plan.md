

## Header-Redesign: Durchgehendes KRS-Orange mit prominentem CTA

### Problem

Der aktuelle Landing-Header (`StickyConversionHeader`) hat einen hellen/transparenten Hintergrund (`bg-background/90`). Das Logo "schwebt" auf hellem Grund, der CTA-Button ist klein und unauffaellig. Es fehlt die markante KRS-Orange-Identitaet, die bereits im App-Header umgesetzt ist.

### Loesung

Den Landing-Header analog zum App-Header mit einem durchgehenden Orange-Gradient gestalten. Schriftfarben und CTA auf den dunklen Hintergrund anpassen.

### Aenderungen

**1. `src/components/landing/conversion/StickyConversionHeader.tsx`** (MasterHome Header)

- Hintergrund: `bg-gradient-to-r from-primary-deep via-primary to-primary-light` mit `shadow-md` (wie App-Header)
- Border entfernen (nicht noetig bei durchgehendem Farbhintergrund)
- Login-Button: `text-primary-foreground` mit `hover:bg-primary-foreground/20` (weiss auf Orange)
- CTA-Button: Weisser Button mit orangener Schrift (`bg-white text-primary-deep hover:bg-white/90`) — damit er sich klar vom orangenen Hintergrund abhebt und sofort ins Auge faellt
- Hoehe leicht erhoehen auf `h-16` fuer mehr Praesenz

**2. `src/components/landing/Header.tsx`** (Branchen-Seiten Header)

- Gleiche Anpassung: Orange-Gradient-Hintergrund
- Branchen-Dropdown-Trigger: `text-primary-foreground` statt `text-muted-foreground`
- Login-Button: `text-primary-foreground border-primary-foreground/30`
- CTA-Button: Weiss auf Orange (`bg-white text-primary-deep`)
- Mobile Hamburger-Icon: `text-primary-foreground`

### Ergebnis

Beide Landing-Header bekommen den gleichen durchgehenden KRS-Orange-Look wie der App-Header — mit einem weissen CTA-Button, der sich klar abhebt und sofort auffaellt.
