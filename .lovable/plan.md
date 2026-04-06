

# Plan: SEO-Optimierung fuer Google Sitelinks

## Zusammenfassung

Google Sitelinks entstehen durch klare Seitenstruktur, eindeutige Titel pro Unterseite, JSON-LD `WebSite`- und `SiteNavigationElement`-Schema und saubere interne Verlinkung. Aktuell nutzt nur die Homepage `SEOHead` — alle Branchen-Seiten, Qualifizierung, Community, AGB und Widerruf haben keine eigenen Meta-Tags. Das muss behoben werden.

---

## Aenderungen

### Step 01 — JSON-LD WebSite + SiteNavigationElement auf Homepage

**Datei**: `src/pages/landing/MasterHome.tsx`

Zusaetzliches JSON-LD neben dem bestehenden Organization-Schema:

- **WebSite-Schema** mit `potentialAction: SearchAction` (signalisiert Google die Hauptseite)
- **SiteNavigationElement-Schema** mit allen oeffentlichen Hauptseiten (Handwerk, Praxen, Dienstleister, Immobilien, Kurzzeitvermietung, Qualifizierung, Community) — das ist der staerkste Hinweis fuer Google, welche Seiten als Sitelinks in Frage kommen

### Step 02 — SEOHead in alle oeffentlichen Seiten einbauen

Jede oeffentliche Seite braucht einen eigenen, eindeutigen Title + Description + Canonical. Ohne das kann Google keine Sitelinks bilden.

| Seite | Title | Canonical |
|-------|-------|-----------|
| Handwerk | Automatisierung fuer Handwerksbetriebe \| KRS Signature | /handwerk |
| Praxen | Automatisierung fuer Praxen \| KRS Signature | /praxen |
| Dienstleister | Automatisierung fuer Dienstleister \| KRS Signature | /dienstleister |
| Immobilien | Automatisierung fuer Immobilienunternehmen \| KRS Signature | /immobilien |
| Kurzzeitvermietung | Automatisierung fuer Kurzzeitvermietung \| KRS Signature | /kurzzeitvermietung |
| Qualifizierung | Kostenlose Potenzial-Analyse \| KRS Signature | /qualifizierung |
| Community | KI-Community fuer Unternehmer \| KRS Signature | /community |
| AGB | Allgemeine Geschaeftsbedingungen \| KRS Signature | /agb |
| Widerruf | Widerrufsbelehrung \| KRS Signature | /widerruf |

**Dateien**: `Handwerk.tsx`, `Praxen.tsx`, `Dienstleister.tsx`, `Immobilien.tsx`, `Kurzzeitvermietung.tsx`, `Qualifizierung.tsx`, `Community.tsx`, `AGB.tsx`, `Widerruf.tsx`

### Step 03 — index.html bereinigen

**Datei**: `index.html`

- TODO-Kommentare entfernen
- `twitter:site` von `@Lovable` auf `@KRSSignature` oder entfernen
- Leere Zeilen im `<head>` bereinigen
- `og:url` auf `https://krs-signature.de` setzen

### Step 04 — SEOHead-Komponente erweitern: JSON-LD Array-Support

**Datei**: `src/components/landing/SEOHead.tsx`

- `jsonLd` Property so aendern, dass ein Array von Schema-Objekten sauber als einzelne `<script>` Tags oder als Array gerendert wird (aktuell ist die Array-Logik vorhanden aber redundant)

---

## Dateien

| Aktion | Datei |
|--------|-------|
| Aendern | `src/pages/landing/MasterHome.tsx` — WebSite + SiteNavigationElement JSON-LD |
| Aendern | `src/pages/landing/Handwerk.tsx` — SEOHead hinzufuegen |
| Aendern | `src/pages/landing/Praxen.tsx` — SEOHead hinzufuegen |
| Aendern | `src/pages/landing/Dienstleister.tsx` — SEOHead hinzufuegen |
| Aendern | `src/pages/landing/Immobilien.tsx` — SEOHead hinzufuegen |
| Aendern | `src/pages/landing/Kurzzeitvermietung.tsx` — SEOHead hinzufuegen |
| Aendern | `src/pages/landing/Qualifizierung.tsx` — SEOHead hinzufuegen |
| Aendern | `src/pages/landing/Community.tsx` — SEOHead hinzufuegen |
| Aendern | `src/pages/landing/AGB.tsx` — SEOHead hinzufuegen |
| Aendern | `src/pages/landing/Widerruf.tsx` — SEOHead hinzufuegen |
| Aendern | `index.html` — Bereinigung |
| Aendern | `src/components/landing/SEOHead.tsx` — Array-Rendering |

