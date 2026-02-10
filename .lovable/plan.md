

# Erweiterung Angebots-/Vertragssystem (Steps 15-24)

Fortfuehrung der bestehenden Nummerierung. Neue Features: Bedarfsermittlung im Verkaufsprozess, Kundenportal mit geschuetztem Vertragsbereich, Mindestpreise (Performance 3.000 EUR / Rocket Performance 7.000 EUR), Demo-Zugang, und Zahlungsfreischaltungslogik.

---

## Step 15 -- Bedarfsermittlung im Verkaufsprozess (Pain-Point Discovery)

**Ziel:** Im Erstgespraech und Angebotsprozess die Problembereiche des Kunden systematisch erfassen, um diese spaeter im Angebotsgespraech als Trigger fuer die Loesung zu nutzen.

**Neue Datei: `src/components/offers/PainPointDiscovery.tsx`**
- Mehrstufiger Fragebogen fuer den Setter/Mitarbeiter (nicht fuer den Kunden direkt):
  1. "Welche Bereiche performen aktuell nicht?" (Mehrfachauswahl):
     - Vertrieb / Lead-Generierung
     - Abschlussquote / Closing
     - Prozesse / Workflows
     - Fuehrung / Delegation
     - Sichtbarkeit / Marketing
     - Kundenbindung / Retention
  2. "Budget-Einschaetzung des Kunden" (wird mehrfach im Erstgespraech abgefragt):
     - "Was waere Ihnen eine funktionierende Loesung wert?" (Freitext + Bereichsauswahl: 3.000-5.000 / 5.000-10.000 / 10.000+)
     - "Zweite Budget-Rueckfrage": gleiche Optionen (zur Konsistenzpruefung)
  3. "Dringlichkeit" (Sofort / 2-4 Wochen / 1-3 Monate)
  4. "Structogram-Schnelleinschaetzung" (ROT/GRUEN/BLAU)
  5. "Gibt es ein internes Team?" (Ja / Teilweise / Nein)
- Ergebnisse werden als `discovery_data` in `offer_json` gespeichert
- Automatische Empfehlung: Performance vs. Rocket Performance basierend auf Team-Verfuegbarkeit und Budget
- Pain-Points werden spaeter in der OfferPreview als "Ihre Herausforderungen" und die passenden Bausteine als "Unsere Loesung" gegenueber gestellt

**Aenderung: `src/types/offers.ts`**
- Neuer Typ `DiscoveryData` mit Feldern: `pain_points`, `budget_responses`, `urgency`, `structogram_type`, `has_team`, `recommended_mode`
- `OfferContent` um Feld `discovery_data?: DiscoveryData` erweitern

---

## Step 16 -- Mindestpreise und Programm-Konfiguration

**Ziel:** Performance mindestens 3.000 EUR netto, Rocket Performance mindestens 7.000 EUR netto. Hoehere Preise frei waehlbar.

**Neue Datei: `src/lib/offer-modules.ts`**
- Konstanten:
  - `PROGRAM_MIN_PRICES`: `{ performance: 300000, rocket_performance: 700000 }` (in Cent)
  - `PROGRAM_LABELS`: `{ performance: 'Performance', rocket_performance: 'Rocket Performance' }`
  - `PROGRAM_DESCRIPTIONS`: Kurzbeschreibung je Programm
- Validierungsfunktion `validateOfferPrice(mode, totalCents)`: Prueft ob Mindestpreis eingehalten wird
- 10 Bausteine als Array mit ID, Label, Beschreibung, Deliverables je Modus
- Kombinationsregeln (Pflichtbausteine, Abhaengigkeiten)

**Aenderung: `src/components/offers/CreateOfferDialog.tsx`**
- Preisvalidierung: Fehlermeldung wenn Gesamtpreis unter Mindestpreis liegt
- Anzeige des Mindestpreises beim gewaehlten Programm
- Preis-Eingabe in Euro (nicht Cent) fuer Benutzerfreundlichkeit, interne Umrechnung

---

## Step 17 -- Programm-Thumbnails (Performance / Rocket Performance)

**Ziel:** Zwei visuell ansprechende, klickbare Karten fuer die Programmauswahl.

**Neue Datei: `src/components/offers/ProgramThumbnail.tsx`**
- **Performance**: Blaues Design mit Zap-Icon, "Ab 3.000 EUR netto", Stichpunkte (Systemaufbau, CRM, Skripte, Dashboard)
- **Rocket Performance**: Gold/Amber-Design mit Rocket-Icon, "Ab 7.000 EUR netto", Stichpunkte (Premium-Betreuung, vollstaendiger Aufbau, KI-Integration)
- Props: `mode`, `selected`, `onSelect`, `disabled`
- Hover- und Auswahl-Animationen

---

## Step 18 -- Kundenportal: Geschuetzter Vertragsbereich

**Ziel:** Kunden (Rolle "kunde") erhalten im App-Bereich Zugriff auf ihre Vertraege. Der Vertragsbereich ist nur nach Login sichtbar und zeigt die dem Kunden zugeordneten Angebote/Vertraege.

**Neue Datei: `src/pages/app/MyContracts.tsx`**
- Seite fuer Kunden (Rolle "kunde") unter `/app/contracts`
- Zeigt alle Angebote/Vertraege die dem eingeloggten Kunden zugeordnet sind:
  - Laedt Angebote ueber `offers`-Tabelle, gefiltert auf die `lead_id` des Kunden (via `members.lead_id` -> `offers.lead_id`)
  - Status-Anzeige: Angebot / Vertrag angenommen / Bezahlt / Freigeschaltet
  - Klick oeffnet die Detailansicht mit Vertrag, AGB, Leistungsbeschreibung
- Freischaltungsstatus sichtbar (welche Inhalte/Kurse nach Zahlung verfuegbar sind)
- "Demo"-Badge fuer noch nicht bezahlte Inhalte

**Neue Datei: `src/hooks/useMyContracts.ts`**
- Hook fuer den Kunden-Vertragsbereich
- Laedt Offers ueber `member.lead_id` Verbindung
- Filtert auf Status `sent`, `viewed`, `accepted` und Offers mit `payment_unlocked`

**Aenderungen:**
- `src/App.tsx`: Neue Route `/app/contracts` (keine Rollenbeschraenkung, da nur eigene Daten sichtbar via RLS)
- `src/components/app/AppSidebar.tsx`: Neuer Menuepunkt "Vertraege" mit `FileText`-Icon, sichtbar fuer Rolle `kunde`

---

## Step 19 -- Demo-Bereich fuer Kunden

**Ziel:** Kunden die noch nicht bezahlt haben, erhalten einen eingeschraenkten Demo-Zugang zum Kursbereich.

**Aenderung: `src/pages/app/Courses.tsx`**
- Statt "Kursbereich ist fuer Mitglieder verfuegbar" wird ein Demo-Modus angezeigt:
  - Erste 1-2 Lektionen jedes Kurses sichtbar (mit "Demo"-Badge)
  - Restliche Lektionen als gesperrt angezeigt (Lock-Icon + "Nach Freischaltung verfuegbar")
  - CTA-Button: "Jetzt freischalten" verlinkt auf den Vertragsbereich

**Aenderung: `src/hooks/useMember.ts`**
- Neues Feld `isDemoUser`: `true` wenn Profil existiert aber kein aktives Membership vorhanden
- Demo-Logik: Kurs-Daten werden geladen, aber `progress`-Tracking nur fuer freigeschaltete Lektionen

---

## Step 20 -- Freischaltungslogik nach Zahlung

**Ziel:** Nach erfolgreicher Zahlung wird der Vertragsbereich freigeschaltet, Kurs-Zugang aktiviert, und der Kunde informiert.

**Aenderung: `supabase/functions/webhook-payment/index.ts`**
- Nach erfolgreicher Zahlung zusaetzlich:
  1. `offers`-Status auf `paid` setzen (neuer Status) statt `viewed`
  2. Member-Record erstellen/aktivieren (existiert bereits groesstenteils)
  3. Membership mit korrektem Product erstellen:
     - Gesamtpreis >= 700000 Cent -> `premium` (Rocket Performance)
     - Gesamtpreis >= 300000 Cent -> `growth` (Performance)
  4. Vertragsdokument als "freigeschaltet" markieren in `offer_json`

**Aenderung: `src/types/offers.ts`**
- `OfferStatus` um `paid` erweitern (nach accepted + Zahlung)
- Labels und Colors fuer `paid` ergaenzen

---

## Step 21 -- An-/Abmeldung und Kontoerstellung

**Ziel:** Kunden koennen sich registrieren und anmelden, um auf den Vertragsbereich und Demo-Kurse zuzugreifen.

**Aenderung: `src/pages/Auth.tsx`**
- Registrierungs-Tab: Vorname, Nachname, E-Mail, Passwort (existiert groesstenteils)
- Nach Registrierung: Automatische Weiterleitung zu `/app/contracts` fuer Kunden
- Login: Weiterleitung basierend auf Rolle (Kunde -> `/app/contracts`, Mitarbeiter -> `/app`)

**Aenderung: `src/pages/app/Dashboard.tsx`**
- Fuer Kunden: Quick-Links zu "Meine Vertraege" und "Kurse" prominent anzeigen
- Demo-Hinweis wenn keine aktive Membership

---

## Step 22 -- CreateOfferDialog Gesamtueberarbeitung

**Ziel:** Den Dialog um alle neuen Features erweitern (PainPoints, Programmauswahl, Bausteine, Mindestpreise, Zahlungsanbieter).

**Aenderung: `src/components/offers/CreateOfferDialog.tsx`**
- Mehrstufiger Wizard (5 Schritte mit Fortschrittsanzeige):
  1. **Bedarfsermittlung**: PainPointDiscovery einbetten
  2. **Programmauswahl**: ProgramThumbnails (Performance / Rocket Performance), Mindestpreis-Hinweis
  3. **Bausteine & Positionen**: Baustein-Checkboxen + individuelle Line-Items, Preis-Eingabe in Euro
  4. **Zahlungsplan & Anbieter**: Einmalzahlung / 3 Raten / 6 Raten + Stripe/CopeCart Auswahl durch Mitarbeiter
  5. **Zusammenfassung**: Vorschau aller Eingaben, Validierung Mindestpreis, Speichern als Entwurf

---

## Step 23 -- Stripe und CopeCart Zahlungsanbieter-Auswahl

**Ziel:** Mitarbeiter waehlt im CreateOfferDialog den Zahlungsanbieter. Auf der oeffentlichen Seite wird der richtige Checkout angezeigt.

**Aenderung: `src/types/offers.ts`**
- `OfferContent` um `payment_provider_choice: 'stripe' | 'copecart'` erweitern

**Aenderung: `src/pages/Offer.tsx`**
- Payment-Bereich zeigt je nach `payment_provider_choice`:
  - Stripe: "Jetzt bezahlen" Button erstellt Stripe Checkout Session
  - CopeCart: "Jetzt bezahlen" Button leitet auf CopeCart Checkout URL weiter
- Zahlungsanbieter-Logo wird angezeigt

**Hinweis:** Stripe-Aktivierung erfolgt ueber das Lovable Stripe-Tool (Secret Key wird abgefragt). CopeCart benoetigt API-Key als Secret. Beide Webhooks laufen ueber die bestehende `webhook-payment` Edge Function.

---

## Step 24 -- Barrel-Exporte, Routing und Build-Pruefung

**Aenderungen:**
- `src/components/offers/index.ts`: Neue Exporte (`ProgramThumbnail`, `PainPointDiscovery`)
- `src/App.tsx`: Route `/app/contracts` hinzufuegen
- `src/components/app/AppSidebar.tsx`: Menuepunkt "Vertraege" fuer Kunden
- TypeScript-Kompilierung: 0 Fehler
- Visueller Test:
  - Angebotserstellung mit Bedarfsermittlung und Programmauswahl
  - Mindestpreis-Validierung (Performance < 3000 EUR -> Fehler)
  - Kundenportal Vertragsbereich
  - Demo-Zugang Kurse
  - Zahlungsanbieter-Auswahl

---

## Technische Details

- **Mindestpreise** werden client-seitig validiert (UX) und zusaetzlich in der `createOffer`-Mutation geprueft
- **Vertragsbereich** nutzt bestehende RLS: Kunden sehen nur Offers deren `lead_id` zu ihrem Member-Record passt
- **Demo-Modus** ist rein Frontend-Logik: Kurs-Daten werden geladen, aber gesperrte Lektionen zeigen Lock-UI
- **Zahlungsanbieter** wird in `offer_json.payment_provider_choice` gespeichert, die oeffentliche Seite routet entsprechend
- **Discovery-Daten** werden im Angebotsgespraech als Referenz angezeigt: "Ihre Herausforderungen" -> "Unsere Loesung"
- **Neuer Status `paid`** schliesst den Lifecycle: draft -> pending_review -> approved -> sent -> viewed -> accepted -> paid

