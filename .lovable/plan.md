

## Angebote-Tab im Lead-Detail + Pipeline-Update

### Ausgangslage

Die Tabelle `offers` und das gesamte Angebotssystem (Hook, Dialog, Typen) existieren bereits. Es fehlt lediglich:

1. Ein "Angebote"-Tab im `LeadDetailModal`
2. Eine automatische Aktualisierung des Pipeline-Priority-Scores bei neuer Angebotsstellung

### Aenderungen

#### 1. LeadDetailModal erweitern (src/components/crm/LeadDetailModal.tsx)

- TabsList von 4 auf 5 Tabs erweitern
- Neuen Tab "Angebote" hinzufuegen
- `useOffers(lead.id)` einbinden, um Angebote fuer den aktuellen Lead zu laden
- Angebotsliste mit Status-Badge, Betrag und Erstelldatum anzeigen
- Button "Neues Angebot" oeffnet den bestehenden `CreateOfferDialog`
- Klick auf ein Angebot navigiert zu `/app/offers/:id`

#### 2. Pipeline-Update bei Angebotserstellung (DB-Migration)

- Neuen Trigger `update_pipeline_after_offer` auf der Tabelle `offers` erstellen
- Bei INSERT eines neuen Angebots: Pipeline-Stage auf `offer_sent` oder `offer_created` aktualisieren (falls passender Stage-Wert existiert)
- Pipeline-Priority-Score anhand des Angebotsbetrags (`offer_json->>'total_cents'`) erhoehen

### Technische Details

**LeadDetailModal - Tab-Integration:**
- Import von `useOffers` und `CreateOfferDialog`
- Neuer State `createOfferOpen` fuer den Dialog
- Angebotstabelle mit Spalten: Titel, Status, Betrag, Datum
- Status-Badges nutzen bestehende `OFFER_STATUS_LABELS` und `OFFER_STATUS_COLORS`

**DB-Trigger (SQL-Migration):**

```text
CREATE OR REPLACE FUNCTION update_pipeline_after_offer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE pipeline_items
  SET
    stage = CASE
      WHEN stage IN ('new_lead','setter_call_scheduled','setter_call_done','analysis_ready')
      THEN 'offer_sent'
      ELSE stage
    END,
    stage_updated_at = now(),
    pipeline_priority_score = LEAST(100, COALESCE(pipeline_priority_score, 0) + 10)
  WHERE lead_id = NEW.lead_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pipeline_after_offer
  AFTER INSERT ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_after_offer();
```

**Keine neuen Tabellen noetig** - die bestehende `offers`-Tabelle deckt alle Anforderungen ab.
