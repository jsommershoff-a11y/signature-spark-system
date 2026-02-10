

# Steps 19-24: Umsetzungsplan (mit Test nach jedem Schritt)

Fortsetzung der bestehenden Nummerierung. Jeder Step wird einzeln implementiert und getestet bevor der naechste beginnt.

---

## Step 19 -- Pain-Point-Visualisierung (Ist/Soll-Radar fuer Kunden)

**Ziel:** Dem Kunden visuell zeigen, wo es hakt und wie die Loesung aussieht.

**Neue Datei: `src/components/offers/PainPointRadar.tsx`**
- Recharts RadarChart mit 6 Achsen (Vertrieb, Closing, Prozesse, Fuehrung, Sichtbarkeit, Kundenbindung)
- Rote Flaeche = Ist-Zustand (niedrige Werte fuer ausgewaehlte Pain-Points)
- Gruene Flaeche = Soll-Zustand nach Umsetzung (alle hoch)
- Unterhalb: Karten-Grid "Ihre Herausforderungen" (rot) vs. "Unsere Loesung" (gruen) mit Mapping Pain-Point -> Baustein
- Props: `discoveryData`, `selectedModules`, `offerMode`

**Mapping-Konstante in `src/lib/offer-modules.ts`:**
- `PAIN_POINT_MODULE_MAP`: z.B. `vertrieb` -> `vertriebsstruktur`, `prozesse` -> `crm_setup` + `followup`

**Aenderung: `src/components/offers/OfferPreview.tsx`**
- Neuer Abschnitt "Ihre aktuelle Situation" mit PainPointRadar (nur wenn `discovery_data` vorhanden)

**Aenderung: `src/pages/Offer.tsx`**
- PainPointRadar auch auf der oeffentlichen Angebotsseite anzeigen

**Aenderung: `src/components/offers/index.ts`**
- Export von `PainPointRadar`

**Test:**
- Build kompiliert ohne Fehler
- OfferPreview zeigt Radar wenn discovery_data vorhanden
- Radar-Chart rendert korrekt mit Beispieldaten

---

## Step 20 -- Demo-Bereich fuer Kunden (Kursbereich)

**Ziel:** Kunden ohne aktive Membership sehen einen eingeschraenkten Demo-Zugang statt Sperrseite.

**Aenderung: `src/hooks/useMember.ts`**
- Neues Return-Feld `isDemoUser`: `true` wenn User eingeloggt, aber kein Member-Record oder keine aktive Membership

**Aenderung: `src/pages/app/Courses.tsx`**
- Wenn `!member` aber User eingeloggt: Demo-Modus
  - CTA-Banner oben: "Jetzt freischalten" -> `/app/contracts`
  - Kurse laden (published), erste 2 Lektionen mit "Demo"-Badge
  - Restliche Lektionen mit Lock-Icon + "Nach Freischaltung verfuegbar"

**Test:**
- Build kompiliert ohne Fehler
- Nicht-Member sieht Demo-Modus statt Sperrseite
- Lock-Icons und Demo-Badges korrekt angezeigt

---

## Step 21 -- Freischaltungslogik nach Zahlung (Webhook)

**Ziel:** Nach erfolgreicher Zahlung: Offer-Status auf `paid`, Member + Membership aktivieren.

**Aenderung: `supabase/functions/webhook-payment/index.ts`**
- Nach Zeile 269 (Offer-Update):
  1. Status auf `paid` setzen (statt `viewed`)
  2. Offer-JSON lesen um `offer_mode` zu ermitteln
  3. Lead-Email nachschlagen, User-Account finden
  4. Member-Record erstellen/aktivieren
  5. Membership erstellen: `rocket_performance` -> `premium`, `performance` -> `growth`

**Test:**
- Edge Function deployed ohne Fehler
- TypeScript-Kompilierung sauber
- Webhook-Logik validiert (offer_mode Mapping korrekt)

---

## Step 22 -- Auth-Routing und Kunden-Dashboard

**Ziel:** Kunden werden nach Login zu Vertraegen geleitet, Dashboard zeigt Quick-Links.

**Aenderung: `src/pages/Auth.tsx`**
- Nach Login: Rolle pruefen, wenn `kunde` -> `/app/contracts` statt `/app`

**Aenderung: `src/pages/app/Dashboard.tsx`**
- `renderKundeDashboard()` erweitern:
  - Quick-Link-Karten: "Meine Vertraege" (`/app/contracts`) und "Kurse" (`/app/courses`)
  - Demo-Hinweis wenn kein aktives Membership

**Test:**
- Build kompiliert ohne Fehler
- Kunden-Dashboard zeigt Quick-Links
- Auth-Routing funktioniert (Kunde -> /app/contracts)

---

## Step 23 -- CreateOfferDialog Gesamtueberarbeitung (Wizard)

**Ziel:** 5-Schritt-Wizard mit Bedarfsermittlung, Programmauswahl, Bausteinen, Zahlung und Zusammenfassung.

**Aenderung: `src/components/offers/CreateOfferDialog.tsx`**
- Kompletter Umbau als Wizard mit 5 Tabs/Steps:
  1. **Bedarfsermittlung**: PainPointDiscovery eingebettet (ueberspringbar)
  2. **Programmauswahl**: ProgramThumbnails + Laufzeit + Mindestpreis-Hinweis
  3. **Bausteine und Positionen**: Modul-Checkboxen (Pflicht gesperrt, Abhaengigkeiten validiert) + Line-Items mit Euro-Eingabe
  4. **Zahlung**: Einmalzahlung/3 Raten/6 Raten + Zahlungsanbieter (Stripe/CopeCart)
  5. **Zusammenfassung**: OfferPreview mit PainPointRadar, Mindestpreis-Validierung, Speichern
- Preis-Eingabe in Euro (interne Umrechnung in Cent)
- Mindestpreis-Validierung vor Speichern (3.000 EUR / 7.000 EUR)
- Discovery-Daten und selected_modules in offer_json speichern

**Test:**
- Build kompiliert ohne Fehler
- Wizard-Navigation funktioniert (vor/zurueck)
- Pflichtbausteine korrekt gesperrt
- Mindestpreis-Validierung blockiert bei zu niedrigem Preis
- Angebot wird korrekt in DB gespeichert

---

## Step 24 -- Barrel-Exporte und Build-Pruefung

**Aenderung: `src/components/offers/index.ts`**
- Alle neuen Exporte pruefen und ergaenzen

**Test:**
- TypeScript-Kompilierung: 0 Fehler
- Alle neuen Komponenten importierbar
- Angebotserstellung End-to-End: Discovery -> Programm -> Bausteine -> Zahlung -> Speichern
- OfferPreview mit Radar-Chart
- Kunden-Dashboard Quick-Links
- Demo-Kursbereich
- Webhook payment_unlocked Logik

---

## Technische Details

- **PainPointRadar** nutzt Recharts (bereits installiert) -- RadarChart, PolarGrid, PolarAngleAxis
- **Demo-Modus** ist rein Frontend-Logik, keine DB-Aenderungen noetig
- **Webhook-Update** nutzt bestehenden Service-Role-Key fuer Member/Membership-Erstellung
- **Wizard** ersetzt den bestehenden CreateOfferDialog komplett, behaelt aber die bestehende Lead-Auswahl und Notizen-Logik
- **Mindestpreise** werden client-seitig validiert (UX) und im Webhook nochmal geprueft
- **Pain-Point Mapping** als Konstante in offer-modules.ts, erweiterbar
- Jeder Step endet mit Build-Check und Funktionstest bevor der naechste beginnt

