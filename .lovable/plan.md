

# Angebote-Bereich fertigstellen

## Ist-Zustand (Was bereits existiert)

- **Typen & Helpers**: Vollstaendiges Type-System (`OfferContent`, `OfferLineItem`, Status-Labels, `formatCents`)
- **Hook** (`useOffers`): CRUD-Operationen (create, update, approve, send, unlockPayment, submitForReview)
- **Listenseite** (`/app/offers`): Filterbare Uebersicht mit Status-Tabs und Card-Grid
- **Approval Card**: Kompakte Karte mit Approve/Send-Aktionen
- **Preview-Komponente**: Angebots-Vorschau mit Line-Items, Rabatten, MwSt
- **Payment Unlock Button**: Toggle-Button fuer Zahlungsfreischaltung
- **Oeffentliche Seite** (`/offer/:token`): Kundenansicht mit Payment-Bereich
- **Status Badge**: Farbcodierte Status-Anzeige
- **Routing**: `/app/offers` und `/offer/:token` eingerichtet
- **RLS**: Vollstaendig konfiguriert (mitarbeiter/teamleiter/admin + public token)

## Was fehlt

### 1. Angebots-Detailseite (`/app/offers/:offerId`)
Die Route `/app/offers/:offerId` existiert nicht. Wenn man auf "Ansehen" klickt (`onView`), navigiert die Seite zu einer nicht existierenden Route.

**Neue Datei: `src/pages/app/OfferDetail.tsx`**
- Laedt ein einzelnes Angebot per ID
- Zeigt die `OfferPreview`-Komponente mit dem vollen Angebots-Inhalt
- Aktionsleiste oben: Status-Badge, Approve/Send/Payment-Unlock Buttons (je nach Rolle und Status)
- Notizen-Bereich
- Link zum zugehoerigen Lead
- Oeffentlichen Link kopieren (wenn status = sent/viewed)

### 2. Angebot erstellen (Dialog oder Seite)
`createOffer` existiert im Hook, wird aber nirgends aufgerufen. Der "Neues Angebot"-Button verlinkt aktuell nur auf `/app/leads`.

**Neue Datei: `src/components/offers/CreateOfferDialog.tsx`**
- Dialog mit Formular:
  - Lead-Auswahl (Select mit Suche)
  - Titel und optionaler Untertitel
  - Line-Items hinzufuegen/entfernen (Name, Beschreibung, Menge, Einzelpreis)
  - Rabatt (optional)
  - MwSt-Satz (Standard 19%)
  - Zahlungsbedingungen (Einmalzahlung / Abo / Raten)
  - Notizen
- Automatische Berechnung von Zwischen-/Gesamtsumme
- Speichert als Entwurf

### 3. Route registrieren
**Aenderung in `src/App.tsx`**: Neue Route `/app/offers/:offerId` hinzufuegen, geschuetzt mit `requireMinRole="mitarbeiter"`.

### 4. Offers-Listenseite verbessern
**Aenderung in `src/pages/app/Offers.tsx`**:
- "Neues Angebot"-Button oeffnet den CreateOfferDialog statt auf Leads zu verlinken
- State fuer Dialog-Steuerung

### 5. Barrel-Export aktualisieren
**Aenderung in `src/components/offers/index.ts`**: `CreateOfferDialog` exportieren.

## Umsetzungsreihenfolge

```text
Step 1 - OfferDetail.tsx Seite erstellen
Step 2 - Route in App.tsx registrieren
Step 3 - CreateOfferDialog.tsx erstellen
Step 4 - Offers.tsx: Dialog integrieren
Step 5 - Barrel-Export aktualisieren
Step 6 - Visueller Test + Build-Pruefung
```

## Technische Details

- **OfferDetail**: Nutzt `useOffers()`-Hook mit Filter, zeigt Offer ueber `OfferPreview` an. Aktionsleiste nutzt bestehende `PaymentUnlockButton`, `OfferStatusBadge` und Button-Logik aus `OfferApprovalCard`.
- **CreateOfferDialog**: Nutzt `react-hook-form` + `zod` fuer Validierung. Line-Items als dynamisches Feld-Array. `calculateOfferTotals` aus `types/offers` fuer Live-Berechnung.
- **Lead-Auswahl**: Laedt Leads via `supabase.from('crm_leads').select('id, first_name, last_name, company')` im Dialog.
- Keine neuen DB-Tabellen oder Migrationen noetig -- alles nutzt bestehende `offers`-Tabelle und Hooks.

