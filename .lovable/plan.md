
# Step 02 - Homepage Redesign + Landing Token System

## Objective
Implementierung eines neuen Design-Token-Systems und einer komplett überarbeiteten Homepage, die den neuen Positionierungstext verwendet ("Struktur schlägt Talent. Systeme schlagen Chaos.").

## Scope

### 1. Neues Token-System erstellen
**Datei:** `src/styles/landing-tokens.ts` (NEU)

Ein zentrales Token-File für konsistentes Styling aller Landingpages:

```text
landingTokens = {
  container     → "max-w-6xl mx-auto px-4"
  sectionPadding→ "py-16 md:py-24"
  headline.h1   → "text-4xl md:text-6xl font-bold tracking-tight leading-tight"
  headline.h2   → "text-2xl md:text-4xl font-semibold tracking-tight"
  headline.h3   → "text-xl md:text-2xl font-semibold"
  text.body     → "text-base md:text-lg text-muted-foreground leading-relaxed"
  text.small    → "text-sm text-muted-foreground"
  badge         → Umsatz-Badge Styling
  card          → "rounded-2xl border border-border/40 bg-background/80 ..."
  ctaPrimary    → Gradient-Button Klassen
  ctaSecondary  → Underline-Link Klassen
}
```

### 2. PublicLayout Komponente erstellen
**Datei:** `src/components/landing/PublicLayout.tsx` (NEU)

Wrapper-Komponente für alle öffentlichen Landingpages:
- Einheitliche Header/Footer Integration
- Konsistente min-h-screen + flex-col Struktur
- Zentrale pt-16 Padding für Header-Offset

### 3. Homepage komplett überarbeiten
**Datei:** `src/pages/landing/MasterHome.tsx` (UPDATE)

Neues Design mit drei Bereichen:

**HERO Section:**
- Umsatz-Badge: "Nur für Unternehmer ab 100.000 EUR Jahresumsatz"
- Headline: "Struktur schlägt Talent. / Systeme schlagen Chaos."
- Subtext: KRS Signature Positionierung (kein Kurs, kein Coaching)
- Dual-CTA: Primary Button + Secondary Link

**VALUE CARDS Section:**
- 3 Cards im Grid-Layout (md:grid-cols-3)
- Themen: Vertrieb planbar machen, Unternehmer entlasten, KI als Steuerungshebel
- Verwendung der neuen card-Tokens

### 4. Barrel-Export aktualisieren
**Datei:** `src/components/landing/index.ts` (UPDATE)

Export der neuen PublicLayout Komponente hinzufügen.

## Dateien (4)

| Aktion | Datei | Beschreibung |
|--------|-------|--------------|
| CREATE | `src/styles/landing-tokens.ts` | Zentrales Token-System |
| CREATE | `src/components/landing/PublicLayout.tsx` | Layout-Wrapper |
| UPDATE | `src/pages/landing/MasterHome.tsx` | Neue Homepage |
| UPDATE | `src/components/landing/index.ts` | Export aktualisieren |

## Technische Details

### Token-System Vorteile
- Einheitliche Spacing/Typography über alle Landingpages
- Einfache globale Anpassungen durch ein zentrales File
- Type-Safety durch TypeScript-Objekt

### PublicLayout Pattern
Ermöglicht spätere Migration aller Branchen-Seiten:
```tsx
// Vorher (jede Seite einzeln)
<div className="min-h-screen flex flex-col">
  <Header />
  <main className="flex-1 pt-16">...</main>
  <Footer />
</div>

// Nachher (mit PublicLayout)
<PublicLayout>
  <HeroSection />
  <ValueCards />
</PublicLayout>
```

### Homepage Content-Struktur
```text
+------------------------------------------+
|  [Badge] Nur für Unternehmer ab 100k     |
+------------------------------------------+
|  Struktur schlägt Talent.                |
|  Systeme schlagen Chaos.                 |
+------------------------------------------+
|  KRS Signature ist kein Kurs...          |
+------------------------------------------+
|  [Kostenlose Systemanalyse sichern]      |
|  Passt das überhaupt zu mir?             |
+------------------------------------------+

+------------+------------+------------+
| Vertrieb   | Unternehmer| KI als     |
| planbar    | entlasten  | Steuerung  |
+------------+------------+------------+
```

## Validation Checklist
- [ ] Build erfolgreich (0 TypeScript-Fehler)
- [ ] Homepage rendert korrekt auf Desktop/Mobile
- [ ] CTAs verlinken korrekt zu /qualifizierung
- [ ] Header/Footer funktionieren wie gewohnt
- [ ] Tokens werden korrekt angewendet
