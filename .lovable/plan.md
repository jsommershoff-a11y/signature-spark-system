

# Plan: Komplette Vertriebsplan-Tabelle ins System integrieren

## Zusammenfassung

Die Spreadsheet hat 9 Tabs. 4 davon (Cockpit, Gespraechsleitfaden, Einwandbehandlung, Outreach) sind bereits in `sales-scripts.ts` integriert — die Skripte muessen aber mit den exakten Formulierungen aus der Tabelle aktualisiert werden. Die 5 fehlenden Tabs (Sprint-Plan, Marketingplan, Sales Funnel & KPIs, Revenue Tracker, 12-Monats-Skalierung) werden als neue Daten-Objekte in `sales-scripts.ts` ergaenzt und im StaffDashboard bzw. einer neuen Reports-Sektion angezeigt.

---

## Was fehlt / was wird aktualisiert

### 1. `sales-scripts.ts` — Bestehende Daten an Spreadsheet anpassen

**Triage-Script**: Exakte Formulierungen aus Tabelle uebernehmen:
- Opener: "Hey [Name], lass uns keine Zeit verlieren. Wir haben 15 Minuten..."
- Pain-Phase: "Was war der Hauptgrund, warum du auf meine Nachricht reagiert hast?"
- Kosten: "Was kostet dich das im Monat? Jeder Tag ohne System kostet dich Umsatz."
- Budget-Check: "Wenn wir eine Loesung finden die dir sofort 10-15h/Woche spart - waerst du bereit dafuer zu investieren?"
- Termin: "Ich sehe genau wo dein Engpass ist. Das ist exakt das was ich bei Rene Schreiner geloest habe."
- Abschluss: "Ich schicke dir den Link. Bereite dich vor mir deine 3 groessten Zeitfresser zu nennen."

**Strategy-Script**: Exakte Formulierungen:
- Vision: "Stell dir vor: CRM qualifiziert Leads automatisch. Follow-ups laufen alleine."
- Luecke: "Warum hast du das bisher nicht selbst gebaut?"
- Case Study: "Rene Schreiner: Unstrukturiert, hoher Aufwand. Wir: CRM, Portal, Bewerbungsprozess. Ergebnis: 40+ Bewerbungen."
- Pitch: "Wir bauen das System GEMEINSAM in dein Unternehmen. 30 Tage. Ab Tag 1 Ergebnisse. Investment: 10.000 EUR."

**Kaltakquise-Script**: Exakte Formulierungen + neue "Bei Ablehnung"-Phase:
- Opener: "Herr/Frau [Name], Jan Sommershoff hier. Ich sehe dass Ihr Unternehmen waechst. Haben Sie 60 Sekunden?"
- Hook: "Die meisten in Ihrer Groesse verlieren 2-5k/Monat durch manuelle Prozesse."
- Termin: "Genau da setzen wir an. Ich habe 2 Slots fuer ein 15-Min Prozess-Audit."
- NEU — Ablehnung: "Kein Problem. Darf ich kurz eine Info per E-Mail schicken?"

**Einwandbehandlung**: Exakte Konter aus Tabelle uebernehmen (aktuell leicht anders formuliert)

**Outreach-Vorlagen**: Texte 1:1 aus Tabelle ersetzen (sind aktuell paraphrasiert, nicht original)

**SALES_TARGETS**: Erweitern um Produktpreise + neue Funnel-Stufen:
- Produkte: Done-with-you (9.990 brutto), Coaching-Retainer (1.990 brutto), Website-Pakete (999 brutto)
- Funnel: 500 Leads → 250 Triage → 150 Strategy → 100 Angebote → 40 Abschluesse

### 2. `sales-scripts.ts` — Neue Daten-Objekte

**SPRINT_PLAN**: Woechentlicher Aktionsplan (Mo-Fr) mit Uhrzeiten, Aufgaben, Details, Kanal
- Wird als Array von Tages-Objekten mit Zeitslots gespeichert

**MARKETING_PLAN**: Kanal-Strategie + Content-Kalender
- Kanaele: LinkedIn, Instagram, Kaltakquise, E-Mail, Lead-Magnet, Empfehlungen, Events
- Content-Wochenplan: Tag → Plattform → Typ → Hook → CTA
- Marketing-KPIs: 20+ Posts, 12+ Reels, 100+ DMs, 30+ Downloads, 80+ Kaltanrufe

**FUNNEL_STAGES**: Sales-Funnel mit Conversion-Rates
- 5 Stufen mit Ziel-Zahlen und Ziel-Raten

**DAILY_ACTIVITIES**: Tages-Aktivitaeten-Tracker
- Outreach: 30/Tag, Kaltanrufe: 30/Tag, Triage: 10/Tag, Strategy: 5/Tag, Follow-ups: 10/Tag

**SCALING_ROADMAP**: 12-Monats-Plan
- Apr 2026 bis Maerz 2027 mit Einmalig/Recurring/Gesamt pro Monat
- Meilensteine: Monat 1 (37k) → Monat 6 (100k) → Monat 12 (140k = 1.2 Mio/Jahr)

### 3. `StaffDashboard.tsx` — Erweitertes Sales Cockpit

Das bestehende `SalesCockpitWidget` wird erweitert:
- **Produktpreise anzeigen**: Done-with-you (9.990), Coaching (1.990), Website (999) mit Stueckziel
- **Funnel-Uebersicht**: 5 Stufen mit Ziel-Conversion-Rates als horizontale Mini-Bar
- **Tages-Aktivitaeten**: Vollstaendige Liste (Outreach 30, Kaltanrufe 30, Triage 10, Strategy 5, Follow-ups 10, Posts 1, Stories 3)
- **Sprint-Plan Hinweis**: Link oder Kurzansicht des aktuellen Wochen-Plans

### 4. Neue Sektion im Reports-Bereich: Vertriebsplan

In `src/pages/app/Reports.tsx` neuen Tab "Vertriebsplan" hinzufuegen mit:
- **Funnel-Visualisierung**: 5 Stufen als Trichter mit IST/SOLL
- **Marketing-KPIs**: Tabelle mit Kanal, Massnahme, Frequenz, Ziel-Leads
- **Content-Kalender**: Wochenansicht Mo-Fr
- **12-Monats-Roadmap**: Timeline-Ansicht mit Meilensteinen
- **Revenue-Tracker**: Tabelle mit Abschluessen und Monatszusammenfassung

### Neue Komponente: `src/components/reports/SalesPlanTab.tsx`

---

## Dateien

1. **Aendern**: `src/lib/sales-scripts.ts` — Bestehende Skripte aktualisieren + 5 neue Daten-Objekte
2. **Aendern**: `src/components/dashboard/StaffDashboard.tsx` — SalesCockpitWidget erweitern
3. **Neu**: `src/components/reports/SalesPlanTab.tsx` — Vertriebsplan-Tab fuer Reports
4. **Aendern**: `src/pages/app/Reports.tsx` — Neuen "Vertriebsplan"-Tab hinzufuegen

