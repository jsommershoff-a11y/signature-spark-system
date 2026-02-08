

# CRM-Erweiterungen: Test-Daten, Round-Robin & Lead-Detail-Modal

## Übersicht

Dieses Update erweitert das bestehende CRM um drei Kernfunktionen:
1. 10 realistische Test-Leads mit verschiedenen Pipeline-Stages
2. Round-Robin Auto-Zuweisung für neue Leads
3. Ein vollständiges Lead-Detail-Modal mit Bearbeitungsfunktion

---

## 1. Test-Daten erstellen (10 Leads)

### Datenbank-Seed mit realistischen deutschen Leads

Die Leads werden über eine SQL-Migration eingefügt und decken alle Pipeline-Stages ab:

```text
Lead-Verteilung nach Stage:
- new_lead: 2 Leads
- setter_call_scheduled: 2 Leads
- setter_call_done: 1 Lead
- analysis_ready: 1 Lead
- offer_draft: 1 Lead
- offer_sent: 1 Lead
- won: 1 Lead
- lost: 1 Lead
```

| # | Name | Firma | Stage | Priority | Source |
|---|------|-------|-------|----------|--------|
| 1 | Max Mustermann | TechStart GmbH | new_lead | 85 | inbound_paid |
| 2 | Anna Schmidt | ScaleUp AG | new_lead | 72 | referral |
| 3 | Thomas Weber | Digital Dynamics | setter_call_scheduled | 90 | inbound_organic |
| 4 | Lisa Müller | Growth Factory | setter_call_scheduled | 65 | outbound_ai |
| 5 | Michael Braun | Innovate Labs | setter_call_done | 78 | partner |
| 6 | Sarah Hoffmann | Consulting Plus | analysis_ready | 88 | inbound_paid |
| 7 | Markus Fischer | Startup Hub | offer_draft | 92 | referral |
| 8 | Julia Wagner | MediaFlow | offer_sent | 70 | inbound_organic |
| 9 | Peter Schulz | Success Systems | won | 95 | referral |
| 10 | Claudia Becker | Old Business Inc | lost | 35 | outbound_manual |

---

## 2. Round-Robin Auto-Zuweisung

### Datenbank-Trigger für automatische Zuweisung

Eine neue Datenbank-Funktion verteilt neue Leads automatisch an verfuegbare Mitarbeiter:

```text
Logik:
1. Pruefen ob owner_user_id bereits gesetzt ist
2. Falls nicht: Mitarbeiter mit wenigsten offenen Leads finden
3. Lead diesem Mitarbeiter zuweisen
```

### SQL-Funktion (wird als Trigger ausgefuehrt)

```sql
CREATE OR REPLACE FUNCTION assign_lead_round_robin()
RETURNS TRIGGER AS $$
DECLARE
  next_profile_id UUID;
BEGIN
  -- Nur wenn kein Owner gesetzt ist
  IF NEW.owner_user_id IS NULL THEN
    -- Mitarbeiter mit wenigsten neuen Leads finden
    SELECT p.id INTO next_profile_id
    FROM profiles p
    JOIN user_roles ur ON ur.user_id = p.user_id
    WHERE ur.role IN ('mitarbeiter', 'teamleiter')
    ORDER BY (
      SELECT COUNT(*) FROM crm_leads 
      WHERE owner_user_id = p.id 
      AND status = 'new'
    ) ASC
    LIMIT 1;
    
    NEW.owner_user_id := next_profile_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger aktivieren

```sql
CREATE TRIGGER assign_lead_owner_before_insert
BEFORE INSERT ON crm_leads
FOR EACH ROW
EXECUTE FUNCTION assign_lead_round_robin();
```

---

## 3. Lead-Detail-Modal

### Neue Komponente: LeadDetailModal.tsx

Ein umfassendes Modal mit allen Lead-Informationen und Bearbeitungsmoeglichkeiten:

```text
+-----------------------------------------------+
| Lead Details: Max Mustermann           [X]    |
+-----------------------------------------------+
| TABS: [Uebersicht] [Aktivitaeten] [Notizen]   |
+-----------------------------------------------+
|                                               |
| Kontaktdaten:                                 |
| +-------------------+  +-------------------+  |
| | Vorname           |  | Nachname          |  |
| | Max               |  | Mustermann        |  |
| +-------------------+  +-------------------+  |
|                                               |
| +-------------------+  +-------------------+  |
| | E-Mail            |  | Telefon           |  |
| | max@tech.de       |  | +49 123 456789    |  |
| +-------------------+  +-------------------+  |
|                                               |
| Unternehmen:                                  |
| +-------------------+  +-------------------+  |
| | Firma             |  | Website           |  |
| | TechStart GmbH    |  | techstart.de      |  |
| +-------------------+  +-------------------+  |
|                                               |
| Scoring & Status:                             |
| +-------------+  +-------------+              |
| | ICP Score   |  | Stage       |              |
| | [====] 85%  |  | [Dropdown]  |              |
| +-------------+  +-------------+              |
|                                               |
| +-------------+  +-------------+              |
| | Status      |  | Priority    |              |
| | [Dropdown]  |  | 85          |              |
| +-------------+  +-------------+              |
|                                               |
| Notizen:                                      |
| +-------------------------------------------+ |
| | Interesse nach Webinar-Anmeldung.         | |
| | Hat Budget und Entscheidungskompetenz.    | |
| +-------------------------------------------+ |
|                                               |
+-----------------------------------------------+
| [Abbrechen]              [Aenderungen speichern] |
+-----------------------------------------------+
```

### Features des Modals

- **Tabs-Navigation**: Uebersicht, Aktivitaeten (Tasks zum Lead), Notizen
- **Inline-Bearbeitung**: Alle Felder direkt bearbeitbar
- **Stage-Aenderung**: Dropdown zum schnellen Stage-Wechsel
- **Status-Aenderung**: Qualifizieren/Disqualifizieren
- **Aktivitaeten-Tab**: Zeigt verknuepfte Tasks zum Lead
- **Notizen-Tab**: Freitext-Notizen mit History

### Props Interface

```typescript
interface LeadDetailModalProps {
  lead: CrmLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UpdateLeadInput) => Promise<void>;
  onStageChange: (stage: PipelineStage) => Promise<void>;
  onDelete?: () => Promise<void>;
}
```

---

## 4. Integration in bestehende Seiten

### Leads.tsx anpassen

```typescript
// Neuer State fuer ausgewaehlten Lead
const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
const [detailModalOpen, setDetailModalOpen] = useState(false);

// Handler aktualisieren
const handleViewLead = (lead: CrmLead) => {
  setSelectedLead(lead);
  setDetailModalOpen(true);
};

// Modal rendern
<LeadDetailModal
  lead={selectedLead}
  open={detailModalOpen}
  onOpenChange={setDetailModalOpen}
  onSave={handleUpdateLead}
  onStageChange={...}
/>
```

### Pipeline.tsx anpassen

- Gleiches Modal bei Klick auf Pipeline-Karte oeffnen
- Schnelle Stage-Aenderung direkt im Modal

---

## Zu erstellende Dateien

| Datei | Beschreibung |
|-------|--------------|
| `src/components/crm/LeadDetailModal.tsx` | Neues Lead-Detail-Modal |
| `supabase/migrations/xxx_seed_test_leads.sql` | Test-Daten Migration |
| `supabase/migrations/xxx_round_robin_trigger.sql` | Round-Robin Trigger |

## Zu aendernde Dateien

| Datei | Aenderungen |
|-------|-------------|
| `src/pages/app/Leads.tsx` | Modal-Integration, Update-Handler |
| `src/pages/app/Pipeline.tsx` | Modal-Integration |
| `src/hooks/useLeads.ts` | updateLead Funktion bereits vorhanden |

---

## Technische Details

### Test-Daten SQL (Auszug)

```sql
-- Beispiel fuer einen Test-Lead
INSERT INTO crm_leads (
  first_name, last_name, email, phone,
  company, website_url, industry, location,
  source_type, source_detail, source_priority_weight,
  icp_fit_score, status, notes
) VALUES (
  'Max', 'Mustermann', 'max@techstart.de', '+49 170 1234567',
  'TechStart GmbH', 'https://techstart.de', 'IT/Software', 'Berlin',
  'inbound_paid', 'Facebook Ads Kampagne', 2.0,
  85, 'new', 'Interesse nach Webinar-Anmeldung.'
);
```

### LeadDetailModal Tabs-Struktur

```typescript
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Uebersicht</TabsTrigger>
    <TabsTrigger value="activities">Aktivitaeten</TabsTrigger>
    <TabsTrigger value="notes">Notizen</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    {/* Kontaktdaten, Firma, Scoring */}
  </TabsContent>
  
  <TabsContent value="activities">
    {/* Tasks zum Lead */}
  </TabsContent>
  
  <TabsContent value="notes">
    {/* Notizen-Editor */}
  </TabsContent>
</Tabs>
```

---

## Naechste Schritte nach Implementierung

1. **Test-Daten pruefen**: Zur /app/leads navigieren und 10 Leads sehen
2. **Round-Robin testen**: Neuen Lead ohne Owner erstellen
3. **Modal testen**: Auf Lead klicken und Details sehen/bearbeiten
4. **Pipeline testen**: Leads per Klick durch Stages verschieben

