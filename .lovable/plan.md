
# Umfassende CRM-Erweiterung: Dashboard, Webhooks, Test-Call & Angebots-Flow

## Uebersicht

Dieses Update implementiert fuenf Kernbereiche:
1. Dashboard-Widgets mit Live-Daten (Analysen & Top-Leads)
2. Webhook-Infrastruktur fuer Zoom/Twilio
3. Test-Call mit Transkript zur KI-Analyse-Validierung
4. Angebots- und Checkout-System (offers & orders Tabellen)
5. Oeffentliche Angebotsseite mit Zahlungsfreigabe

---

## Phase 1: Dashboard-Widgets mit Live-Daten

### 1.1 Neue Komponenten

```text
src/components/dashboard/
  TopLeadsWidget.tsx       # Top 5 Leads nach Purchase Readiness
  RecentAnalysesWidget.tsx # Letzte 5 KI-Analysen
  PipelineStatsWidget.tsx  # Pipeline-Statistiken
  QuickActionsWidget.tsx   # Schnellzugriff-Buttons
```

### 1.2 TopLeadsWidget Layout

```text
+----------------------------------------------+
| Top Leads nach Kaufbereitschaft         [>]  |
+----------------------------------------------+
| 1. Max Mustermann - TechStart GmbH           |
|    [============================] 95%        |
|    Analyse: Rot | Erfolg: 78%                |
+----------------------------------------------+
| 2. Sarah Hoffmann - Consulting Plus          |
|    [========================] 88%            |
|    Analyse: Gruen | Erfolg: 72%              |
+----------------------------------------------+
| ...                                          |
+----------------------------------------------+
```

### 1.3 RecentAnalysesWidget Layout

```text
+----------------------------------------------+
| Neueste Analysen                        [>]  |
+----------------------------------------------+
| vor 2 Std | Max Mustermann                   |
| Kaufbereit: 95% | Erfolg: 78% | [ROT]        |
+----------------------------------------------+
| vor 5 Std | Thomas Weber                     |
| Kaufbereit: 72% | Erfolg: 65% | [BLAU]       |
+----------------------------------------------+
```

### 1.4 Dashboard.tsx erweitern

```typescript
// Neue Hooks fuer Dashboard-Daten
const useDashboardData = () => {
  // Top Leads mit purchase_readiness > 60
  // Neueste Analysen (letzte 10)
  // Pipeline-Counts pro Stage
  // Heutige Tasks
};

// Staff/Admin Dashboard mit neuen Widgets
<TopLeadsWidget leads={topLeads} />
<RecentAnalysesWidget analyses={recentAnalyses} />
<PipelineStatsWidget stats={pipelineStats} />
```

---

## Phase 2: Webhook-Infrastruktur

### 2.1 Neue Edge Functions

```text
supabase/functions/
  webhook-zoom/index.ts      # Zoom Recording Webhook
  webhook-twilio/index.ts    # Twilio Recording Webhook
  transcribe-audio/index.ts  # Audio zu Text (Whisper API)
```

### 2.2 Zoom Webhook Flow

```text
+----------+     +---------------+     +-----------+
|  Zoom    | --> | webhook-zoom  | --> | calls     |
| Meeting  |     | Edge Function |     | Tabelle   |
| ended    |     +-------+-------+     +-----------+
+----------+             |
                         v
              +-------------------+
              | transcribe-audio  |
              | (async via Queue) |
              +--------+----------+
                       |
                       v
              +-------------------+
              | transcripts       |
              | Tabelle           |
              +-------------------+
```

### 2.3 webhook-zoom Implementierung

```typescript
// supabase/functions/webhook-zoom/index.ts
serve(async (req) => {
  const event = await req.json();
  
  // Validiere Zoom Signature
  // Event: recording.completed
  
  if (event.event === "recording.completed") {
    const { meeting_id, recording_files } = event.payload;
    
    // 1. Call finden oder erstellen via external_id
    // 2. Recording URL speichern
    // 3. Status auf 'recording_ready' setzen
    // 4. Optional: Transkription starten
  }
});
```

### 2.4 webhook-twilio Implementierung

```typescript
// supabase/functions/webhook-twilio/index.ts
serve(async (req) => {
  // Twilio Call Recording Callback
  const formData = await req.formData();
  const recordingUrl = formData.get('RecordingUrl');
  const callSid = formData.get('CallSid');
  
  // 1. Call via external_id=callSid finden
  // 2. Recording URL speichern
  // 3. Transkription starten
});
```

### 2.5 config.toml erweitern

```toml
[functions.webhook-zoom]
verify_jwt = false

[functions.webhook-twilio]
verify_jwt = false

[functions.transcribe-audio]
verify_jwt = false
```

---

## Phase 3: Test-Call mit Transkript

### 3.1 SQL Migration: Test-Daten

```sql
-- Test-Call fuer Lead "Max Mustermann"
INSERT INTO calls (
  lead_id,
  provider,
  call_type,
  scheduled_at,
  started_at,
  ended_at,
  duration_seconds,
  status,
  notes
) VALUES (
  (SELECT id FROM crm_leads WHERE email = 'max@techstart.de'),
  'manual',
  'phone',
  now() - interval '1 day',
  now() - interval '1 day',
  now() - interval '1 day' + interval '25 minutes',
  1500,
  'transcribed',
  'Setter-Call - Erstgespraech'
);

-- Test-Transkript
INSERT INTO transcripts (
  call_id,
  provider,
  language,
  text,
  segments,
  status,
  word_count,
  confidence_score
) VALUES (
  (SELECT id FROM calls WHERE lead_id = (SELECT id FROM crm_leads WHERE email = 'max@techstart.de') LIMIT 1),
  'manual',
  'de',
  'Verkäufer: Guten Tag Herr Mustermann, hier ist Max von SalesFlow. Ich rufe an wegen...
  
Kunde: Ah ja, ich habe mich auf Ihrer Webseite umgeschaut. Wir haben aktuell ein großes Problem mit unserer Lead-Verwaltung.

Verkäufer: Das höre ich oft. Was genau ist das Problem?

Kunde: Wir verlieren täglich Leads weil unser aktuelles System zu langsam ist. Die Mitarbeiter müssen alles manuell eingeben. Das dauert einfach zu lange.

Verkäufer: Das klingt frustrierend. Wie viele Leads gehen Ihnen dadurch verloren schätzen Sie?

Kunde: Bestimmt 20-30% der Anfragen. Das sind bei uns schnell 50.000€ im Monat.

Verkäufer: Das ist ein erheblicher Betrag. Wäre es für Sie interessant, wenn wir das automatisieren könnten?

Kunde: Auf jeden Fall! Aber ich muss das mit meinem Geschäftspartner besprechen. Der ist nächste Woche wieder da.

Verkäufer: Verstehe. Was wäre denn Ihr Budget für so eine Lösung?

Kunde: Wenn wir wirklich 50.000€ im Monat sparen... dann wären 2-3.000€ monatlich sicher drin.

Verkäufer: Das klingt machbar. Ich schicke Ihnen vorab ein Angebot. Wann passt es Ihnen nächste Woche für einen Call mit Ihrem Partner?

Kunde: Donnerstag wäre gut. So gegen 14 Uhr.

Verkäufer: Perfekt, ich schicke Ihnen die Einladung. Bis dahin!',
  '[
    {"start": 0, "end": 5, "speaker": "Verkäufer", "text": "Guten Tag Herr Mustermann..."},
    {"start": 5, "end": 15, "speaker": "Kunde", "text": "Ah ja, ich habe mich..."}
  ]'::jsonb,
  'done',
  350,
  0.95
);
```

### 3.2 Anleitung zum Testen

```text
1. Navigiere zu /app/calls
2. Suche den Test-Call "Max Mustermann - Erstgespraech"
3. Klicke auf den Call um die Detail-Ansicht zu oeffnen
4. Gehe zum Tab "Transkript" und pruefe das Transkript
5. Klicke "Analyse starten" Button
6. Warte auf KI-Analyse (ca. 10-20 Sekunden)
7. Pruefe die Ergebnisse im "Analyse" Tab:
   - Purchase Readiness sollte ~75-85% sein
   - Structogram sollte "Rot" zeigen (direkt, ergebnisorientiert)
   - Probleme: "Leads verlieren", "System zu langsam"
   - Einwand: "Authority" (muss mit Partner sprechen)
```

---

## Phase 4: Angebots-System (offers & orders)

### 4.1 Neue Enums

```sql
-- Offer Status
CREATE TYPE offer_status AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'sent',
  'viewed',
  'expired'
);

-- Order Status
CREATE TYPE order_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded',
  'cancelled'
);

-- Payment Provider
CREATE TYPE payment_provider AS ENUM (
  'stripe',
  'copecart',
  'bank_transfer',
  'manual'
);
```

### 4.2 Neue Tabelle: offers

```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehungen
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES ai_analyses(id),
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  
  -- Status
  status offer_status DEFAULT 'draft',
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Angebots-Inhalt (KI-generiert oder manuell)
  offer_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Oeffentlicher Zugang
  public_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  
  -- Zahlungssteuerung
  payment_unlocked BOOLEAN DEFAULT false,
  payment_unlocked_at TIMESTAMPTZ,
  payment_unlocked_by UUID REFERENCES profiles(id),
  
  -- Metadaten
  notes TEXT,
  version INTEGER DEFAULT 1
);

-- Indizes
CREATE INDEX idx_offers_lead_id ON offers(lead_id);
CREATE INDEX idx_offers_public_token ON offers(public_token);
CREATE INDEX idx_offers_status ON offers(status);
```

### 4.3 Neue Tabelle: orders

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Beziehungen
  offer_id UUID REFERENCES offers(id),
  lead_id UUID NOT NULL REFERENCES crm_leads(id),
  member_id UUID REFERENCES profiles(id),
  
  -- Payment Provider
  provider payment_provider NOT NULL,
  provider_order_id TEXT,
  provider_customer_id TEXT,
  
  -- Betrag
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Status
  status order_status DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  
  -- Metadaten
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT
);

-- Indizes
CREATE INDEX idx_orders_lead_id ON orders(lead_id);
CREATE INDEX idx_orders_offer_id ON orders(offer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_provider_order_id ON orders(provider_order_id);
```

### 4.4 RLS Policies

```sql
-- offers: Staff kann erstellen/lesen, Teamleiter approven
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Mitarbeiter kann eigene Offers sehen
CREATE POLICY "Staff can read offers" ON offers
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));

-- Teamleiter kann approven
CREATE POLICY "Teamleiter can update offers" ON offers
FOR UPDATE USING (has_min_role(auth.uid(), 'teamleiter'));

-- Oeffentlicher Zugang via Token (fuer Angebotsseite)
CREATE POLICY "Public can view via token" ON offers
FOR SELECT USING (
  public_token IS NOT NULL AND 
  payment_unlocked = true
);

-- orders: Staff kann lesen, System kann schreiben
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read orders" ON orders
FOR SELECT USING (has_min_role(auth.uid(), 'mitarbeiter'));
```

### 4.5 offer_json Schema

```typescript
interface OfferContent {
  // Header
  title: string;
  subtitle?: string;
  valid_until: string;
  
  // Kunde
  customer: {
    name: string;
    company?: string;
    email: string;
  };
  
  // Produkte/Leistungen
  line_items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit_price_cents: number;
    total_cents: number;
  }>;
  
  // Zusammenfassung
  subtotal_cents: number;
  discount_cents?: number;
  discount_reason?: string;
  tax_rate: number;
  tax_cents: number;
  total_cents: number;
  
  // Zahlungsbedingungen
  payment_terms: {
    type: 'one_time' | 'subscription' | 'installments';
    frequency?: 'monthly' | 'quarterly' | 'yearly';
    installments?: number;
  };
  
  // KI-generierte Inhalte
  ai_generated?: {
    personalized_intro: string;
    value_propositions: string[];
    objection_responses: Record<string, string>;
    urgency_message?: string;
  };
  
  // Terms
  terms_accepted_at?: string;
  signature_url?: string;
}
```

---

## Phase 5: Angebots-UI

### 5.1 Neue Komponenten

```text
src/components/offers/
  OfferBuilder.tsx         # Angebots-Editor
  OfferPreview.tsx         # Angebots-Vorschau
  OfferApprovalCard.tsx    # Approval-UI fuer Teamleiter
  PaymentUnlockButton.tsx  # Zahlung freischalten
  OfferStatusBadge.tsx     # Status-Anzeige
```

### 5.2 Neue Seiten

```text
src/pages/app/Offers.tsx       # Angebots-Uebersicht
src/pages/app/OfferEditor.tsx  # Angebot bearbeiten
src/pages/Offer.tsx            # Oeffentliche Angebotsseite /offer/{token}
```

### 5.3 OfferBuilder Layout

```text
+-------------------------------------------------------------------+
| Angebot erstellen: Max Mustermann                                  |
+-------------------------------------------------------------------+
| TABS: [Produkte] [Personalisierung] [Vorschau]                     |
+-------------------------------------------------------------------+
|                                                                    |
| PRODUKTE:                                                          |
| +------------------------------------------------------------+    |
| | Produkt            | Menge | Preis      | Gesamt           |    |
| |------------------------------------------------------------|    |
| | SalesFlow Pro      | 1     | 2.499€/Mo  | 2.499€           |    |
| | + Position hinzufuegen                                      |    |
| +------------------------------------------------------------+    |
|                                                                    |
| Rabatt: [___] € oder [___] %  Grund: [____________]               |
|                                                                    |
| +------------------------------------------------------------+    |
| | Zwischensumme:              2.499,00 €                     |    |
| | Rabatt:                      -249,90 € (10%)               |    |
| | MwSt (19%):                   427,03 €                     |    |
| | GESAMT:                     2.676,13 €                     |    |
| +------------------------------------------------------------+    |
|                                                                    |
| PERSONALISIERUNG (KI-generiert):                                   |
| +------------------------------------------------------------+    |
| | Intro-Text:                                                 |    |
| | "Basierend auf unserem Gespraech verstehe ich, dass Sie    |    |
| | taeglich 20-30% Ihrer Leads verlieren..."                  |    |
| +------------------------------------------------------------+    |
|                                                                    |
| [Als Entwurf speichern] [Zur Pruefung senden]                      |
+-------------------------------------------------------------------+
```

### 5.4 Oeffentliche Angebotsseite /offer/{token}

```text
+-------------------------------------------------------------------+
| [Logo]                        Angebot #2024-0042                   |
+-------------------------------------------------------------------+
|                                                                    |
| Hallo Max,                                                         |
|                                                                    |
| basierend auf unserem Gespraech habe ich ein individuelles        |
| Angebot fuer TechStart GmbH zusammengestellt.                     |
|                                                                    |
| +------------------------------------------------------------+    |
| | IHRE LOESUNG                                                |    |
| |------------------------------------------------------------|    |
| | SalesFlow Pro                                              |    |
| | - Automatische Lead-Erfassung                              |    |
| | - KI-gestuetzte Analyse                                    |    |
| | - Pipeline-Management                                       |    |
| |                                              2.499€/Monat   |    |
| +------------------------------------------------------------+    |
|                                                                    |
| Ihr Investment: 2.676,13€/Monat (inkl. MwSt)                      |
|                                                                    |
| [Zahlung nicht freigeschaltet]                                     |
| oder                                                               |
| [Jetzt kaufen] (wenn payment_unlocked=true)                        |
|                                                                    |
| Gueltig bis: 15.02.2026                                            |
+-------------------------------------------------------------------+
```

---

## Phase 6: Angebots-Flow

### 6.1 Flow-Diagramm

```text
+----------------+     +------------------+     +-----------------+
| Analyse fertig | --> | KI generiert     | --> | offer.status =  |
| (Call analyzed)|     | offer_json Draft |     | 'draft'         |
+----------------+     +------------------+     +--------+--------+
                                                        |
                                                        v
+----------------+     +------------------+     +-----------------+
| Setter prueft  | <-- | Setter bearbeitet| <-- | offer.status =  |
| und sendet     |     | Angebot          |     | 'pending_review'|
+----------------+     +------------------+     +--------+--------+
        |                                               |
        v                                               |
+----------------+                                      |
| Teamleiter     |<-------------------------------------+
| approved       |
+-------+--------+
        |
        v
+----------------+     +------------------+     +-----------------+
| offer.status = | --> | E-Mail mit Link  | --> | Kunde oeffnet   |
| 'sent'         |     | /offer/{token}   |     | Angebotsseite   |
+----------------+     +------------------+     +--------+--------+
                                                        |
                                                        v
+----------------+     +------------------+     +-----------------+
| Setter schaltet| --> | payment_unlocked | --> | Kunde kann      |
| Zahlung frei   |     | = true           |     | bezahlen        |
+----------------+     +------------------+     +--------+--------+
                                                        |
                                                        v
+----------------+     +------------------+     +-----------------+
| Webhook:       | --> | order.status =   | --> | Lead -> Member  |
| Payment Success|     | 'paid'           |     | Rolle: 'kunde'  |
+----------------+     +------------------+     +-----------------+
```

### 6.2 Edge Function: generate-offer

```typescript
// supabase/functions/generate-offer/index.ts
// Generiert personalisiertes Angebot basierend auf Analyse

serve(async (req) => {
  const { lead_id, analysis_id, template_id } = await req.json();
  
  // 1. Lead und Analyse laden
  // 2. Lovable AI mit Prompt aufrufen
  // 3. offer_json generieren mit personalisierten Texten
  // 4. Offer in DB speichern
});
```

### 6.3 Edge Function: webhook-payment

```typescript
// supabase/functions/webhook-payment/index.ts
// Verarbeitet Zahlungs-Callbacks von Stripe/CopeCart

serve(async (req) => {
  const event = await req.json();
  
  // Signature validieren (je nach Provider)
  
  if (event.type === 'checkout.session.completed') {
    // 1. Order finden via metadata.order_id
    // 2. order.status = 'paid'
    // 3. Lead-Status aktualisieren
    // 4. Member-Profil erstellen
    // 5. Rolle 'kunde' zuweisen
    // 6. Pipeline auf 'won' setzen
  }
});
```

---

## Phase 7: Navigation & Routes

### 7.1 Neue Routes in App.tsx

```typescript
// Protected Routes
<Route path="offers" element={<Offers />} />
<Route path="offers/:offerId" element={<OfferEditor />} />
<Route path="offers/:offerId/preview" element={<OfferPreview />} />

// Public Route (ausserhalb /app)
<Route path="/offer/:token" element={<PublicOffer />} />
```

### 7.2 Sidebar erweitern

```typescript
{
  label: 'Angebote',
  href: '/app/offers',
  icon: FileText,
  minRole: 'mitarbeiter'
}
```

---

## Zusammenfassung der zu erstellenden Dateien

| Datei | Beschreibung |
|-------|--------------|
| `src/components/dashboard/TopLeadsWidget.tsx` | Top Leads Widget |
| `src/components/dashboard/RecentAnalysesWidget.tsx` | Neueste Analysen |
| `src/components/dashboard/PipelineStatsWidget.tsx` | Pipeline Stats |
| `src/hooks/useDashboardData.ts` | Dashboard Daten-Hook |
| `src/components/offers/OfferBuilder.tsx` | Angebots-Editor |
| `src/components/offers/OfferPreview.tsx` | Vorschau |
| `src/components/offers/PaymentUnlockButton.tsx` | Zahlung freischalten |
| `src/hooks/useOffers.ts` | Offers CRUD Hook |
| `src/types/offers.ts` | TypeScript Types |
| `src/pages/app/Offers.tsx` | Angebots-Uebersicht |
| `src/pages/app/OfferEditor.tsx` | Editor-Seite |
| `src/pages/Offer.tsx` | Oeffentliche Angebotsseite |
| `supabase/functions/webhook-zoom/index.ts` | Zoom Webhook |
| `supabase/functions/webhook-twilio/index.ts` | Twilio Webhook |
| `supabase/functions/generate-offer/index.ts` | Angebot generieren |
| `supabase/functions/webhook-payment/index.ts` | Payment Webhook |

## Zu aendernde Dateien

| Datei | Aenderungen |
|-------|-------------|
| `src/pages/app/Dashboard.tsx` | Neue Widgets integrieren |
| `src/App.tsx` | Neue Routes |
| `src/components/app/AppSidebar.tsx` | Angebote-Link |
| `supabase/config.toml` | Neue Edge Functions |
| `src/components/crm/LeadDetailModal.tsx` | Angebots-Tab |

---

## Naechste Schritte nach Implementierung

1. **Dashboard testen**: Pruefe ob Top-Leads und Analysen angezeigt werden
2. **Test-Call analysieren**: Starte KI-Analyse und pruefe Ergebnisse
3. **Angebot erstellen**: Erstelle ein Angebot fuer einen Lead
4. **Approval-Flow testen**: Teamleiter genehmigt Angebot
5. **Angebotsseite pruefen**: Oeffne /offer/{token} im Browser
6. **Zahlung freischalten**: Teste payment_unlocked Toggle
