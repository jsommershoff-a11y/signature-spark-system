

# Plan: Farbstrategie trennen — Landing (Gruen) vs. App (Neutral)

## Zusammenfassung

Zwei getrennte Farbwelten: Die Landing Page bekommt das Gruen von jan-sommershoff.de als primaere Akzentfarbe (CTAs, Highlights, Badges). Der Mitgliederbereich wechselt auf eine neutrale, dunkle Farbpalette — Gruen nur noch fuer Erfolg/Status.

---

## Strategie

Das Gruen von jan-sommershoff.de (~HSL 160 70% 36%, Teal-Gruen) wird zur Landing-Primary. Im App-Bereich wird `--primary` auf ein neutrales Dunkel (Charcoal/Slate) gesetzt. Gruen bleibt als semantische Statusfarbe (`--success`) erhalten.

### Technischer Ansatz: CSS-Scope

Eine CSS-Klasse `.app-scope` auf dem AppLayout-Wrapper ueberschreibt `--primary` und verwandte Variablen. Die Landing Pages behalten die Root-Variablen.

---

## Aenderungen

### 1. `src/index.css` — Farbsystem erweitern

**Root (Landing-Kontext):**
- `--primary` aendern von Orange (`23 92% 54%`) zu Gruen (~`160 70% 36%`) — das Teal-Gruen von jan-sommershoff.de
- `--primary-foreground` bleibt weiss
- `--primary-deep`, `--primary-dark`, `--primary-light` auf Gruen-Varianten
- `--accent` ebenfalls Gruen-basiert
- `--ring` auf Gruen
- Neues Token: `--success: 152 60% 40%` fuer Status-Gruen im App

**Neuer Scope `.app-scope`:**
```css
.app-scope {
  --primary: 220 14% 20%;           /* Charcoal-Dunkel */
  --primary-foreground: 0 0% 100%;
  --accent: 220 13% 91%;            /* Neutral-Hell */
  --accent-foreground: 220 14% 20%;
  --ring: 220 14% 40%;
  --sidebar-primary: 220 14% 20%;
  --sidebar-primary-foreground: 0 0% 100%;
}
```

Dies bewirkt: Alle `bg-primary`, `text-primary`, `border-primary` Klassen im App-Bereich werden automatisch neutral-dunkel statt gruen.

### 2. `src/components/app/AppLayout.tsx`

- Dem aeusseren `<div>` die Klasse `app-scope` hinzufuegen
- Dadurch greifen alle App-Seiten automatisch die neutralen Farben

### 3. `src/components/app/AppSidebar.tsx`

- Active-State: Von `bg-primary/10 text-primary border-primary` zu `bg-muted text-foreground border-foreground/30` — subtiler, kein Gruen
- Hover: bleibt `hover:bg-muted/50` (schon neutral)

### 4. `src/components/dashboard/StaffDashboard.tsx`

- KPI-Icon-Hintergruende: Von `bg-primary/10` + `text-primary` zu `bg-muted` + `text-foreground`
- SalesCockpitWidget Mantra: Von `text-primary` zu `text-foreground font-semibold`
- Activity-Icons: Von `text-primary` zu `text-muted-foreground`
- Target-Icon: Von `text-primary` zu `text-foreground`
- Vertriebs-Cockpit Gradient: Von `from-primary/5` zu `from-muted/30`

### 5. `src/components/dashboard/AdminDashboard.tsx`

- Gleiche Aenderungen wie StaffDashboard: KPI-Icons neutral statt primary

### 6. `src/components/dashboard/KundeDashboard.tsx`

- Welcome-Card: Von `border-primary/15 bg-gradient-to-br from-primary/5` zu neutrale Gradient (`from-muted/20`)
- PlayCircle Icon: Von `text-primary` zu `text-success` (neue Statusfarbe)
- Quick-Link Icons: Von `bg-primary/10 text-primary` zu `bg-muted text-foreground`
- Freebie-Banner: Gradient neutral anpassen
- CTA-Button "Weiter lernen": Bleibt `bg-primary` — wird durch `.app-scope` automatisch neutral-dunkel

### 7. `src/components/ui/button.tsx`

- Keine Aenderung noetig — `bg-primary` wird durch CSS-Scope automatisch neutral im App, gruen auf Landing

### 8. `src/styles/landing-tokens.ts`

- `ctaPrimary` Gradient: Von `from-primary to-primary-light` — greift jetzt Gruen aus Root-Variablen
- Glow-Effekt: Farbe auf Gruen anpassen (`rgba(26,158,120,0.2)`)

### 9. Landing-Komponenten (keine individuellen Aenderungen noetig)

Da die Root-CSS-Variablen auf Gruen gesetzt werden und Landing Pages NICHT im `.app-scope` liegen, greifen alle `text-primary`, `bg-primary`, `border-primary` automatisch das neue Gruen. Das betrifft:
- HeroSection, CTAButton, FinalCtaSection, SolutionSection, etc.
- Alle bestehenden Landing-Sektionen funktionieren ohne Code-Aenderung

### 10. `tailwind.config.ts`

- Neuen `success` Token hinzufuegen: `success: "hsl(var(--success))"`
- Damit kann im App-Bereich `text-success`, `bg-success/10` fuer positive Zustaende genutzt werden

### 11. Bestehende `module-green` Referenzen

Die 14 Dateien die `module-green` nutzen (SocialMedia, EmailCampaigns, CalendarView etc.) bleiben unveraendert — `module-green` ist ein separates Token und nicht `--primary`. Diese Module behalten ihr eigenstaendiges Gruen.

---

## Dateien

1. `src/index.css` — Root-Primary auf Gruen, neuer `.app-scope` Block, `--success` Token
2. `tailwind.config.ts` — `success` Farbe hinzufuegen
3. `src/components/app/AppLayout.tsx` — `app-scope` Klasse setzen
4. `src/components/app/AppSidebar.tsx` — Active-State neutral
5. `src/components/dashboard/StaffDashboard.tsx` — Icons/Akzente neutral
6. `src/components/dashboard/AdminDashboard.tsx` — Icons/Akzente neutral
7. `src/components/dashboard/KundeDashboard.tsx` — Cards/Icons neutral
8. `src/styles/landing-tokens.ts` — Glow-Farbe auf Gruen

