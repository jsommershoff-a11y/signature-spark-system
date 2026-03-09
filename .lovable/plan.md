

# Plan: Sales-Flow-Optimierung, Paywall-Monetarisierung und System-Integration

## Zusammenfassung

Dieses Vorhaben umfasst 8 Arbeitspakete, die sukzessive abgearbeitet werden. Der Fokus liegt auf der Verknuepfung von Calls, Pipeline und Angeboten zu einem durchgaengigen Sales-Flow, einer kundenseitigen Pricing/Paywall-Seite mit Dankeseite und einer Freebie-Logik fuer das LMS.

---

## Arbeitspaket 1: Call-to-Deal-Flow (Gespraechsleitfaden → Pipeline → Angebot)

**Ist-Zustand:** Der `SalesGuideWizard` existiert bereits mit 4 Phasen und Pain-Point-Discovery. Er ist aber nur innerhalb der Angebotsdetailseite eingebettet, nicht direkt aus dem Call heraus erreichbar.

**Massnahmen:**
- Den `SalesGuideWizard` in die `CallDetailView` integrieren, sodass er waehrend eines laufenden Calls genutzt werden kann
- Nach Abschluss des Wizards (Phase 4 "Closing"): automatisch einen Pipeline-Deal erstellen (`pipeline_items` mit Stage `offer_draft`) und ein Angebot (`offers`) mit den Discovery-Daten generieren
- Neuer Button "Angebot erstellen & senden" am Ende des Wizards, der:
  1. Offer mit `discovery_data` und empfohlenem Modus erstellt
  2. Pipeline-Item auf `offer_sent` setzt
  3. E-Mail via `send-offer-email` ausloest

**Dateien:** `CallDetailView.tsx`, `SalesGuideWizard.tsx` (erweitern um `onCreateDeal` Callback), `useCalls.ts`

---

## Arbeitspaket 2: KI-gestuetzter Gespraechsleitfaden mit dynamischer Anpassung

**Massnahmen:**
- Die Checklist-Hints im `SalesGuideWizard` um strukturogrambasierte Varianten erweitern (Rot/Gruen/Blau)
- Wenn ein Lead bereits eine KI-Analyse hat (`ai_analyses`), die Structogram-Daten laden und den Leitfaden automatisch anpassen:
  - Rot: Direkte Sprache, Ergebnis-Fokus, schnelle Entscheidungsfragen
  - Gruen: Vertrauensaufbau, persoenliche Geschichten, Sicherheitsargumente
  - Blau: Daten, ROI-Rechnungen, detaillierte Checklisten
- Neues Feld `ai_suggestions` im Wizard, das auf Basis der bisherigen Notizen Empfehlungen gibt (clientseitig, regelbasiert, kein API-Call noetig)

**Dateien:** `SalesGuideWizard.tsx`, neue Hilfsfunktion `lib/sales-guide-ai.ts`

---

## Arbeitspaket 3: Pipeline-Offer-Verknuepfung pruefen und haerten

**Ist-Zustand:** DB-Trigger `update_pipeline_after_offer` existiert bereits und setzt Pipeline auf `offer_sent`. Trigger `update_pipeline_after_payment` setzt auf `won`.

**Massnahmen:**
- Verifizieren, dass die Stage `offer_draft` korrekt gesetzt wird, wenn ein Angebot als Entwurf erstellt wird (aktuell fehlt dieser Trigger)
- Neuen DB-Trigger `update_pipeline_on_offer_draft` erstellen: Wenn ein Offer mit Status `draft` inserted wird, Pipeline-Item auf `offer_draft` setzen
- Pipeline-Stage `payment_unlocked` mit Offer-Status `payment_unlocked` synchronisieren (Trigger existiert noch nicht)

**Dateien:** SQL-Migration fuer neue Trigger

---

## Arbeitspaket 4: E-Mail-System pruefen und Neuanmeldungs-Sequenzen sicherstellen

**Ist-Zustand:** DB-Trigger `enroll_lead_in_sequences` existiert fuer `crm_leads`, `offers` und `orders`. Edge-Functions `send-campaign-email`, `process-email-queue`, `send-offer-email` sind deployed. Resend ist konfiguriert.

**Massnahmen:**
- Pruefen, ob die Sequenz-Trigger korrekt feuern (insbesondere `lead_registered`)
- Preset-Sequenzen via Migration sicherstellen:
  - "Willkommens-Sequenz" (trigger: `lead_registered`) – 3 Steps
  - "Angebots-Reminder" (trigger: `offer_created`) – 2 Steps
  - "Onboarding nach Kauf" (trigger: `product_purchased`) – 3 Steps
- E-Mail-Templates fuer diese Sequenzen anlegen falls nicht vorhanden

**Dateien:** SQL-Migration fuer Preset-Sequenzen und Templates

---

## Arbeitspaket 5: Pricing-Seite und Paywall-UX im Mitgliederbereich

**Ist-Zustand:** `useMembershipAccess` prueft Tier-Zugang. Paywall-Banner existiert in `CourseDetailView`. Kein dedizierter Pricing-Ueberblick fuer Kunden.

**Massnahmen:**
- Neue Seite `/app/pricing` mit den 3 Paketen:
  - **Freebie** (kostenlos nach Login): 5 fertige Prompts + KI-Analyse-Gespraech, erste 2 Lektionen jedes Kurses
  - **Starter** (998 €): KI-Prozess-Kickstart, alle Low-Budget-Kurse
  - **Growth** (2.998 €): Komplettpaket, alle Mid-Range-Kurse
  - **Premium** (9.998 €): VIP Done-for-You, alle Kurse + 1:1 Betreuung
- Pricing-Karten mit Feature-Vergleichstabelle
- CTA-Buttons, die zum Kontaktformular / Analysegespreach fuehren (kein Self-Checkout, da Verkauf ueber Sales-Call laeuft)
- Paywall-Overlay in `CourseDetailView` verlinkt auf `/app/pricing`

**Dateien:** Neue Seite `src/pages/app/Pricing.tsx`, Route in `App.tsx`, Sidebar-Link

---

## Arbeitspaket 6: Dankeseite nach Zahlung

**Massnahmen:**
- Neue Seite `/app/welcome` (Post-Purchase Thank-You):
  - Persoenliche Begruessung mit Kundennamen
  - Zusammenfassung des gekauften Pakets und aller freigeschalteten Inhalte
  - Quick-Links: Akademie starten, erstes Modul oeffnen, Profil vervollstaendigen
  - Motivations-Element: "Was dich jetzt erwartet..."
- Redirect nach Payment-Webhook auf diese Seite (ueber `MyContracts` oder direkten Link)

**Dateien:** Neue Seite `src/pages/app/Welcome.tsx`, Route in `App.tsx`

---

## Arbeitspaket 7: Freebie-Produkt und Analysegespreach-Logik

**Massnahmen:**
- Nach Login: Pruefen ob Kunde noch kein Produkt hat → Banner "Kostenlose KI-Analyse + 5 Prompts" anzeigen
- Freebie-Inhalte: Die bereits existierenden Demo-Lektionen (erste 2 pro Kurs) plus ein dedizierter "Freebie-Kurs" mit:
  - 5 fertige Prompt-Vorlagen passend zu haeufigen Business-Problemen
  - Selbstanalyse: "Welche KI braucht mein Unternehmen?"
  - CTA am Ende: "Buche dein kostenloses Analysegespreach"
- ScheduleCallDialog erweitern mit Freebie-Analyse-Option

**Dateien:** SQL-Migration fuer Freebie-Kurs-Inhalte, `KundeDashboard.tsx` (Banner), `ScheduleCallDialog.tsx`

---

## Arbeitspaket 8: Zusaetzliche Monetarisierungs-Empfehlungen

Basierend auf der Plattform-Analyse empfehle ich folgende zusaetzliche Monetarisierungsoptionen:

1. **Einzelkurs-Verkauf**: Neben Paketen auch einzelne Kurse kaufbar machen (z.B. "Prompting Masterclass" fuer 299 €) → Neues Feld `individual_price_cents` auf `courses`
2. **Upsell im LMS**: Am Ende jeder Freebie-Lektion ein Upgrade-CTA zum naechsthoeherem Paket
3. **Done-for-You Add-Ons**: Variable Angebote fuer Einzel-Implementierungen (Make.com Setup, Custom GPT etc.) → bereits ueber `variable` Offer-Mode moeglich
4. **Empfehlungsprogramm**: Kunden koennen andere Kunden werben → Neues Feature, spaeter

---

## Ausfuehrungsreihenfolge

```text
Step 01 → AP3: Pipeline-Offer-Trigger (DB-Migration)
Step 02 → AP4: E-Mail-Sequenzen pruefen/erstellen (DB-Migration)
Step 03 → AP5: Pricing-Seite erstellen
Step 04 → AP6: Dankeseite erstellen
Step 05 → AP1: Call-to-Deal-Flow (SalesGuideWizard in Calls)
Step 06 → AP2: KI-Gespraechsleitfaden-Anpassung
Step 07 → AP7: Freebie-Produkt und Analyse-CTA
Step 08 → AP8: Upsell-CTAs im LMS
```

Jeder Step wird einzeln implementiert, getestet und mit PASS/FAIL abgeschlossen, bevor der naechste beginnt.

