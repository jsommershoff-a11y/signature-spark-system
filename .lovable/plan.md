# Pipeline-Überarbeitung – 16-Step Plan

Großer Umbau, ausschließlich UI. Keine DB-, Enum-, Stage-Key-, Trigger- oder Webhook-Änderungen. Stage-Keys (`new_lead`, `setter_call_scheduled`, …) bleiben unverändert.

## Zentrale Regel
Eine einzige Quelle der Wahrheit für sichtbare Labels & Tooltips: `src/types/crm.ts` (Konstanten) + `src/lib/pipeline-stage.ts` (Helper). Alle Pipeline-UIs lesen ausschließlich darüber.

---

## Step 01 – Labels final umbenennen (ohne Emojis)
- `PIPELINE_STAGE_LABELS` in `src/types/crm.ts` auf reine Texte umstellen:
  - `new_lead` → "Eingang – noch nicht bewertet"
  - `setter_call_scheduled` → "Erstgespräch terminiert"
  - `setter_call_done` → "Erstgespräch durchgeführt"
  - `analysis_ready` → "Analyse erstellt – bereit für Angebot"
  - `offer_draft` → "Angebot wird vorbereitet"
  - `offer_sent` → "Angebot versendet – Entscheidung offen"
  - `payment_unlocked` → "Follow-up & Abschlussphase"
  - `won` → "Kunde gewonnen"
  - `lost` → "Kein Abschluss"
- Test `pipeline-label-consistency.test.tsx` an neue Labels anpassen (Legacy-Liste & Erwartungen).
- Verifizieren: `PipelineColumn`, `PipelineHeatmap`, `PipelineStatsWidget`, `LeadDetailModal` ziehen ausschließlich aus `PIPELINE_STAGE_LABELS` / `getStageLabel()`.

## Step 02 – Tooltips pro Spalte mit Status / Aufgabe / Ziel
- `PIPELINE_STAGE_HINTS` zu strukturiertem `PIPELINE_STAGE_TOOLTIPS: Record<PipelineStage, { status; task; goal }>` erweitern (in `src/types/crm.ts`). Alte `*_HINTS` als abgeleiteter Kurztext beibehalten für bestehende Komponenten.
- `StageTooltip.tsx` rendert drei Mini-Sektionen (Status / Aufgabe / Ziel), kompakt, max-width 280px, wrap, mobile-klickbar.
- Info-Icon neben jedem Spaltentitel ist bereits vorhanden – sicherstellen dass es Tooltip + Klick-Popover unterstützt (Touch).

## Step 03 – Lead-Karte erweitern (`PipelineCard.tsx`)
Strukturierte Bereiche:
1. Kopf: Firma/Name, Ansprechpartner, kleine Source-Badge.
2. Status: aktuelle Phase (Mini-Badge) + nächste Aktion (aus Phase abgeleitet).
3. Bewertung: ICP-Fit, `purchase_readiness` (Abschlussnähe), Angebotswert (falls aus `offers`/`pipeline_item` ableitbar – sonst Fallback).
4. Aktivität: letzter Kontakt (`stage_updated_at` oder Activity), nächster Termin (falls vorhanden), Overdue-Warnung.
- Saubere Fallbacks ("Noch nicht bewertet", "Kein Wert hinterlegt", "Kein Kontakt erfasst").
- Karte vollständig klickbar, öffnet `LeadDetailModal`.

## Step 04 – Quick Actions auf Karten
- Hover-Bar (Desktop) bzw. permanent kompakt (Mobile) mit Icon-Buttons:
  Anrufen (`tel:` falls phone), Termin planen (`ScheduleCallDialog`), E-Mail (`mailto:` oder InboxHub), Angebot erstellen (`CreateOfferDialog`), Aufgabe erstellen (`CreateTaskDialog`), Detail öffnen.
- Buttons stoppen Click-Propagation, stören Drag&Drop nicht (`draggable=false` an Buttons).
- Pro Phase eine **primäre Aktion** visuell hervorheben (Mapping `STAGE_PRIMARY_ACTION` in `pipeline-stage.ts`).
- Fehlende Funktionen → Button deaktiviert mit Tooltip "Noch nicht verbunden" oder ausgeblendet.

## Step 05 – KPI-Leiste oberhalb des Kanbans
- Neue Komponente `src/components/crm/PipelineKpiBar.tsx` über `PipelineBoard`.
- Karten: Leads gesamt, Noch nicht bewertet, Erstgespräche terminiert, Angebote offen (`offer_draft`+`offer_sent`), Follow-up & Abschluss, Gewonnen, Pipeline-Wert, Erwarteter Umsatz.
- Werte aus `pipelineByStage` + (sofern verfügbar) `useOffers`-Summen. Ohne Werte: "Noch keine Daten" / "0 €".
- Karten klickbar → setzen `stageFilter` im Board (für Pipeline-Wert/Umsatz: TODO-Kommentar, kein kaputter Link).
- Responsive Grid (2 / 4 / 8 Spalten).

## Step 06 – Filter & Suche (oberhalb Board)
- Vorhandene Suche (Name/Firma/E-Mail) bleibt; ergänzen um Filter-Popover:
  Phase (Mehrfach), Verantwortlicher (`owner_user_id`), Quelle (`source_type`), Priorität (Score-Bucket), Überfällig (basierend auf `stage_updated_at` > X Tage), mit/ohne Angebot, mit/ohne Termin.
- Zeitraum: Heute / Diese Woche / Dieser Monat / Custom (Filter über `stage_updated_at`).
- "Filter zurücksetzen", angezeigte Lead-Anzahl.
- Mobile: Filter in `Sheet`/Collapsible.
- Felder die nicht zuverlässig vorliegen → Filter disabled mit Tooltip.

## Step 07 – Lead-Detail-Sidebar
- Neue Komponente `src/components/crm/PipelineLeadSidebar.tsx` als `Sheet` (rechts, Desktop) / Fullscreen-Drawer (Mobile).
- Tabs/Sektionen: Kopf, Nächste Aktion, Kommunikation (Inbox-Link), Sales-Hinweis (Vorgriff Step 08), Angebot/Analyse (Status + CTAs), Historie (`ActivityFeed` oder Fallback).
- Trigger: Klick auf Pipeline-Karte öffnet **Sidebar statt** des bestehenden `LeadDetailModal` auf der Pipeline-Seite. Modal bleibt anderswo erhalten.

## Step 08 – Sales-Skript-Karte je Phase
- Neue Konstante `SALES_SCRIPTS_BY_STAGE` in `src/lib/sales-scripts/index.ts` (Ziel, 3 Fragen, Hinweis – Texte aus Prompt 08 übernommen).
- Sektion `<StageSalesScriptCard stage={stage} />` in der Sidebar (Step 07).

## Step 09 – Drag-&-Drop Folgeaktions-Dialoge
- Neuer `<StageTransitionDialog>`-Wrapper in `PipelineBoard`. Nach erfolgreichem `moveToStage` öffnet Dialog mit phasenspezifischen Folgeaktionen (Mapping `STAGE_TRANSITION_ACTIONS`).
- Mappings für: scheduled, done, analysis_ready, offer_draft, offer_sent, payment_unlocked, won, lost (Verlustgrund-Chips).
- "Später" / Schließen ohne Folgeaktion möglich. Aktionen verlinken auf bestehende Dialoge/Routen, Verlustgrund schreibt in `pipeline_items.meta` oder `notes` (vorhandene Felder, keine Schema-Änderung – sonst rein UI-Toast als Fallback).

## Step 10 – Termin-/Kalenderanzeige
- In `PipelineCard` und Sidebar: nächsten Termin aus `useCalls({ lead_id })` lesen.
- Karte: Datum/Uhrzeit + Badges "Heute" / "Überfällig".
- Sidebar: Terminart, Link, Buttons "Kalender öffnen" (`/app/live-calls-calendar`) / "Termin planen" (öffnet `ScheduleCallDialog`).
- Fallbacks: "Kein Termin geplant".

## Step 11 – Farblogik vereinheitlichen
- `STAGE_COLOR_TOKEN` Map in `pipeline-stage.ts` (Akzentfarbe pro Phase, dezent, Tailwind-Tokens).
- Anwendung: dünne 2px Akzentlinie am Spaltenkopf + Mini-Dot, statt grellem Hintergrund.
- `PipelineStatsWidget` & `PipelineHeatmap` nutzen dasselbe Mapping (lokale `STAGE_COLORS` entfernen).
- Light/Dark geprüft.

## Step 12 – Empty States
- In `PipelineColumn`: bei `items.length===0` Texte aus Prompt 12 + dezenter Lucide-Icon (z. B. `Inbox`, `Calendar`, `MessageSquare`, `BarChart3`, `FileEdit`, `Send`, `Handshake`, `Trophy`, `Archive`).
- Neue Konstante `PIPELINE_STAGE_EMPTY_STATES` in `src/types/crm.ts`.

## Step 13 – Responsive Check
- Desktop: horizontaler ScrollArea bestätigen, KPI-Leiste sticky/wrappend.
- Tablet: Filter-Popover, kompakte Karten.
- Mobile: Sidebar als Fullscreen-Drawer, Tooltips per Klick, Karten min-w 240px (bereits da), Buttons ≥ 32px Touch-Target.
- Snapshot-Notiz im Code-Kommentar dokumentieren.

## Step 14 – Dashboard-Verlinkung
- `PipelineStatsWidget`, `TopLeadsWidget`, `TodayPrioritiesWidget`, `QuickActionsWidget`, `StaffDashboard`, `KundeDashboard`, `AdminDashboard` prüfen.
- Links auf Pipeline ggf. mit Query-Param erweitern (`/app/pipeline?stage=offer_sent`) – `PipelineBoard` liest Param und setzt `stageFilter`.
- Alte Begriffe in Widget-Texten ersetzen.

## Step 15 – Sprache global syncen
- Suchen & ersetzen sichtbarer Texte in:
  - `src/hooks/useCalls.ts` Toast "Call geplant" → "Erstgespräch terminiert".
  - `src/hooks/useOffers.ts` Toast-Texte angleichen ("Angebot versendet", "Follow-up freigeschaltet").
  - `src/components/offers/PaymentUnlockButton.tsx`, `OfferApprovalCard.tsx`: "Zahlung freigeschaltet" → "Follow-up & Abschlussphase aktiviert" (Funktionalität unverändert).
  - `src/pages/app/MyContracts.tsx` Anzeigetext.
  - `pipeline-label-consistency.test.tsx` Legacy-Liste aktualisieren (entfernt nur die jetzt-erlaubten Begriffe wo nötig).
- Stage-Keys/DB-Werte unverändert. Notification "Neuer Lead" in `NotificationsCenter.tsx` bleibt (eigener Notification-Typ, nicht Pipeline-Phase).

## Step 16 – Abschlussprüfung
- TypeScript build, vitest run, Console-Errors check.
- Checkliste durcharbeiten (16 Punkte aus Prompt 16) und Befund + Korrekturen dokumentieren.
- Final-Liste: geänderte Dateien, gefundene/gefixte Inkonsistenzen, offene TODOs.

---

## Voraussichtlich neue Dateien
- `src/components/crm/PipelineKpiBar.tsx`
- `src/components/crm/PipelineFilters.tsx`
- `src/components/crm/PipelineLeadSidebar.tsx`
- `src/components/crm/StageTransitionDialog.tsx`
- `src/components/crm/StageSalesScriptCard.tsx`
- `src/components/crm/PipelineCardActions.tsx`

## Voraussichtlich geänderte Dateien
- `src/types/crm.ts` (Labels, Tooltips, Empty-States, Mappings)
- `src/lib/pipeline-stage.ts` (Color-Tokens, Primary-Actions, Transition-Actions)
- `src/components/crm/StageTooltip.tsx` (3-Felder-Layout)
- `src/components/crm/PipelineBoard.tsx` (KPI-Bar, Filter, Query-Param, Sidebar, Transition-Dialog)
- `src/components/crm/PipelineColumn.tsx` (Akzentlinie, Empty-State)
- `src/components/crm/PipelineCard.tsx` (Reichere Darstellung, Actions, Termin)
- `src/components/crm/PipelineHeatmap.tsx` (Color-Tokens)
- `src/components/dashboard/PipelineStatsWidget.tsx` (Color-Tokens, Links)
- `src/components/dashboard/*` Widgets mit Pipeline-Bezug (Step 14)
- `src/pages/app/Pipeline.tsx` (Sidebar statt Modal)
- `src/hooks/useCalls.ts`, `src/hooks/useOffers.ts`, `src/components/offers/PaymentUnlockButton.tsx`, `OfferApprovalCard.tsx`, `src/pages/app/MyContracts.tsx` (Sprache)
- `src/lib/sales-scripts/index.ts` (Stage-Skripte)
- `src/components/crm/__tests__/pipeline-label-consistency.test.tsx` (Anpassung)

## Stop-the-Line Disziplin
Nach jedem Step: Build + Tests + Console-Check. Nur bei PASS weiter zum nächsten Step. Status pro Step im Antwortformat:
```
Step NN — Titel
Change: …
Test: …
Status: PASS / FAIL
```

Nach Approval starte ich mit Step 01.