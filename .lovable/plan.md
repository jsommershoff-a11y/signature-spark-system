
# Steps 06 – 09 (Pipeline UX-Ausbau)

Reine Frontend-Arbeit. Keine DB-Änderungen, keine neuen Edge Functions. Bestehende Daten werden genutzt; fehlende Felder führen zu deaktivierten/ausgeblendeten Filtern.

---

## Step 06 — Filter & Suche oberhalb der Pipeline erweitern

**Datei:** `src/components/crm/PipelineFilters.tsx`, `src/components/crm/PipelineBoard.tsx`

`PipelineFilterValue` wird erweitert um:
- `stages: PipelineStage[]`
- `sources: string[]` (aus `lead.source_type`)
- `overdue: 'all' | 'overdue' | 'on_track'` (basierend auf `next_action_at` / vorhandenen Tasks)
- `hasOffer: 'all' | 'with' | 'without'` (`offers`-Existenz pro Lead → über bereits geladene `pipeline_item.has_offer` falls vorhanden, sonst Filter deaktiviert)
- `hasAppointment: 'all' | 'with' | 'without'` (geplante `calls` mit `scheduled_at > now`)
- `dateRange: 'all' | 'today' | 'week' | 'month' | 'custom'` mit optionalem `customFrom/customTo` (gefiltert auf `pipeline_item.stage_updated_at` oder `lead.created_at` – Auswahl per Toggle)

UI:
- Reihe 1: Tabs (Gruppen) + Suchfeld (bereits vorhanden, bleibt).
- Reihe 2: Inline-Chips Phase / Owner / Quelle / Priorität / ICP / Status (Überfällig, Angebot, Termin) + Zeitraum-Select.
- Mobile (`< md`): zweite Reihe einklappbar in `Sheet` „Filter (n aktiv)".
- Filter, deren Datenquelle für aktuell geladene Items leer ist (z. B. keine Quellen verfügbar), werden disabled mit Tooltip „Keine Daten".
- Expliziter Button **„Filter zurücksetzen"** sichtbar sobald `activeCount > 0`.
- Treffer-Anzeige bleibt als Badge im Suchfeld; zusätzlich Subline „X von Y Leads sichtbar".

Quelle/Termin/Angebot-Werte werden in `PipelineBoard` aus `pipelineByStage` abgeleitet (Memo). Falls ein Feld in 0 % der Items vorhanden ist → Filter ausblenden.

---

## Step 07 — Lead-Detail-Sidebar aus Pipeline

**Neu:** `src/components/crm/LeadDetailSidebar.tsx` (Sheet-basierend)
**Edit:** `src/pages/app/Pipeline.tsx` – verwendet künftig `LeadDetailSidebar` statt `LeadDetailModal` (Modal bleibt bestehen für andere Aufrufer wie `Leads.tsx`).

Aufbau (Reihenfolge entspricht Prompt):
1. **Kopf** — Name/Firma, Ansprechpartner, Stage-Badge (`PIPELINE_STAGE_LABELS`), Owner-Avatar, Quelle.
2. **Nächste Aktion** — erste offene Task (`useTasks({ lead_id })`), Fälligkeit + Buttons „Aufgabe öffnen" / „Aufgabe erstellen" (`CreateTaskDialog`).
3. **Kommunikation** — letzter Call (`useCalls`), letzter Aktivitäts-Touchpoint (`useActivities`), nächster geplanter Termin, Link zu `/app/inbox` falls Route existiert.
4. **Sales-Hinweis** — Platzhalter, der von Step 08 befüllt wird.
5. **Angebot/Analyse** — Flags ja/nein aus `useOffers`, Angebotswert (`formatCents`), Buttons „Angebot öffnen" / „Angebot erstellen".
6. **Historie** — `ActivityFeed` (limit 10) mit Fallback „Noch keine Aktivitäten erfasst".

Mobile: `Sheet` `side="right"` mit `className="w-full sm:max-w-xl"` → Fullscreen-Drawer < sm.

Fallbacks: jede Sektion zeigt dezenten Empty-State; keine Section wirft, wenn Felder `null` sind.

---

## Step 08 — Sales-Skript-Karten pro Stage

**Neu:** `src/lib/sales-scripts/stage-playbook.ts`

Statisches `Record<PipelineStage, { ziel: string; fragen: string[]; hinweis: string }>` exakt mit den im Prompt vorgegebenen Texten (new_lead → lost).

**Neu:** `src/components/crm/StagePlaybookCard.tsx` – kompakte Card mit Header (Stage-Label + „Ziel"), Fragen als Bullet-Liste, Hinweis als gedämpfter Footer.

Eingebunden in `LeadDetailSidebar` Sektion 4 („Sales-Hinweis"). Reagiert auf `lead.pipeline_item?.stage`.

Keine Backend-Anbindung; rein lokale Konstanten.

---

## Step 09 — Bestätigungs-/Folgeaktionsdialoge bei Drag & Drop

**Neu:** `src/components/crm/StageTransitionDialog.tsx` (kontrolliertes `AlertDialog` mit dynamischem Inhalt)

**Edit:** `src/components/crm/PipelineBoard.tsx`
- `onStageChange` (von Pipeline.tsx) wird umhüllt: Drag-Drop ruft zuerst `setPendingTransition({ itemId, fromStage, toStage })`, Dialog öffnet.
- Bei Bestätigung „Später / Aktion XY" wird Stage-Change ausgeführt; Aktion löst optional Folge-Dialog aus (z. B. Termin öffnen → `ScheduleCallDialog`). Abbrechen verwirft.
- Konfiguration als Lookup `STAGE_TRANSITION_PROMPTS: Record<PipelineStage, { question, actions: { label; kind: 'open_calendar' | 'open_email' | 'create_task' | 'open_offer' | 'create_offer' | 'plan_followup_24' | 'plan_followup_48' | 'manual' | 'verify_payment' | 'start_onboarding' | 'document_loss'; followupHours?; lossReason? } [] }>` – exakt nach Vorgabe.
- Sonderfall **lost**: Dialog zeigt Radio-Liste der Verlustgründe (Kein Budget / Kein Bedarf / Timing / Nicht erreichbar / Wettbewerb / Sonstiges), schreibt in `notes` (Update via `updateLead`) und loggt eine Activity (`useActivities.create`).
- Sonderfall **won**: Dialog mit Sub-Frage Zahlung bestätigt? – verlinkt auf `Membership/Provisioning`-Seite falls vorhanden, sonst Hinweistext.
- Aktionen, deren Routen/Komponenten nicht existieren, werden disabled mit Tooltip „Bald verfügbar". Stage-Wechsel bleibt ausführbar.

Robustheit:
- Dialog ist nicht blockierend für die optimistische UI: Drag-Snapback erfolgt erst, wenn der User abbricht (`onOpenChange(false)` ohne Bestätigung) → Aufruf `usePipeline.refetch()`/Reset.
- Keine Auto-Aktion ohne explizite User-Wahl.

---

## Validierung pro Step (laut KRS-Standard)

Nach jedem Step:
- TS-Build clean
- Lint clean
- Manuell: Pipeline laden, Filter / Sidebar / Skript / Drag-Dialog testen
- Status: PASS, sonst Stop & Fix

Reihenfolge: 06 → 07 → 08 → 09. Step 08 setzt voraus, dass die Sidebar aus 07 vorhanden ist.

---

## Vorschläge zur Verbesserung des Prompts (auto)

1. **Filter-Persistenz**: Pro User in `profiles.meta.pipelineFilters` speichern, damit Filterstand nach Reload erhalten bleibt.
2. **Saved Views**: Aus aktiver Filter-Kombi „Ansicht speichern" (z. B. „Heiße Leads ohne Termin") – `SavedViewsBar` existiert bereits als Stub.
3. **Sidebar Deep-Link**: `?lead=<id>` in Query → direkter Aufruf aus Aktivitäten/E-Mail.
4. **Stage-Skript Admin-Override**: Texte in Supabase (`stage_playbooks` Tabelle) optional pflegbar, mit Fallback auf Konstanten.
5. **D&D-Dialog „Nicht mehr fragen"**: Pro Stage-Transition merken (User-Pref), für erfahrene Closer.
6. **Verlustgrund-Statistik**: Strukturierte Spalte `pipeline_items.lost_reason` (statt Notes) für spätere Auswertung.

Sag „weiter" + Step-Nr. zur Implementierung – ich setze Step 06 zuerst um, sobald genehmigt.
