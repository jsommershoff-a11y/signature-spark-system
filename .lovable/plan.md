

# Plan: Lead-zu-Kunde-Konvertierung bei Mitglieder-Einladung

## Zusammenfassung

Der Einladungsdialog wird um eine Lead-Auswahl erweitert. Beim Einladen eines Leads werden Name und E-Mail automatisch vorausgefüllt, und die Edge Function konvertiert den Lead im CRM (Pipeline-Stage → "won", Lead-Status → "qualified").

---

## Änderungen

### Step 01 — InviteMemberDialog um Lead-Suche erweitern
**Datei**: `src/components/admin/AdminMembersOverview.tsx`

- Neues Toggle/Tab: "Neues Mitglied" vs. "Aus Lead-Datenbank"
- Bei "Aus Lead-Datenbank": Suchfeld das CRM-Leads durchsucht (Name/E-Mail/Firma)
- Bei Auswahl eines Leads: E-Mail, Name werden automatisch befüllt und readonly gesetzt
- `lead_id` wird als zusätzlicher Parameter an die Edge Function übergeben

### Step 02 — Edge Function erweitern: Lead-Konvertierung
**Datei**: `supabase/functions/invite-member/index.ts`

- `lead_id` als optionalen Parameter im Body-Schema aufnehmen (UUID, optional)
- Wenn `lead_id` vorhanden:
  1. Lead-Status in `crm_leads` auf `qualified` setzen
  2. Pipeline-Item Stage auf `won` setzen + `stage_updated_at` aktualisieren
  3. Activity-Eintrag erstellen: "Lead zu Mitglied konvertiert"
- E-Mail wird aus dem Lead-Datensatz genommen falls nicht separat angegeben

### Step 03 — Lead-Daten laden im Dialog
**Datei**: `src/components/admin/AdminMembersOverview.tsx`

- `useLeads` Hook oder direkter Supabase-Query für die Suche
- Debounced Search mit max 10 Ergebnissen
- Anzeige: Name, E-Mail, Firma, Pipeline-Stage als Kontext

---

## Dateien

| Aktion | Datei |
|--------|-------|
| Ändern | `src/components/admin/AdminMembersOverview.tsx` — Lead-Auswahl im Dialog |
| Ändern | `supabase/functions/invite-member/index.ts` — Lead-Konvertierung |

