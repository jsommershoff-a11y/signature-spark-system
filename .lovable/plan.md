
# Step 04 - Branchen-Landingpages komplett ausrollen

## Ziel
Jede Branche bekommt dieselbe Closing-Architektur wie die Homepage.
**1 Funnel = 1 Branche. Keine Misch-Copy. Keine Info-Seiten.**

---

## Architektur-Upgrade

Alle 5 Branchen-Seiten werden auf die neue Struktur umgestellt:

```text
+----------------------------------+
|     HERO (NEU - branchenscharf)  |
| - Konfrontations-Headline        |
| - Ursache + System Lösung        |
| - Umsatz-Badge                   |
| - CTA: Analyse sichern           |
+----------------------------------+
|   TARGET AUDIENCE SECTION        |
| - branchenspezifisch             |
+----------------------------------+
|   ROOT CAUSE SECTION             |
| - echte Branchen-Symptome        |
+----------------------------------+
|   SYSTEM PHASES (6 Phasen)       |
| - identisch, universell          |
+----------------------------------+
|   STRUCTOGRAM USP                |
| - identisch                      |
+----------------------------------+
|   FINAL CTA                      |
| - identisch                      |
+----------------------------------+
```

---

## Branchen-Copy (Final)

### Handwerk `/handwerk`

**Hero:**
- Headline: "Volle Auftragsbücher – aber der Betrieb frisst dich auf?"
- Problem: "Ihr Problem ist nicht Arbeit. Ihr Problem ist fehlende Struktur."
- Lösung: "KRS Signature baut ein System, das den Betrieb führt – nicht Sie allein."
- Badge: "Nur für Unternehmer ab 100.000 € Umsatz"

**TargetAudience:**
- Ja: Handwerksmeister mit Team, Auftragslage gut aber Chaos, bereit für Prozesse
- Nein: Solo-Handwerker ohne Wachstumsziel, sucht nur neues Tool

**RootCause:**
- Terminplanung im Kopf
- Angebote bleiben liegen
- Mitarbeiter brauchen ständig Anleitung

---

### Praxen `/praxen`

**Hero:**
- Headline: "Ihre Praxis läuft – aber nicht planbar?"
- Problem: "Medizinisch stark. Unternehmerisch ungeführt."
- Lösung: "Mehr Patienten lösen kein Chaos. Systeme schon."
- Badge: "Nur für Praxisinhaber ab 100.000 € Umsatz"

**TargetAudience:**
- Ja: Praxisinhaber mit Team, Terminausfälle/Personal-Chaos
- Nein: Angestellte Ärzte, keine Entscheidungsmacht

**RootCause:**
- Terminausfälle und No-Shows
- Personal kommt und geht
- Verwaltung frisst Zeit

---

### Dienstleister `/dienstleister`

**Hero:**
- Headline: "Wenn Umsatz von Ihnen abhängt, ist es kein Unternehmen."
- Problem: "Jeder Monat neu. Jeder Abschluss hängt an Ihnen."
- Lösung: "KRS Signature macht Vertrieb reproduzierbar."
- Badge: "Nur für Unternehmen ab 100.000 € Umsatz"

**TargetAudience:**
- Ja: Agentur-/Beratungsinhaber mit Team, Skalierungswunsch
- Nein: Freelancer ohne Wachstumsziel

**RootCause:**
- Akquise ist Auf und Ab
- Projekte laufen, Marge schrumpft
- In jedem Projekt selbst involviert

---

### Immobilien `/immobilien`

**Hero:**
- Headline: "Leads sind keine Abschlüsse."
- Problem: "Portale machen abhängig. Systeme machen frei."
- Lösung: "Ohne Prozess ist Vertrieb Zufall."
- Badge: "Nur für Unternehmer ab 100.000 € Umsatz"

**TargetAudience:**
- Ja: Makler/Verwalter mit Abschluss-Pipeline, systematisieren wollen
- Nein: Hobby-Makler, keine echte Pipeline

**RootCause:**
- Lead-Qualität schwankt
- Follow-up chaotisch
- Objektakquise mühsam

---

### Kurzzeitvermietung `/kurzzeitvermietung`

**Hero:**
- Headline: "Mehr Einheiten = mehr Stress?"
- Problem: "Skalierung ohne Prozesse ist Chaos."
- Lösung: "Automatisierung ist Voraussetzung – kein Luxus."
- Badge: "Nur für Betreiber ab 100.000 € Umsatz"

**TargetAudience:**
- Ja: Betreiber mit 3+ Objekten, Automatisierung wollen
- Nein: Private Einzelvermieter ohne Wachstumsziel

**RootCause:**
- Anfragen beantworten kostet Stunden
- Reinigung/Check-in logistischer Alptraum
- Auslastung schwankt stark

---

## Technische Umsetzung

### Neue Hero-Komponente mit Umsatz-Badge

Die bestehende `Hero.tsx` wird erweitert mit einem optionalen Badge-Prop für den Umsatz-Filter.

### Dateianderungen

| Datei | Anderung |
|-------|----------|
| `src/components/landing/Hero.tsx` | Badge-Prop hinzufügen |
| `src/pages/landing/Handwerk.tsx` | Kompletter Struktur-Upgrade |
| `src/pages/landing/Praxen.tsx` | Kompletter Struktur-Upgrade |
| `src/pages/landing/Dienstleister.tsx` | Kompletter Struktur-Upgrade |
| `src/pages/landing/Immobilien.tsx` | Kompletter Struktur-Upgrade |
| `src/pages/landing/Kurzzeitvermietung.tsx` | Kompletter Struktur-Upgrade |

### Gemeinsame Elemente (identisch auf allen Seiten)

- `SystemPhasesSection` - universelle 6 Phasen
- `StructogramUSPSection` - identisch  
- `FinalCTA` - "Bereit für Struktur statt Chaos?"

### CTA-Routing

Alle CTAs führen zu `/qualifizierung` - keine ContactModal mehr.

---

## Validierung nach Step 04

- [ ] Build erfolgreich (0 TypeScript-Fehler)
- [ ] Jede Branche hat eigenen Hero mit Umsatz-Badge
- [ ] CTA führt immer zu `/qualifizierung`
- [ ] PublicLayout konsistent
- [ ] Keine Anderungen an `/app`
- [ ] Mobile sauber auf 375px
