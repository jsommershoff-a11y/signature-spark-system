

# Step 40 -- Branchen-Landingpages: Messaging auf KI-Prozessoptimierung umstellen

Die 5 Branchen-Landingpages sprechen noch von reinem Vertrieb und Neukunden. Sie werden auf die neue, breitere Positionierung (KI-gestuetzte Prozessoptimierung, Effizienz, Zeitersparnis) umgestellt -- konsistent mit der aktualisierten MasterHome.

---

## Betroffene Dateien

### 1. `src/pages/landing/Handwerk.tsx`

- **Hero headline**: "Volle Auftragsbuecher -- aber der Betrieb frisst dich auf?" bleibt (passt bereits)
- **Hero problem/solution**: Leicht anpassen -- von "System, das den Betrieb fuehrt" zu KI-Prozesse und Automatisierung betonen
- **Root Causes**: Beibehalten (passen bereits gut -- Terminplanung, Angebote, Mitarbeiter)
- **FinalCTA subline**: Von "wie dein Betrieb ohne dich laeuft" zu "wie KI deine Betriebsprozesse automatisiert"
- **CTA-Texte**: Von "Analysegespräch sichern" zu "Jetzt KI-Potenzial aufdecken"

### 2. `src/pages/landing/Praxen.tsx`

- **Hero headline**: "Ihre Praxis laeuft -- aber nicht planbar?" bleibt
- **Hero solution**: Von "Mehr Patienten loesen kein Chaos" zu "KI-Systeme schaffen Struktur, die Sie entlastet"
- **Root Causes**: Beibehalten (Terminausfaelle, Personal, Verwaltung -- passen perfekt)
- **FinalCTA subline**: Auf KI-Automatisierung ausrichten
- **CTA-Texte**: "Jetzt KI-Potenzial aufdecken"

### 3. `src/pages/landing/Dienstleister.tsx`

- **Hero headline**: Bleibt (passt bereits)
- **Hero solution**: Von "KRS Signature macht Vertrieb reproduzierbar" zu "KI-Systeme machen Ihre Prozesse reproduzierbar"
- **Root Causes**: Beibehalten (Akquise, Marge, Engpass -- passen)
- **FinalCTA subline**: Auf KI-Prozessautomatisierung ausrichten
- **CTA-Texte**: "Jetzt KI-Potenzial aufdecken"

### 4. `src/pages/landing/Immobilien.tsx`

- **Hero solution**: Von "Ohne Prozess ist Vertrieb Zufall" zu "KI-Systeme machen Ihren Vertrieb planbar"
- **Root Causes**: Beibehalten
- **FinalCTA subline**: Auf KI-Automatisierung ausrichten
- **CTA-Texte**: "Jetzt KI-Potenzial aufdecken"

### 5. `src/pages/landing/Kurzzeitvermietung.tsx`

- **Hero solution**: Von "Automatisierung ist Voraussetzung" zu "KI-Automatisierung macht Wachstum moeglich"
- **Root Causes**: Beibehalten (passen bereits perfekt)
- **FinalCTA subline**: Auf KI-Prozesse ausrichten
- **CTA-Texte**: "Jetzt KI-Potenzial aufdecken"

---

## Gemeinsame Aenderungen ueber alle 5 Seiten

| Element | Alt | Neu |
|---|---|---|
| Hero CTA | "Kostenloses Analysegespräch sichern" | "Jetzt KI-Potenzial aufdecken" |
| FinalCTA headline | "Bereit für Struktur statt Chaos?" | "Bereit fuer KI-gestuetzte Effizienz?" |
| FinalCTA CTA-Text | "Jetzt Analysegespräch sichern" | "Kostenlose KI-Potenzialanalyse sichern" |
| Badge | "Nur fuer ... ab 100.000 EUR Umsatz" | Bleibt (passt bereits) |

---

## Nicht betroffen

- Shared Components (Hero, FinalCTA, SystemPhasesSection, StructogramUSPSection, RootCauseSection) -- bleiben unveraendert, da sie Props empfangen
- Keine neuen Dateien oder Dependencies
- Rein textliche Aenderungen in 5 Dateien

---

## Sequenz

1. Alle 5 Branchen-Seiten parallel aktualisieren
2. Build-Test
3. Visuelle Pruefung einer Beispielseite

