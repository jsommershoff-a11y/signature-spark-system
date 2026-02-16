
# Steps 35-36: Login-Button auf Landingpage + E-Mail-Benachrichtigung bei Angebotsversand

Vier Anforderungen wurden identifiziert. Zwei davon sind Implementierungsaufgaben, zwei sind Tests die nach der Implementierung durchgefuehrt werden.

---

## Step 35 -- Login-Button im Landing-Header

**Ziel:** Auf allen oeffentlichen Seiten (Landingpages, Branchen-Seiten) ist ein "Anmelden"-Button sichtbar, der zur `/auth`-Seite fuehrt. Gilt fuer Kunden, Admins und alle Rollen.

**Aenderung: `src/components/landing/Header.tsx`**

Desktop-Navigation (nach dem "Analysegespraech sichern"-Button, Zeile 75):
- Neuer Link-Button: "Anmelden" mit `variant="outline"` und `size="sm"`, verlinkt auf `/auth`
- Icon: `LogIn` von lucide-react

Mobile-Navigation (vor dem CTA-Button, Zeile 120):
- Neuer Link: "Anmelden" als Menuepunkt im Sheet
- Gleicher Stil wie "Qualifizierung"-Link

**Test:**
- Build kompiliert ohne Fehler
- Login-Button auf Desktop und Mobile sichtbar
- Klick fuehrt zur `/auth`-Seite

---

## Step 36 -- E-Mail-Benachrichtigung bei Angebotsversand

**Ziel:** Wenn ein Mitarbeiter auf "Senden" klickt, erhaelt der Kunde automatisch eine E-Mail mit dem oeffentlichen Angebotslink.

**Voraussetzung:** Ein E-Mail-Dienst (z.B. Resend) wird benoetigt. Aktuell ist kein E-Mail-Provider konfiguriert.

**Neue Datei: `supabase/functions/send-offer-email/index.ts`**
- Edge Function die eine E-Mail an den Lead sendet
- Erwartet: `offer_id` im Request Body
- Laedt Angebot + Lead-Daten aus der DB (mit Service Role Key)
- Generiert den oeffentlichen Link: `{SITE_URL}/offer/{public_token}`
- Sendet E-Mail via Resend API (oder alternativer Provider)
- Inhalt: Professionelle HTML-E-Mail mit Firmenbranding, Angebotslink und Ablaufdatum
- Authentifizierung: JWT-Validierung + `has_min_role('mitarbeiter')`

**Aenderung: `supabase/config.toml`**
- Neuer Eintrag: `[functions.send-offer-email]` mit `verify_jwt = false` (Validierung im Code)

**Aenderung: `src/hooks/useOffers.ts`**
- In `sendOfferMutation.mutationFn`: Nach erfolgreichem Status-Update auf `sent`, zusaetzlich die Edge Function `send-offer-email` aufrufen
- Fehler beim E-Mail-Versand soll den Sende-Vorgang nicht blockieren (Fire-and-Forget mit Warning-Toast)

**Benoetigtes Secret:** `RESEND_API_KEY` (muss vom Benutzer bereitgestellt werden)

**Test:**
- Build kompiliert ohne Fehler
- Edge Function deployed erfolgreich
- Beim Senden eines Angebots wird E-Mail ausgeloest
- E-Mail enthaelt korrekten oeffentlichen Link

---

## Zu den Test-Anforderungen

Die beiden Tests (ProgressTracker und Standard-Angebotsflow) werden nach der Implementierung der obigen Steps durchgefuehrt:

1. **ProgressTracker-Test:** Fortschritt auf 50% setzen, Update erstellen, veroeffentlichen, Kundenportal pruefen
2. **Standard-Angebot (Performance):** Erstellen mit Bausteinen und Bedarfsermittlung, kompletter Workflow bis Vertragsannahme

---

## Technische Details

- **Login-Button:** Nutzt bestehende `Button`-Komponente mit `variant="outline"` und `LogIn`-Icon. Keine neuen Abhaengigkeiten.
- **E-Mail Edge Function:** Verwendet Resend als Provider (einfachste Integration, guter Free-Tier). Alternative: SendGrid oder SMTP. Der Benutzer muss einen API-Key bereitstellen.
- **Fire-and-Forget-Pattern:** Der E-Mail-Versand laeuft asynchron nach dem DB-Update. Ein Fehler beim Versand verhindert nicht das Senden des Angebots. Der Benutzer erhaelt einen Warning-Toast bei E-Mail-Fehlern.
- **E-Mail-Template:** Einfaches HTML mit KRS-Branding, Angebotslink als Button, Ablaufdatum und Kontaktinformationen.
