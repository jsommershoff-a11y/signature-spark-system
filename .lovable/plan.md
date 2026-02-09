

# Step 03 - Branchen-Landingpages auf PublicLayout migrieren

## Objective
Migration aller 5 Branchen-Landingpages auf das neue `PublicLayout`-Pattern für konsistentes Styling und reduzierte Code-Duplizierung.

## Abgeschlossene Steps (Zusammenfassung)

| Step | Titel | Status |
|------|-------|--------|
| 01.1 | Industry Landing Pages (5 Seiten) | PASS |
| 01.2 | Qualification Funnel (/qualifizierung + /danke) | PASS |
| 01.3 | Database Constraint Fix (leads_source_check) | PASS |
| 02 | Homepage Redesign + Landing Token System | PASS |

## Scope

### Betroffene Dateien (5 Landingpages)

| Datei | Aktuelle Struktur |
|-------|-------------------|
| `src/pages/landing/Handwerk.tsx` | Manuelles Header/Footer |
| `src/pages/landing/Praxen.tsx` | Manuelles Header/Footer |
| `src/pages/landing/Dienstleister.tsx` | Manuelles Header/Footer |
| `src/pages/landing/Immobilien.tsx` | Manuelles Header/Footer |
| `src/pages/landing/Kurzzeitvermietung.tsx` | Manuelles Header/Footer |

### Transformation pro Datei

**Vorher:**
```text
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
...
return (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 pt-16">
      <Hero ... />
      <ProblemSection ... />
      ...
    </main>
    <Footer />
    <ContactModal ... />
  </div>
);
```

**Nachher:**
```text
import { PublicLayout } from "@/components/landing/PublicLayout";
...
return (
  <PublicLayout>
    <Hero ... />
    <ProblemSection ... />
    ...
    <ContactModal ... />
  </PublicLayout>
);
```

### Entfernte Imports (pro Datei)
- `Header` (jetzt via PublicLayout)
- `Footer` (jetzt via PublicLayout)

### Hinzugefügte Imports (pro Datei)
- `PublicLayout`

## Vorteile der Migration

1. **Weniger Code-Duplizierung**: Header/Footer-Wrapper an einer Stelle
2. **Konsistenz**: Alle Landingpages nutzen dasselbe Layout
3. **Wartbarkeit**: Layout-Anpassungen nur in PublicLayout.tsx
4. **Zukuenftige Erweiterungen**: z.B. Cookie-Banner, Analytics-Skripte zentral einfuegen

## Dateien (5)

| Aktion | Datei | Beschreibung |
|--------|-------|--------------|
| UPDATE | `src/pages/landing/Handwerk.tsx` | PublicLayout Migration |
| UPDATE | `src/pages/landing/Praxen.tsx` | PublicLayout Migration |
| UPDATE | `src/pages/landing/Dienstleister.tsx` | PublicLayout Migration |
| UPDATE | `src/pages/landing/Immobilien.tsx` | PublicLayout Migration |
| UPDATE | `src/pages/landing/Kurzzeitvermietung.tsx` | PublicLayout Migration |

## Technische Details

### ContactModal Position
Das ContactModal bleibt innerhalb des PublicLayout-Wrappers, da es:
- Den lokalen `isModalOpen` State benoetigt
- Keine Interferenz mit Header/Footer hat
- Portal-basiert rendert (Dialog-Komponente)

### Keine funktionalen Aenderungen
- Alle Props bleiben identisch
- CTA-Funktionen unveraendert
- Source-Werte fuer Leads bleiben gleich

## Validation Checklist
- [ ] Build erfolgreich (0 TypeScript-Fehler)
- [ ] Alle 5 Landingpages rendern korrekt
- [ ] Header/Footer erscheinen auf allen Seiten
- [ ] ContactModal funktioniert (Oeffnen/Schliessen/Submit)
- [ ] Mobile Navigation funktioniert
- [ ] CTAs fuehren zu /qualifizierung

