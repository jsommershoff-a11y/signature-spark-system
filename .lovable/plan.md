
# Implementierungsplan: Landing Copy Finalisierung & GoLive

## Ubersicht

Dieser Plan umfasst 5 sequentielle Schritte zur Fertigstellung der Conversion-optimierten Landingpages, des Qualifizierungsformulars mit Scoring und der CRM-Automationen bis zum Production-Launch.

---

## Step 03 - Master Landing Copy final (Conversion-Core)

### Ziel
Die Homepage (/) wird zur Closing-Page transformiert - nicht Info-Page.

### Aktueller Stand
- Hero mit Umsatzfilter-Badge vorhanden
- Nur 3 Value Cards, keine weiteren Conversion-Sections
- Fehlende Sections: Fur wen / Fur wen nicht, Ursache-Section, System-Phasen 1-6, Structogram USP, CTA-Sequenzen

### Neue Sections fur MasterHome.tsx

```text
+----------------------------------+
|           HERO                   |
| - Umsatzfilter-Badge             |
| - Konfrontations-Headline        |
| - CTA: Analyse sichern           |
+----------------------------------+
|       FUR WEN / NICHT            |
| - 4 "Ja wenn..." Punkte          |
| - 4 "Nein wenn..." Punkte        |
+----------------------------------+
|      URSACHE-SECTION             |
| - "Das echte Problem ist nicht   |
|   dein Produkt..."               |
| - 3 Ursachen-Karten              |
+----------------------------------+
|   SYSTEM-PHASEN (1-6)            |
| - Phase 1: Diagnose              |
| - Phase 2: Struktur              |
| - Phase 3: CRM Setup             |
| - Phase 4: Vertriebsystem        |
| - Phase 5: Fuhrung               |
| - Phase 6: Skalierung            |
+----------------------------------+
|     STRUCTOGRAM USP              |
| - ROT/GRUN/BLAU erklart          |
| - Wissenschaftlicher Ansatz      |
| - Seriose Integration            |
+----------------------------------+
|      FINAL CTA                   |
| - "Bereit fur Struktur?"         |
| - Grosser CTA-Button             |
+----------------------------------+
```

### Neue Komponenten

1. **TargetAudienceSection.tsx** - "Fur wen / Fur wen nicht"
2. **RootCauseSection.tsx** - Ursachen statt Symptome  
3. **SystemPhasesSection.tsx** - KRS Signature Phasen 1-6
4. **StructogramUSPSection.tsx** - Wissenschaftlicher Differenzierungsansatz

### Dateianderungen
- `src/pages/landing/MasterHome.tsx` - Erweitern mit neuen Sections
- `src/components/landing/TargetAudienceSection.tsx` - NEU
- `src/components/landing/RootCauseSection.tsx` - NEU
- `src/components/landing/SystemPhasesSection.tsx` - NEU
- `src/components/landing/StructogramUSPSection.tsx` - NEU
- `src/components/landing/index.ts` - Exports aktualisieren

---

## Step 04 - Branchen-Landingpages ausrollen

### Ziel
Jede Branche fuhlt sich "fur mich gebaut" an - 1 Funnel = 1 Branche.

### Aktueller Stand
- Alle 5 Branchenseiten existieren: Handwerk, Praxen, Dienstleister, Immobilien, Kurzzeitvermietung
- Nutzen bereits modulare Komponenten (Hero, ProblemSection, SystemSection, etc.)
- **Problem**: Copy ist generisch, nicht Signature-Level

### Anderungen pro Branchenseite

Jede Seite bekommt den gleichen Conversion-Frame mit branchenspezifischem Content:

| Section | Handwerk | Praxen | Dienstleister | Immobilien | Kurzzeitvermietung |
|---------|----------|--------|---------------|------------|-------------------|
| Hero | Meister + Chaos | Arzt + Verwaltung | Agentur + Skalierung | Makler + Pipeline | Objekte + Automatisierung |
| Fur wen | Umsatz 100k+, Mitarbeiter | Praxisinhaber | Agenturchefs | Makler/Verwalter | 3+ Objekte |
| Ursache | Kopf-System | Papier-Chaos | Client-Overload | Lead-Qualitat | Manual-Overload |
| 6 Phasen | Handwerk-spezifisch | Praxis-spezifisch | Agentur-spezifisch | Immobilien-spezifisch | Vermietung-spezifisch |

### Dateianderungen
- `src/pages/landing/Handwerk.tsx` - Copy-Upgrade + neue Sections
- `src/pages/landing/Praxen.tsx` - Copy-Upgrade + neue Sections
- `src/pages/landing/Dienstleister.tsx` - Copy-Upgrade + neue Sections
- `src/pages/landing/Immobilien.tsx` - Copy-Upgrade + neue Sections
- `src/pages/landing/Kurzzeitvermietung.tsx` - Copy-Upgrade + neue Sections

---

## Step 05 - Qualifizierungsformular finalisieren

### Ziel
Fehlkunden raus, Idealkunden rein - mit automatischem Scoring.

### Aktueller Stand
- Basis-Formular vorhanden mit: Name, Email, Telefon, Branche, Nachricht
- Keine Scoring-Logik
- Keine Wille-Filter
- Keine Structogram-Mini-Fragen

### Neue Formularfelder

```text
PFLICHTFELDER:
1. Name (vorhanden)
2. Email (vorhanden)
3. Telefon (vorhanden)
4. Branche (vorhanden)

NEUE QUALIFIZIERUNGS-FELDER:

5. Jahresumsatz (Select)
   - "Unter 100.000 EUR" -> Auto-Ausschluss
   - "100.000 - 250.000 EUR" -> Score +1
   - "250.000 - 500.000 EUR" -> Score +2
   - "Uber 500.000 EUR" -> Score +3

6. Entscheider-Status (Select)
   - "Ja, ich bin Geschaftsfuhrer/Inhaber" -> Score +2
   - "Ich bin Mitentscheider" -> Score +1
   - "Nein, ich recherchiere fur jemanden" -> Auto-Ausschluss

7. Bereitschaft (Textarea - Wille-Filter)
   Label: "Warum suchst du gerade nach Unterstutzung?"
   Beschreibung: "Wir arbeiten nur mit Menschen, die bereit sind, 
   Dinge zu verandern - nicht nur zu konsumieren."
   
8. Structogram Mini-Block (Single Select)
   "Wenn du in einer wichtigen Situation bist..."
   - "...handle ich sofort und direkt" (ROT)
   - "...bespreche ich das erstmal mit anderen" (GRUN)  
   - "...analysiere ich alle Details" (BLAU)
```

### Auto-Ausschluss-Logik

Frontend zeigt sofort eine freundliche Ablehnung:
```
"Vielen Dank fur dein Interesse! 

Das Signature System ist aktuell fur Unternehmer mit 
mindestens 100.000 EUR Jahresumsatz konzipiert.

Wenn du soweit bist, melde dich gerne wieder."
```

### Scoring-Output (intern in DB)

```typescript
interface QualificationScore {
  total_score: number;         // 0-10
  revenue_score: number;       // 0-3
  decision_maker_score: number; // 0-2
  structogram_type: 'red' | 'green' | 'blue';
  recommendation: 'done_with_you' | 'guided' | 'disqualified';
}
```

### Dateianderungen
- `src/pages/landing/Qualifizierung.tsx` - Formular erweitern
- Supabase: ALTER TABLE leads ADD COLUMN qualification_score JSONB

---

## Step 06 - CRM Automationen produktiv

### Ziel
Fuhrung skalieren mit ROT/GRUN/BLAU-Automationen.

### Aktueller Stand
- Edge Functions vorhanden: `generate_followup_plan`, `approve_followup_plan`, `prospecting_daily_run`
- Structogram bereits in Call-Analyse integriert
- **Problem**: Keine Structogram-spezifischen Automationen

### Implementierung

Die bestehenden Edge Functions werden erweitert, um Structogram-Farben in die Followup-Logik einzubeziehen:

**ROT-Kunden (Dominant):**
- Schnelle Entscheidungspunkte
- Direkte Kommunikation
- Klare Deadlines in Followups

**GRUN-Kunden (Beziehung):**
- Mehr Sicherheit-Signale
- Nachster-Schritt-Betonung
- Personliche Check-ins

**BLAU-Kunden (Analytisch):**
- Detaillierte Checklisten
- KPI-Reports
- Daten-basierte Argumente

### Dateianderungen
- `supabase/functions/generate_followup_plan/index.ts` - Structogram-aware Templates
- `src/types/automation.ts` - Erweitern um Structogram-Typen
- `src/hooks/useFollowupPlans.ts` - UI-Labels fur Structogram-Kontext

---

## Step 07 - GoLive Final QA + Publish

### Ziel
Production-Launch ohne Leaks.

### QA Checkliste

**Mobile UX (Priority 1):**
- [ ] Alle Landingpages auf 375px Viewport testen
- [ ] Touch-Targets mindestens 44px
- [ ] Formular-Inputs auf Mobile funktional
- [ ] Header-Navigation (Hamburger) funktioniert

**Formular Spam-Schutz (Optional):**
- Honeypot-Feld (verstecktes Input)
- Rate-Limiting (max 3 Submits pro IP/Stunde via Supabase RLS oder Edge Function)

**Tracking Events:**
```typescript
// In CTAButton.tsx
const trackCTAClick = (location: string) => {
  // DataLayer push fur GTM
  window.dataLayer?.push({
    event: 'cta_click',
    cta_location: location,
    page_path: window.location.pathname,
  });
};

// In Qualifizierung.tsx onSubmit
const trackFormSubmit = (score: number) => {
  window.dataLayer?.push({
    event: 'form_submit',
    form_name: 'qualifizierung',
    qualification_score: score,
  });
};
```

### Dateianderungen
- `src/components/landing/CTAButton.tsx` - Tracking hinzufugen
- `src/pages/landing/Qualifizierung.tsx` - Tracking + Honeypot
- `index.html` - GTM-Snippet (falls gewunscht)

---

## Technische Details

### Neue TypeScript-Typen

```typescript
// src/types/qualification.ts
export interface QualificationFormData {
  name: string;
  email: string;
  phone?: string;
  branche: string;
  jahresumsatz: 'unter_100k' | '100k_250k' | '250k_500k' | 'ueber_500k';
  entscheider: 'ja' | 'mitentscheider' | 'nein';
  bereitschaft: string;
  structogram_tendency: 'rot' | 'gruen' | 'blau';
}

export interface QualificationScore {
  total_score: number;
  revenue_score: number;
  decision_maker_score: number;
  structogram_type: 'red' | 'green' | 'blue';
  recommendation: 'done_with_you' | 'guided' | 'disqualified';
}
```

### Datenbank-Migration

```sql
-- Step 05: Qualifizierung erweitern
ALTER TABLE leads 
ADD COLUMN qualification_score JSONB,
ADD COLUMN structogram_tendency TEXT CHECK (structogram_tendency IN ('rot', 'gruen', 'blau'));

-- Update source constraint fur neue Werte
ALTER TABLE leads DROP CONSTRAINT leads_source_check;
ALTER TABLE leads ADD CONSTRAINT leads_source_check CHECK (
  source IN ('start', 'growth', 'handwerk', 'praxen', 'dienstleister', 
             'immobilien', 'kurzzeitvermietung', 'qualifizierung', 'masterhome')
);
```

### Komponenten-Hierarchie

```text
MasterHome.tsx
  - Hero (bestehend)
  - TargetAudienceSection (NEU)
  - RootCauseSection (NEU)
  - SystemPhasesSection (NEU)
  - StructogramUSPSection (NEU)
  - FinalCTA (bestehend)

Branchenseiten (Handwerk, Praxen, etc.)
  - Hero (bestehend, Copy-Update)
  - TargetAudienceSection (NEU, branchenspezifisch)
  - ProblemSection (bestehend, Copy-Update)
  - RootCauseSection (NEU, branchenspezifisch)
  - SystemSection -> SystemPhasesSection (Upgrade)
  - StructogramUSPSection (NEU)
  - PlatformProof (bestehend)
  - PersonalSupport (bestehend)
  - FAQSection (bestehend)
  - FinalCTA (bestehend)
```

---

## Ausfuhrungsreihenfolge

| Step | Titel | Abhangigkeiten | Geschatzte Anderungen |
|------|-------|----------------|----------------------|
| 03 | Master Landing Copy | Keine | 5 neue Dateien, 2 Updates |
| 04 | Branchenseiten | Step 03 Komponenten | 5 Seiten-Updates |
| 05 | Qualifizierung | DB-Migration | 1 Seite, 1 neuer Typ, 1 Migration |
| 06 | CRM Automationen | Keine | 2 Edge Functions |
| 07 | GoLive QA | Steps 03-06 | 3 kleinere Updates |

---

## Validierung pro Step

Nach jedem Step wird gepruft:
- Build erfolgreich (0 TypeScript-Fehler)
- Security Scan clean
- UI-Flow auf Desktop und Mobile funktional
- Keine Regressions in bestehenden Features
