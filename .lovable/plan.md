# Landingpage-Optimierung ki-automationen.io

Ziel: Bestehende Seite konkreter, glaubwürdiger und konversionsstärker machen. Keine neue Seite, keine Strukturänderung, kein Branding-Wechsel. Alle Anpassungen DE/Du-Form, sachlich.

## Übersicht der Änderungen

| # | Datei | Was passiert |
|---|-------|--------------|
| 1 | `src/components/landing/home/HeroSection.tsx` | Trust-Badges, Sekundär-Link, Jan-Zitat |
| 2 | `src/components/landing/home/TrustLogosSection.tsx` | Neuer Untertitel |
| 3 | `src/components/landing/home/ThreeStagesSection.tsx` (NEU) | Vergleichstabelle 3 Stufen |
| 3b | `src/pages/landing/MasterHome.tsx` | Section einhängen zwischen `AiRealitySection` und `VulnerabilitySection` |
| 4 | `src/components/landing/home/VulnerabilitySection.tsx` | Rote Risiko-Mini-Tags je Karte + "Jan sagt"-Quote |
| 5 | `src/components/landing/home/ProcessStepsSection.tsx` | Mono-Zeit-Tags je Schritt + Gesamtdauer-Zeile + "Jan sagt"-Quote |
| 6 | `src/components/landing/home/CaseStudiesSection.tsx` | 3 Zahlen-Highlights, Zitat hervorheben, Hinweiszeile |

## Details je Änderung

### 1. HeroSection
- Unter dem bestehenden Sub-Text-Block, vor dem Button: Drei horizontale Trust-Badges mit Lucide-Icons (`ShieldCheck`, `UserCheck`, `Clock`):
  - "DSGVO-konform · Eigener Server in der EU"
  - "Berater + Umsetzer in einer Person"
  - "30 Tage Begleitung nach Go-Live"
  - Auf Mobile (Viewport 448px): vertikal gestapelt, kleine Pills, weißer Text auf `bg-white/5 border-white/10`.
- Unter dem Hauptbutton: Sekundär-Link `→ So läuft die Zusammenarbeit ab`, scrollt per Anchor `#vorgehen` (Anchor-ID an `ProcessStepsSection`-Wrapper hinzufügen). Style: `text-white/70 hover:text-primary underline-offset-4`.
- Founder-Trust-Modul rechts: Direkt unter Subheader-Zeile ("Systematisierung, …") ein neues kursives Zitat klein, in Anführungszeichen:
  > „Ich baue für meine Kunden nur Systeme, die ich selbst nutzen würde."
- Mobile: Founder-Modul ist heute `hidden md:flex`. Damit Zitat & Foto auch mobil sichtbar sind → Founder-Block in einer kompakten Mobile-Variante zusätzlich oberhalb der Benefit-Cards rendern (nur `md:hidden`), kleines rundes Foto + Name + Kurz-Zitat.

### 2. TrustLogosSection
- Untertitel ersetzen durch:
  > "Wir integrieren in den Stack, den du schon hast — nicht noch ein Tool obendrauf."
- Restliche Marquee-Logik bleibt unverändert.

### 3. NEU: ThreeStagesSection (`Drei Stufen — wo stehst du gerade?`)
- Neue Datei `src/components/landing/home/ThreeStagesSection.tsx`.
- Position: in `MasterHome.tsx` direkt **nach** `AiRealitySection` und **vor** `VulnerabilitySection`.
- H2: "Drei Stufen — wo stehst du gerade?"
- Sub: "Die meisten Unternehmen sind nicht zu langsam mit KI. Sie sind zu früh dran ohne Struktur."
- Desktop: 4-spaltige Tabelle (Aspekt + 3 Stufen) als Grid mit `border-border/30`, gerundete Ecken, Zebra-Reihen.
- Letzte Spalte ("Eigenes System (Wir)") visuell hervorgehoben: `border-2 border-primary/40 bg-[#FFF3EB]/40` (Sand), Header-Zelle `bg-primary text-primary-foreground`.
- Mobile (<md): Tabelle wird zu 3 gestapelten Cards (eine pro Stufe). Jede Card listet alle 6 Aspekte als Key/Value-Paare. Letzte Card mit orangem Border + Sand-Hintergrund.
- Inhalte exakt aus Briefing (Wissen, Übergaben, Skalierung, Reaktionszeit, Abhängigkeiten, KI-Hebel).

### 4. VulnerabilitySection
- Pro Karte am Ende ein roter Mini-Tag (kleines Pill: `inline-flex items-center gap-1 mt-4 px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20`):
  - Steuerberater: "Risiko: 4–6 Wochen Stillstand in der Buchhaltung"
  - Mitarbeiter: "Risiko: Niemand übernimmt ohne 2 Wochen Einarbeitung"
  - System: "Risiko: Prozesse stehen still, Kunden warten"
  - Compliance: "Risiko: Bußgeld + Tage manueller Recherche"
- Über den 4 Karten ein konkretes Mini-Beispiel ergänzen: "z. B. Lead-Antwort in unter 2 Minuten statt 4 Stunden, sobald eingehende Anfragen direkt im eigenen System landen."
- Unter den Karten "Jan sagt"-Quote (kursiv, kleines Foto-Avatar):
  > „In 9 von 10 Erstgesprächen liegt das halbe Unternehmen in fremden Postfächern. Genau das wollen wir abschalten."

### 5. ProcessStepsSection
- Wrapper-Section bekommt `id="vorgehen"` (für Hero-Sekundärlink).
- Steps-Array um `duration` erweitern und in Karte oben rechts als Mono-Tag (`font-mono text-[11px] uppercase tracking-wide bg-muted text-muted-foreground rounded px-2 py-0.5`) anzeigen:
  1. Analyse — "ca. 1 Woche"
  2. System-Mapping — "1–2 Wochen"
  3. Priorisierung — "ca. 1 Woche"
  4. Umsetzung — "4–8 Wochen"
  5. Übergabe + Support — "30 Tage Begleitung"
- Aktuelles Layout: zentrierte Kreise. Wir wechseln je Step zu einer leichten Card (`rounded-2xl border border-border/30 p-5 text-left`), damit der Tag rechts oben Platz hat. Nummer-Kreis bleibt links oben.
- Schritt 5 Title auf "Übergabe + Support" anpassen.
- Direkt unter dem Grid neue Zeile (zentriert, fett):
  > "Typische Gesamtdauer eines Projekts: 8–12 Wochen bis Go-Live."
- Darunter ein "Jan sagt"-Quote (kursiv, klein):
  > „Wir liefern keinen Tool-Stack, sondern eine dokumentierte Struktur, die ohne uns funktioniert."

### 6. CaseStudiesSection (René Schreiner)
- Über der bestehenden Karte 1 Reihe / 3 Spalten Mini-Cards (Mobile: 3 gestapelt):
  - `40+` — "neue Bewerbungen generiert"
  - `1` — "zentrales System statt 4 verstreuter Tools"
  - `✓` — „Value ehrlich gesagt unmessbar"
  - Style: `rounded-2xl border-2 border-primary/30 bg-[#FFF3EB] p-6 text-center`, große Zahl in `text-4xl md:text-5xl font-bold text-primary`.
- Bestehende Problem/Ziel/Lösung/Ergebnis-Struktur bleibt. Das Ergebnis-Zitat: größere Schrift `text-lg md:text-xl`, kursiv, Anführungszeichen sichtbar, mit `Quote`-Icon davor.
- Ende der Sektion (kleine Zeile, zentriert, `text-xs text-muted-foreground`):
  > "Weitere Referenzen auf Anfrage. Wir sprechen gern mit dir konkret über vergleichbare Projekte."
  (Briefing brach hier ab — falls du einen anderen Wortlaut willst, einfach kurz angeben.)

## Technische Hinweise
- Alle neuen UI-Elemente nutzen bestehende `landingTokens` und Tailwind-Klassen, kein neues Theming.
- Keine neuen Dependencies; Lucide-Icons sind bereits verfügbar.
- Mobile-First geprüft für Viewport 448px (Sticky CTA + Bottom-Nav-Padding bleiben unangetastet).
- Anchor-Scroll aus dem Hero-Sekundärlink: einfaches `<a href="#vorgehen">` reicht (Browser-natives Smooth-Scroll via `html { scroll-behavior: smooth; }` ist im `index.css` aktiv — falls nicht, ergänze ich es im selben Schritt).

## Offene Punkte (werden mit umgesetzt — bitte nur bei Widerspruch melden)
1. Letzte Zeile der Case-Study-Sektion ist im Briefing abgeschnitten. Ich übernehme den Wortlaut wie oben formuliert.
2. Founder-Modul wird mobile sichtbar gemacht (kompakte Variante), damit das neue Jan-Zitat auch auf Smartphones wirkt.
3. ProcessSteps-Karten wechseln von zentriert zu links-bündigen Cards, damit Zeit-Tags Platz haben — bleibt visuell konsistent zum Rest der Seite.

## Verbesserungsvorschläge zusätzlich (werden mit ausgeliefert, sofern du nicht widersprichst)
- **A. Sticky-CTA-Bar**: Auf Mobile zusätzlich ein subtiler Hinweis "Antwort meist innerhalb von 24 h" rechts vom Button, um Reibung zu senken.
- **B. Hero-Microcopy**: Unter dem Sekundär-Link `30 Min · Ohne Verkaufsdruck · Kein Tool-Pitch` als 3-Wort-Reassurance.
- **C. Case-Study-Sektion**: Logo "AS Gärten GmbH" (falls vorhanden) klein neben Name einbinden — erhöht Glaubwürdigkeit.
- **D. JSON-LD**: Neue `Review`/`Quote`-Schema-Einträge zu René Schreiner ergänzen (SEO-Sichtbarkeit / Sitelink-Snippets).
- **E. Vergleichstabelle**: Auf Desktop letzte Spalte mit kleinem `Recommended`-Ribbon oben rechts.

Sag einfach Bescheid, falls A–E ganz oder teilweise nicht mit ausgeliefert werden sollen.