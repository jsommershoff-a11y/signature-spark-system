
# Call- & Analyse-Bereich Implementierung

## Uebersicht

Dieser Plan erweitert das CRM um ein vollstaendiges Call-Management-System mit Transkription und KI-gestuetzter Analyse. Das System erfasst Calls, transkribiert sie und liefert strukturierte Analyse-Ergebnisse fuer die Vertriebsoptimierung.

---

## Phase 1: Datenbank-Schema

### 1.1 Neue Enums erstellen

```sql
-- Call Provider
CREATE TYPE call_provider AS ENUM (
  'zoom',
  'twilio',
  'sipgate',
  'manual'
);

-- Call Typ
CREATE TYPE call_type AS ENUM (
  'phone',
  'zoom',
  'teams',
  'other'
);

-- Call Status
CREATE TYPE call_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'recording_ready',
  'transcribed',
  'analyzed',
  'failed'
);

-- Transcript Status
CREATE TYPE transcript_status AS ENUM (
  'pending',
  'processing',
  'done',
  'failed'
);

-- Structogram Typen (Persoenlichkeitsfarben)
CREATE TYPE structogram_type AS ENUM (
  'red',
  'green',
  'blue',
  'mixed',
  'unknown'
);
```

### 1.2 Neue Tabelle: calls

```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehungen
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  conducted_by UUID REFERENCES profiles(id),
  
  -- Provider & Typ
  provider call_provider DEFAULT 'manual',
  call_type call_type DEFAULT 'phone',
  
  -- Zeitplanung
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Recording
  recording_url TEXT,
  storage_path TEXT,
  
  -- Status
  status call_status DEFAULT 'scheduled',
  
  -- Metadaten
  notes TEXT,
  external_id TEXT,
  meta JSONB
);
```

### 1.3 Neue Tabelle: transcripts

```sql
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehung
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  
  -- Provider & Sprache
  provider TEXT DEFAULT 'whisper',
  language TEXT DEFAULT 'de',
  
  -- Inhalt
  text TEXT,
  segments JSONB,
  
  -- Status
  status transcript_status DEFAULT 'pending',
  error_message TEXT,
  
  -- Metadaten
  word_count INTEGER,
  confidence_score NUMERIC(5,4)
);
```

### 1.4 Neue Tabelle: ai_analyses

```sql
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehungen
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES crm_leads(id),
  
  -- KI-Analyse Ergebnisse (strukturiertes JSON)
  analysis_json JSONB NOT NULL,
  
  -- Scoring
  purchase_readiness INTEGER CHECK (purchase_readiness >= 0 AND purchase_readiness <= 100),
  success_probability INTEGER CHECK (success_probability >= 0 AND success_probability <= 100),
  
  -- Structogram Typisierung
  primary_type structogram_type DEFAULT 'unknown',
  secondary_type structogram_type,
  
  -- Analyse-Version
  model_version TEXT DEFAULT 'v1',
  
  -- Status
  status TEXT DEFAULT 'completed'
);

-- Index fuer schnelle Abfragen
CREATE INDEX idx_ai_analyses_lead_id ON ai_analyses(lead_id);
CREATE INDEX idx_ai_analyses_call_id ON ai_analyses(call_id);
```

---

## Phase 2: RLS Policies

### 2.1 calls Policies

```sql
-- Policies folgen der Lead-Zugriffslogik
-- Admin/GF: Alle Calls sehen
CREATE POLICY "Admin/GF can read all calls" ON calls
FOR SELECT USING (has_min_role(auth.uid(), 'geschaeftsfuehrung'));

-- Teamleiter: Team-Calls
CREATE POLICY "Teamleiter can read team calls" ON calls
FOR SELECT USING (
  has_role(auth.uid(), 'teamleiter') AND
  lead_id IN (
    SELECT id FROM crm_leads 
    WHERE owner_user_id IN (SELECT get_team_member_ids(auth.uid()))
  )
);

-- Mitarbeiter: Eigene Calls
CREATE POLICY "Mitarbeiter can read own calls" ON calls
FOR SELECT USING (
  has_min_role(auth.uid(), 'mitarbeiter') AND (
    conducted_by = get_user_profile_id(auth.uid()) OR
    lead_id IN (
      SELECT id FROM crm_leads 
      WHERE owner_user_id = get_user_profile_id(auth.uid())
    )
  )
);

-- CRUD Policies fuer alle Tabellen (Insert, Update, Delete)
```

### 2.2 transcripts & ai_analyses Policies

```text
Folgen der gleichen Struktur via call_id -> lead_id Verknuepfung
```

---

## Phase 3: KI-Analyse Struktur

### 3.1 Strukturiertes JSON-Schema fuer analysis_json

```typescript
interface AnalysisResult {
  // Zusammenfassung
  summary: {
    key_points: string[];
    call_quality: 'excellent' | 'good' | 'average' | 'poor';
    next_steps_recommended: string[];
  };
  
  // Probleme & Schmerzen
  problems: {
    identified: Array<{
      category: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
      quote?: string;
    }>;
    pain_intensity: number; // 0-100
  };
  
  // Einwaende
  objections: {
    raised: Array<{
      type: 'price' | 'timing' | 'trust' | 'need' | 'authority' | 'other';
      description: string;
      handled: boolean;
      response_quality?: 'excellent' | 'good' | 'average' | 'poor';
    }>;
    objection_handling_score: number; // 0-100
  };
  
  // Kaufsignale
  buying_signals: {
    positive: string[];
    negative: string[];
    strength: number; // 0-100
  };
  
  // Structogram Analyse
  structogram: {
    primary_color: 'red' | 'green' | 'blue';
    secondary_color?: 'red' | 'green' | 'blue';
    confidence: number;
    indicators: {
      red_traits: string[];
      green_traits: string[];
      blue_traits: string[];
    };
    communication_tips: string[];
  };
  
  // Gespraechsqualitaet
  conversation_quality: {
    talk_ratio: {
      seller_percentage: number;
      buyer_percentage: number;
    };
    engagement_score: number;
    rapport_score: number;
  };
  
  // Empfehlungen
  recommendations: {
    immediate_actions: string[];
    follow_up_timing: string;
    offer_adjustments: string[];
  };
}
```

---

## Phase 4: Edge Function fuer KI-Analyse

### 4.1 Neue Edge Function: analyze-call

```typescript
// supabase/functions/analyze-call/index.ts
// Nimmt call_id, liest Transkript, ruft Lovable AI auf
// Liefert strukturiertes JSON zurueck

Ablauf:
1. Transkript aus DB laden
2. System-Prompt mit Analyse-Instruktionen
3. Lovable AI mit Tool-Calling fuer strukturierte Ausgabe
4. Ergebnis in ai_analyses speichern
5. Pipeline-Item auf 'analysis_ready' setzen
```

### 4.2 System-Prompt (Auszug)

```text
Du bist ein Vertriebsanalyse-Experte. Analysiere das folgende Verkaufsgespraech 
und liefere strukturierte Insights in den folgenden Kategorien:

1. ZUSAMMENFASSUNG: Kernpunkte, Gespraechsqualitaet, naechste Schritte
2. PROBLEME: Identifizierte Schmerzpunkte des Kunden mit Zitaten
3. EINWAENDE: Erhobene Einwaende und wie sie behandelt wurden
4. KAUFSIGNALE: Positive und negative Signale
5. STRUCTOGRAM: Persoenlichkeitsfarbe basierend auf Kommunikationsstil
6. EMPFEHLUNGEN: Konkrete naechste Aktionen

Antworte NUR mit strukturiertem JSON gemaess dem vorgegebenen Schema.
```

---

## Phase 5: TypeScript Types

### 5.1 Neue Types in src/types/calls.ts

```typescript
// Call Types
export type CallProvider = 'zoom' | 'twilio' | 'sipgate' | 'manual';
export type CallType = 'phone' | 'zoom' | 'teams' | 'other';
export type CallStatus = 'scheduled' | 'in_progress' | 'completed' | 
                         'recording_ready' | 'transcribed' | 'analyzed' | 'failed';
export type TranscriptStatus = 'pending' | 'processing' | 'done' | 'failed';
export type StructogramType = 'red' | 'green' | 'blue' | 'mixed' | 'unknown';

export interface Call {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  conducted_by?: string;
  provider: CallProvider;
  call_type: CallType;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  recording_url?: string;
  storage_path?: string;
  status: CallStatus;
  notes?: string;
  external_id?: string;
  meta?: Record<string, unknown>;
  // Joined
  lead?: CrmLead;
  conductor?: Profile;
  transcript?: Transcript;
  analysis?: AiAnalysis;
}

export interface Transcript {
  id: string;
  call_id: string;
  provider: string;
  language: string;
  text?: string;
  segments?: TranscriptSegment[];
  status: TranscriptStatus;
  word_count?: number;
  confidence_score?: number;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  confidence?: number;
}

export interface AiAnalysis {
  id: string;
  call_id: string;
  lead_id?: string;
  analysis_json: AnalysisResult;
  purchase_readiness?: number;
  success_probability?: number;
  primary_type: StructogramType;
  secondary_type?: StructogramType;
  model_version: string;
  created_at: string;
}

// UI Labels
export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  scheduled: 'Geplant',
  in_progress: 'Laeuft',
  completed: 'Beendet',
  recording_ready: 'Aufnahme bereit',
  transcribed: 'Transkribiert',
  analyzed: 'Analysiert',
  failed: 'Fehlgeschlagen',
};

export const STRUCTOGRAM_LABELS: Record<StructogramType, string> = {
  red: 'Rot (Dominant)',
  green: 'Gruen (Beziehung)',
  blue: 'Blau (Analytisch)',
  mixed: 'Gemischt',
  unknown: 'Unbekannt',
};

export const STRUCTOGRAM_COLORS: Record<StructogramType, string> = {
  red: '#EF4444',
  green: '#22C55E',
  blue: '#3B82F6',
  mixed: '#8B5CF6',
  unknown: '#6B7280',
};
```

---

## Phase 6: React Hooks

### 6.1 useCalls Hook

```typescript
// src/hooks/useCalls.ts
// Funktionen:
- fetchCalls(leadId?) - Calls laden (optional nach Lead)
- createCall(data) - Call planen
- updateCall(id, data) - Call aktualisieren
- startCall(id) - Call starten
- endCall(id) - Call beenden
- getCallWithAnalysis(id) - Call mit Transkript und Analyse
```

### 6.2 useAnalysis Hook

```typescript
// src/hooks/useAnalysis.ts
// Funktionen:
- fetchAnalysis(callId) - Analyse zu Call laden
- regenerateAnalysis(callId) - Analyse neu erzeugen (Admin/TL)
- getLatestAnalysis(leadId) - Neueste Analyse zum Lead
```

---

## Phase 7: UI-Komponenten

### 7.1 Datei-Struktur

```text
src/components/calls/
  CallList.tsx              # Liste aller Calls
  CallCard.tsx              # Call-Karte (kompakt)
  CallDetailView.tsx        # Vollstaendige Call-Ansicht
  CallRecordingPlayer.tsx   # Audio/Video Player
  TranscriptView.tsx        # Transkript mit Timecodes
  AnalysisPanel.tsx         # Analyse-Ergebnis Panel
  StructogramChart.tsx      # Visuelle Structogram-Anzeige
  ScoreGauge.tsx            # Gauge fuer Scores
  ObjectionsList.tsx        # Liste der Einwaende
  ProblemsList.tsx          # Liste der Probleme
  ScheduleCallDialog.tsx    # Dialog zum Call planen
```

### 7.2 CallDetailView Layout

```text
+-------------------------------------------------------------------+
| Call: Max Mustermann - 15.02.2026 10:30                    [X]    |
+-------------------------------------------------------------------+
| TABS: [Recording] [Transkript] [Analyse]                          |
+-------------------------------------------------------------------+
|                                                                    |
| ANALYSE TAB:                                                       |
| +------------------------+  +------------------------+             |
| | PURCHASE READINESS     |  | SUCCESS PROBABILITY    |             |
| |      [====] 78%        |  |      [====] 65%        |             |
| +------------------------+  +------------------------+             |
|                                                                    |
| STRUCTOGRAM:                                                       |
| +----------------------------------------------------------+       |
| |  [ROT: 45%]  [GRUEN: 35%]  [BLAU: 20%]                  |       |
| |  Dominant, handlungsorientiert, direkt                   |       |
| +----------------------------------------------------------+       |
|                                                                    |
| PROBLEME:                                                          |
| +----------------------------------------------------------+       |
| | ! Aktuelle Loesung zu langsam (Hoch)                     |       |
| |   "Wir verlieren jeden Tag Leads weil..."                |       |
| | ! Kein Ueberblick ueber Pipeline (Mittel)                |       |
| +----------------------------------------------------------+       |
|                                                                    |
| EINWAENDE:                                                         |
| +----------------------------------------------------------+       |
| | $ Preis zu hoch - BEHANDELT (Gut)                        |       |
| | ? Timing - wollen erst naechstes Quartal - OFFEN         |       |
| +----------------------------------------------------------+       |
|                                                                    |
| EMPFEHLUNGEN:                                                      |
| +----------------------------------------------------------+       |
| | 1. Nachfassen in 2 Wochen mit ROI-Rechnung               |       |
| | 2. Demo mit Geschaeftsfuehrung anbieten                  |       |
| +----------------------------------------------------------+       |
|                                                                    |
| [Analyse neu erzeugen] (nur Admin/Teamleiter)                      |
+-------------------------------------------------------------------+
```

### 7.3 Integration in LeadDetailModal

```text
Neuer Tab "Calls" im LeadDetailModal:
- Liste aller Calls zum Lead
- Quick-Action: Call planen
- Link zur vollstaendigen Call-Ansicht
```

---

## Phase 8: Neue Seite & Navigation

### 8.1 Neue Seite: Calls.tsx

```typescript
// src/pages/app/Calls.tsx
// Uebersicht aller Calls mit Filtern
// Schnellzugriff auf letzte Analysen
```

### 8.2 Navigation erweitern

```typescript
// AppSidebar.tsx
{
  label: 'Calls',
  href: '/app/calls',
  icon: Phone,
  minRole: 'mitarbeiter'
}

// App.tsx
<Route path="calls" element={<Calls />} />
<Route path="calls/:callId" element={<CallDetail />} />
```

---

## Phase 9: Pipeline-Integration

### 9.1 Automatischer Stage-Wechsel

```sql
-- Trigger: Nach Analyse -> Pipeline auf 'analysis_ready'
CREATE OR REPLACE FUNCTION update_pipeline_after_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- Pipeline-Item aktualisieren
  UPDATE pipeline_items
  SET 
    stage = 'analysis_ready',
    stage_updated_at = now(),
    purchase_readiness = NEW.purchase_readiness,
    urgency = CASE 
      WHEN NEW.success_probability > 70 THEN 80
      WHEN NEW.success_probability > 40 THEN 50
      ELSE 30
    END,
    pipeline_priority_score = calculate_pipeline_priority(
      (SELECT icp_fit_score FROM crm_leads WHERE id = NEW.lead_id),
      (SELECT source_priority_weight FROM crm_leads WHERE id = NEW.lead_id),
      NEW.purchase_readiness,
      CASE 
        WHEN NEW.success_probability > 70 THEN 80
        WHEN NEW.success_probability > 40 THEN 50
        ELSE 30
      END
    )
  WHERE lead_id = NEW.lead_id
    AND stage IN ('setter_call_done', 'setter_call_scheduled');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Zu erstellende Dateien

| Datei | Beschreibung |
|-------|--------------|
| `src/types/calls.ts` | Call, Transcript, Analysis Types |
| `src/hooks/useCalls.ts` | Call CRUD Hook |
| `src/hooks/useAnalysis.ts` | Analyse Hook |
| `src/components/calls/CallList.tsx` | Call-Liste |
| `src/components/calls/CallCard.tsx` | Call-Karte |
| `src/components/calls/CallDetailView.tsx` | Detail-Ansicht |
| `src/components/calls/TranscriptView.tsx` | Transkript |
| `src/components/calls/AnalysisPanel.tsx` | Analyse-Panel |
| `src/components/calls/StructogramChart.tsx` | Structogram |
| `src/components/calls/ScoreGauge.tsx` | Score-Anzeige |
| `src/components/calls/ScheduleCallDialog.tsx` | Call planen |
| `src/pages/app/Calls.tsx` | Calls Seite |
| `src/pages/app/CallDetail.tsx` | Call Detail Seite |
| `supabase/functions/analyze-call/index.ts` | KI-Analyse Function |

## Zu aendernde Dateien

| Datei | Aenderungen |
|-------|--------------|
| `src/types/crm.ts` | Call-bezogene Erweiterungen |
| `src/components/crm/LeadDetailModal.tsx` | Neuer "Calls" Tab |
| `src/components/app/AppSidebar.tsx` | Calls Navigation |
| `src/App.tsx` | Neue Routes |
| `supabase/config.toml` | Edge Function Config |

---

## Technische Details

### Edge Function: analyze-call

```typescript
// Auszug aus der Implementierung
const ANALYSIS_TOOL = {
  type: "function",
  function: {
    name: "submit_analysis",
    description: "Submit structured call analysis",
    parameters: {
      type: "object",
      properties: {
        summary: { /* ... */ },
        problems: { /* ... */ },
        objections: { /* ... */ },
        buying_signals: { /* ... */ },
        structogram: { /* ... */ },
        recommendations: { /* ... */ },
        scores: {
          type: "object",
          properties: {
            purchase_readiness: { type: "number", minimum: 0, maximum: 100 },
            success_probability: { type: "number", minimum: 0, maximum: 100 }
          }
        }
      },
      required: ["summary", "problems", "structogram", "scores"]
    }
  }
};
```

### Structogram-Farb-Indikatoren

```text
ROT (Dominant):
- Direkte Sprache, "Ich will", "Sofort"
- Schnelle Entscheidungen
- Ergebnisorientiert

GRUEN (Beziehung):
- "Wir", Team-Fokus
- Emotionale Sprache
- Harmoniebeduerftnis

BLAU (Analytisch):
- Fragen nach Details, Zahlen
- Vorsichtige Formulierungen
- Braucht Zeit fuer Entscheidungen
```

---

## Naechste Schritte nach Implementierung

1. **Migration ausfuehren**: Tabellen calls, transcripts, ai_analyses erstellen
2. **Edge Function deployen**: analyze-call Function
3. **UI testen**: Call planen, Transkript hochladen, Analyse starten
4. **Pipeline-Integration pruefen**: Automatischer Stage-Wechsel nach Analyse
5. **Structogram validieren**: Korrekte Farb-Zuordnung testen
