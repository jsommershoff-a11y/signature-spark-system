

# Steps 25-33: Angebotsversand, Kundenbestaetigung, Zahlungslink und Variables Angebot

Fortsetzung der bestehenden Nummerierung. Zwei Hauptfeatures: (A) Versand- und Bestaetigungsflow fuer Standard-Angebote, (B) Variables Angebot fuer kleinere Auftraege mit Fortschrittsdokumentation.

---

## Step 25 -- Angebotsversand: Status-Workflow und Freigabe im OfferDetail

**Ziel:** Im internen OfferDetail koennen Mitarbeiter das Angebot durch den kompletten Workflow fuehren: Entwurf -> Pruefung -> Genehmigt -> Senden. Nach dem Senden wird der oeffentliche Link aktiv.

**Aenderung: `src/pages/app/OfferDetail.tsx`**
- Workflow-Status-Leiste oben: Visueller Fortschritt (Entwurf -> Pruefung -> Genehmigt -> Gesendet -> Angesehen -> Angenommen -> Bezahlt)
- "Zur Pruefung einreichen"-Button (Status `draft`, Rolle `mitarbeiter`)
- "Genehmigen"-Button bleibt (Status `pending_review`, Rolle `teamleiter`)
- "Senden"-Button bleibt (Status `approved`, Rolle `mitarbeiter`)
- "Zahlung freischalten"-Button erst nach Status `accepted` (nicht bei `sent`/`viewed`)
- PainPointRadar in der internen Ansicht anzeigen (wenn discovery_data vorhanden)
- Vertragsdetails-Bereich: Wer hat unterschrieben, wann, Unterschrift-Bild (wenn `contract_accepted`)

**Test:**
- Build kompiliert ohne Fehler
- Workflow-Leiste zeigt korrekten Status
- Buttons erscheinen nur bei passendem Status und passender Rolle

---

## Step 26 -- Oeffentliche Angebotsseite: Vertragsannahme durch Kunden

**Ziel:** Kunde kann auf der oeffentlichen Seite (`/offer/:token`) das Angebot einsehen, AGB lesen, digital unterschreiben und annehmen. Danach oeffnet sich sofort der Zahlungslink.

**Neue Datei: `src/components/offers/ContractAcceptance.tsx`**
- Aufklappbare Abschnitte: Leistungsbeschreibung, AGB, Widerrufsbelehrung
- Pflicht-Checkboxen: "AGB gelesen und akzeptiert" + "Widerrufsbelehrung zur Kenntnis genommen"
- Name-Eingabefeld fuer Unterschrift
- SignaturePad (Canvas-basiert, Touch + Mouse)
- "Angebot annehmen"-Button (nur aktiv wenn alles ausgefuellt)
- Props: `offer`, `onAccept`

**Neue Datei: `src/components/offers/SignaturePad.tsx`**
- HTML Canvas-Zeichenflaeche
- Unterstuetzt Mouse und Touch
- "Zuruecksetzen"-Button
- Gibt Base64-PNG als String zurueck via `onSignatureChange`

**Aenderung: `src/pages/Offer.tsx`**
- Nach OfferPreview: ContractAcceptance-Bereich anzeigen (nur wenn Status `sent` oder `viewed`, nicht abgelaufen)
- Nach Annahme (Status `accepted`): Bestaetigung + sofort Zahlungsbereich anzeigen wenn `payment_unlocked`
- Payment-Bereich: "Jetzt bezahlen"-Button mit Zahlungsanbieter-Info

**Aenderung: `src/hooks/useOffers.ts`**
- Neue Funktion `acceptOffer(token, acceptanceData)`: oeffentliche Mutation (ohne Auth), aktualisiert offer_json mit Vertragsdaten und setzt Status auf `accepted`

**Test:**
- Build kompiliert ohne Fehler
- Oeffentliche Seite zeigt Vertragsakzeptanz fuer gesendete Angebote
- Nach Annahme wechselt Status auf `accepted`
- Zahlungslink wird sofort sichtbar

---

## Step 27 -- RLS-Policy fuer oeffentliche Vertragsannahme

**Ziel:** Die oeffentliche Angebotsseite muss den Offer-Status von `sent`/`viewed` auf `accepted` aendern koennen, ohne dass der Benutzer eingeloggt ist.

**DB-Migration:**
- Neue RLS-Policy auf `offers`: `Public can accept via token` (UPDATE, Permissive: No)
  - Using: `public_token IS NOT NULL AND status IN ('sent', 'viewed')`
  - Beschraenkt auf Status-Aenderung auf `accepted` und `offer_json`-Update

**Test:**
- Migration erfolgreich
- Oeffentliche Annahme funktioniert ohne Auth-Fehler
- Nur Status `sent`/`viewed` -> `accepted` moeglich

---

## Step 28 -- Angebotstyp "Variable" (Kurzangebot)

**Ziel:** Neuer Angebotstyp fuer kleinere Auftraege, die sofort gezahlt werden koennen. Enthalt: Kurztext mit erwarteter Leistung, voraussichtlichem Fertigstellungszeitpunkt, geschaetzten Kosten, und Hinweis auf Mehrkosten.

**Aenderung: `src/types/offers.ts`**
- `OfferMode` erweitern: `'performance' | 'rocket_performance' | 'variable'`
- Neues Interface `VariableOfferData` in `OfferContent`:
  - `expected_service: string` (Erwartete Leistung)
  - `estimated_completion: string` (Voraussichtlicher Zeitpunkt)
  - `estimated_cost_cents: number` (Geschaetzte Kosten)
  - `additional_cost_note: string` (Hinweis auf Mehrkosten)
  - `progress_percent: number` (0-100)
  - `progress_updates: ProgressUpdate[]` (Dokumentation)
- Neues Interface `ProgressUpdate`:
  - `date: string`, `text: string`, `author: string`, `published: boolean`
- Labels und Colors fuer `variable` ergaenzen

**Aenderung: `src/lib/offer-modules.ts`**
- `PROGRAM_MIN_PRICES` um `variable: 0` (kein Mindestpreis)
- `PROGRAM_LABELS` um `variable: 'Variables Angebot'`
- `REQUIRED_MODULES` um `variable: []` (keine Pflichtbausteine)

**Aenderung: `src/lib/legal-templates.ts`**
- AGB-Ergaenzung: Neuer Paragraph zu Mehrkosten bei variablen Angeboten
- `generateServiceDescription` um Variable-Modus erweitern

**Test:**
- Build kompiliert ohne Fehler
- Typen korrekt, keine TypeScript-Fehler

---

## Step 29 -- CreateOfferDialog: Variables Angebot erstellen

**Ziel:** Im Wizard kann der Mitarbeiter "Variables Angebot" als drittes Programm waehlen. Es oeffnet sich ein vereinfachter Flow.

**Aenderung: `src/components/offers/ProgramThumbnail.tsx`**
- Dritte Karte: "Variables Angebot" mit FileEdit-Icon, grauer/gruener Stil, "Kein Mindestbetrag", Stichpunkte (Kurzauftrag, Sofortzahlung, Fortschrittsverfolgung)

**Aenderung: `src/components/offers/CreateOfferDialog.tsx`**
- Wenn `offerMode === 'variable'`: Wizard springt direkt von Programmauswahl (Step 1) zu einem vereinfachten Step:
  - "Erwartete Leistung" (Textarea)
  - "Voraussichtlicher Fertigstellungszeitpunkt" (Datepicker oder Text)
  - "Geschaetzte Kosten" (Euro-Eingabe)
  - "Hinweis auf Mehrkosten" (vorausgefuellter Text, editierbar)
  - Dann direkt zu Zahlung und Zusammenfassung
- Kein Bedarfsermittlung-Step, keine Bausteine fuer Variable
- Mindestpreis-Validierung wird fuer Variable uebersprungen

**Test:**
- Build kompiliert ohne Fehler
- "Variables Angebot" waehlbar in Programmauswahl
- Vereinfachter Flow funktioniert (Lead -> Programm -> Leistung -> Zahlung -> Speichern)
- Normaler Flow fuer Performance/Rocket weiterhin funktional

---

## Step 30 -- Oeffentliche Seite: Variables Angebot mit Sofortzahlung

**Ziel:** Auf der oeffentlichen Seite sieht der Kunde bei variablen Angeboten: Leistungsbeschreibung, Zeitpunkt, Kosten, Mehrkosten-Hinweis und einen sofortigen "Jetzt bezahlen"-Button (ohne Annahme-Schritt).

**Aenderung: `src/pages/Offer.tsx`**
- Erkennung ob `offer_mode === 'variable'`
- Variables Layout: Kompakte Darstellung mit Kurztext-Feldern statt vollem OfferPreview
- Kein ContractAcceptance-Schritt (da Kurzauftrag)
- Sofortzahlung: "Jetzt bezahlen"-Button direkt sichtbar wenn `payment_unlocked`
- Fortschrittsleiste (Progress) anzeigen wenn `progress_percent` gesetzt

**Aenderung: `src/components/offers/OfferPreview.tsx`**
- Fallunterscheidung: Wenn `offer_mode === 'variable'`, zeige kompaktes Kurzformat:
  - Erwartete Leistung, Zeitpunkt, Kosten, Mehrkosten-Hinweis

**Test:**
- Build kompiliert ohne Fehler
- Variables Angebot zeigt kompaktes Layout auf oeffentlicher Seite
- Sofortzahlung-Button sichtbar wenn freigeschaltet
- Fortschrittsleiste rendert korrekt

---

## Step 31 -- Kundenportal: Fortschrittsleiste fuer variable Angebote

**Ziel:** Im Kundenportal (`/app/contracts`) sehen Kunden bei variablen Angeboten eine Fortschrittsleiste und veroeffentlichte Updates.

**Aenderung: `src/pages/app/MyContracts.tsx`**
- Fuer variable Angebote: Fortschrittsbalken (0-100%) anzeigen
- Liste der veroeffentlichten `progress_updates` (nur `published: true`)
- Status-Mapping: "In Bearbeitung" / "Abgeschlossen"

**Test:**
- Build kompiliert ohne Fehler
- Fortschrittsbalken und Updates korrekt angezeigt im Kundenportal
- Nur veroeffentlichte Updates sichtbar

---

## Step 32 -- Interne Dokumentation und Fortschritts-Management

**Ziel:** Mitarbeiter koennen im OfferDetail bei variablen Angeboten Fortschritts-Updates erfassen und per Knopfdruck veroeffentlichen.

**Neue Datei: `src/components/offers/ProgressTracker.tsx`**
- Fortschritts-Slider (0-100%)
- Update-Eingabefeld (Text + Datum)
- Liste aller Updates mit "Veroeffentlichen"-Toggle
- "Aktualisieren"-Button speichert in offer_json
- Props: `offer`, `onUpdate`

**Aenderung: `src/pages/app/OfferDetail.tsx`**
- Wenn `offer_mode === 'variable'`: ProgressTracker-Bereich anzeigen
- "Fortschritt aktualisieren"-Funktion nutzt `updateOffer` Mutation um offer_json zu aktualisieren

**Aenderung: `src/hooks/useOffers.ts`**
- `updateOffer` akzeptiert bereits `offer_json`-Updates (bereits implementiert)

**Test:**
- Build kompiliert ohne Fehler
- Fortschritt aktualisierbar im OfferDetail
- Veroeffentlichung per Toggle funktioniert
- Kunde sieht nur veroeffentlichte Updates

---

## Step 33 -- Barrel-Exporte und Build-Pruefung

**Aenderung: `src/components/offers/index.ts`**
- Neue Exporte: `ContractAcceptance`, `SignaturePad`, `ProgressTracker`

**Test:**
- TypeScript-Kompilierung: 0 Fehler
- Standard-Angebotsflow: Erstellen -> Pruefung -> Genehmigung -> Senden -> Kunde sieht -> Annehmen -> Zahlungslink oeffnet sich
- Variables Angebot: Erstellen -> Senden -> Kunde sieht Kurztext -> Sofort bezahlen
- Fortschrittsdokumentation: Mitarbeiter aktualisiert -> Veroeffentlicht -> Kunde sieht im Portal
- RLS-Policy validiert: Oeffentliche Annahme funktioniert ohne Auth

---

## Technische Details

- **ContractAcceptance** ist eine eigenstaendige Komponente die in Offer.tsx eingebettet wird
- **SignaturePad** nutzt reines HTML Canvas ohne externe Abhaengigkeiten
- **acceptOffer** nutzt die bestehende `public_token`-Logik und die RLS-Policy fuer oeffentliche Token
- **Variable Angebote** nutzen dieselbe `offers`-Tabelle, unterscheiden sich durch `offer_mode === 'variable'` und `variable_offer_data` in `offer_json`
- **ProgressTracker** speichert alles in `offer_json.variable_offer_data.progress_updates`, keine neue DB-Tabelle noetig
- **Mehrkosten-AGB** wird als zusaetzlicher Paragraph in die bestehenden AGBs eingefuegt
- **Sofortzahlung** bei variablen Angeboten: Kein Annahme-Schritt, Zahlungslink direkt sichtbar wenn `payment_unlocked`
- Jeder Step endet mit Build-Check und Funktionstest bevor der naechste beginnt

