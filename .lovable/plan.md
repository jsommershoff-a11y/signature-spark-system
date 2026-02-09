
# Step 05 - Qualifizierungsformular mit Scoring-Logik

## Ziel
Erweiterung des Qualifizierungsformulars mit hartem Umsatz-Filter, Entscheider-Status, strukturierter Motivation und Structogram-Typisierung. Automatische Score-Berechnung filtert unqualifizierte Leads direkt heraus.

---

## Aktuelle Situation

### Bestehendes Formular (`/qualifizierung`)
- Name (Pflicht)
- E-Mail (Pflicht)
- Telefon (optional)
- Branche (Dropdown)
- Nachricht (optional Freitext)

### Bestehende `leads`-Tabelle
| Spalte | Typ | Nullable |
|--------|-----|----------|
| id | uuid | NO |
| name | text | NO |
| email | text | NO |
| phone | text | YES |
| message | text | YES |
| source | text | NO |
| created_at | timestamptz | NO |

---

## Neue Formularfelder

### 1. Jahresumsatz (Pflicht) - HARD FILTER
```text
[ ] Unter 100.000 EUR        -> Score: 0 (DISQUALIFIED)
[ ] 100.000 - 250.000 EUR    -> Score: 25
[ ] 250.000 - 500.000 EUR    -> Score: 50
[ ] 500.000 EUR+             -> Score: 100
```

### 2. Entscheider-Status (Pflicht) - HARD FILTER
```text
[ ] Ja, ich bin Inhaber/Geschaeftsfuehrer    -> Score: 100
[ ] Ich bin Mitentscheider                   -> Score: 50
[ ] Nein, ich recherchiere nur               -> Score: 0 (DISQUALIFIED)
```

### 3. Motivation (Pflicht)
Freitext mit Minimum-Validierung (mindestens 50 Zeichen = ca. 2-3 Saetze)

### 4. Entscheidungsstil (optional) - Structogram Pre-Typing
```text
[ ] Schnell und direkt, wenn das Ziel klar ist   -> RED
[ ] Im Austausch, wenn ich Sicherheit habe       -> GREEN
[ ] Nach Analyse aller Fakten                     -> BLUE
```

---

## Scoring-Logik

### Berechnung
```
qualification_score = (umsatz_score * 0.5) + (entscheider_score * 0.5)
```

### Disqualifikation (Hard Filter)
Lead wird als `disqualified` markiert wenn:
- Umsatz = "unter_100k"
- ODER Entscheider = "recherche_nur"

### Qualified Threshold
- Score >= 50 = qualified
- Score < 50 = needs_review

---

## Datenbank-Migration

### Neue Spalten fuer `leads`-Tabelle

```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS jahresumsatz text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS entscheider_status text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS motivation text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS entscheidungsstil text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_score integer DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_qualified boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS branche text;
```

### Spalten-Beschreibung
| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| jahresumsatz | text | unter_100k, 100k_250k, 250k_500k, ueber_500k |
| entscheider_status | text | inhaber, mitentscheider, recherche_nur |
| motivation | text | Freitext warum Unterstuetzung gesucht wird |
| entscheidungsstil | text | red, green, blue, null |
| qualification_score | integer | 0-100 berechneter Score |
| is_qualified | boolean | true wenn Score >= 50 UND kein Hard-Filter |
| branche | text | Separate Spalte statt im message-Feld |

---

## Technische Umsetzung

### 1. Formular-Schema (Zod)
```typescript
const qualifizierungSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(30).optional(),
  branche: z.string().min(1),
  jahresumsatz: z.enum(["unter_100k", "100k_250k", "250k_500k", "ueber_500k"]),
  entscheider_status: z.enum(["inhaber", "mitentscheider", "recherche_nur"]),
  motivation: z.string().min(50, "Bitte mindestens 2-3 Saetze").max(2000),
  entscheidungsstil: z.enum(["red", "green", "blue"]).optional(),
});
```

### 2. Score-Berechnung (Client-Side)
```typescript
function calculateQualificationScore(data: QualifizierungFormData): {
  score: number;
  isQualified: boolean;
} {
  // Hard Disqualifiers
  if (data.jahresumsatz === "unter_100k") return { score: 0, isQualified: false };
  if (data.entscheider_status === "recherche_nur") return { score: 0, isQualified: false };

  // Umsatz Score
  const umsatzScores = {
    "100k_250k": 25,
    "250k_500k": 50,
    "ueber_500k": 100,
  };
  
  // Entscheider Score
  const entscheiderScores = {
    "inhaber": 100,
    "mitentscheider": 50,
  };

  const score = (umsatzScores[data.jahresumsatz] * 0.5) + 
                (entscheiderScores[data.entscheider_status] * 0.5);
  
  return { score, isQualified: score >= 50 };
}
```

### 3. Differenzierte Thank-You Pages
- Qualified: `/danke` (bestehendes Design)
- Disqualified: `/danke?status=info` (freundliche Absage mit Ressourcen)

---

## UI-Anpassungen

### Formular-Layout
```text
+----------------------------------------+
| KONTAKTDATEN                           |
| [Name]          [E-Mail]               |
| [Telefon]       [Branche Dropdown]     |
+----------------------------------------+
| QUALIFIZIERUNG                         |
| Jahresumsatz (Radio-Buttons)           |
|   ( ) Unter 100.000 EUR                |
|   ( ) 100.000 - 250.000 EUR            |
|   ( ) 250.000 - 500.000 EUR            |
|   ( ) 500.000 EUR+                     |
|                                        |
| Entscheider-Status (Radio-Buttons)     |
|   ( ) Ja, ich bin Inhaber/GF           |
|   ( ) Ich bin Mitentscheider           |
|   ( ) Nein, ich recherchiere nur       |
+----------------------------------------+
| MOTIVATION                             |
| [Textarea: Warum suchst du gerade      |
|  Unterstuetzung? Min. 2-3 Saetze]      |
+----------------------------------------+
| ENTSCHEIDUNGSSTIL (optional)           |
| Wie triffst du Entscheidungen?         |
|   ( ) Schnell und direkt (Rot)         |
|   ( ) Im Austausch (Gruen)             |
|   ( ) Nach Analyse (Blau)              |
+----------------------------------------+
| [Gespraech anfordern]                  |
+----------------------------------------+
```

### Visuelles Feedback
- Umsatz-Badge auf der Seite: "Nur fuer Unternehmer ab 100.000 EUR Umsatz"
- Klare Pflichtfeld-Markierungen
- Inline-Validation bei Minimum-Text

---

## Dateiänderungen

| Datei | Aenderung |
|-------|----------|
| `src/pages/landing/Qualifizierung.tsx` | Kompletter Umbau mit neuen Feldern |
| `src/pages/landing/Thanks.tsx` | Query-Param-Handling fuer disqualified |
| Migration | Neue Spalten fuer `leads`-Tabelle |

---

## Validierung nach Step 05

- [ ] Build erfolgreich (0 TypeScript-Fehler)
- [ ] Alle neuen Felder validieren korrekt
- [ ] Score-Berechnung funktioniert
- [ ] Hard-Filter disqualifiziert korrekt
- [ ] Daten werden in DB gespeichert
- [ ] Differenzierte Thank-You Page
- [ ] Mobile-responsive auf 375px
- [ ] Keine Aenderungen an /app Routes
