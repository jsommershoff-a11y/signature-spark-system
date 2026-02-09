

# Step 01 – Neue Landing-Seitenstruktur & Routing

## Ziel

Branchenspezifische Public-Landingpages hinzufügen und die bestehenden Seiten (`Home.tsx`, `Start.tsx`, `Growth.tsx`) durch die neue Struktur ersetzen. Alle wichtigen Komponenten und Sections werden übertragen.

---

## Zu übertragende Elemente (aus bestehenden Seiten)

| Komponente | Verwendung | Status |
|------------|------------|--------|
| `Hero` | Headline + Subline + CTA | ✅ Wird weiterverwendet |
| `ProblemSection` | Schmerzpunkte der Zielgruppe | ✅ Wird weiterverwendet |
| `SystemSection` | Module/Bereiche des Systems | ✅ Wird weiterverwendet |
| `PlatformProof` | Features + Screenshot | ✅ Wird weiterverwendet |
| `PersonalSupport` | Sparring + Portrait | ✅ Wird weiterverwendet |
| `OutcomeSection` | Ergebnisse (nur Growth) | ✅ Wird weiterverwendet |
| `FAQSection` | Häufige Fragen | ✅ Wird weiterverwendet |
| `FinalCTA` | Abschluss-CTA | ✅ Wird weiterverwendet |
| `ContactModal` | Lead-Formular | ✅ Erweitert mit neuen Sources |
| `Header` | Navigation | ✅ Angepasst für Branchen |
| `Footer` | Footer-Links | ✅ Angepasst für neue Struktur |

---

## Neue Dateistruktur

```text
src/pages/landing/
├── MasterHome.tsx        → / (Branchenauswahl)
├── Handwerk.tsx          → /handwerk
├── Praxen.tsx            → /praxen
├── Dienstleister.tsx     → /dienstleister
├── Immobilien.tsx        → /immobilien
├── Kurzzeitvermietung.tsx → /kurzzeitvermietung
├── Qualifizierung.tsx    → /qualifizierung
└── Thanks.tsx            → /danke
```

---

## Implementierungsschritte

### Step 01.1: Neue Landing-Seiten erstellen

**MasterHome.tsx** (ersetzt Home.tsx):
- Branchenauswahl-Karten statt Start/Growth-Weiche
- 5 Branchen-Links mit Icons
- CTA zu `/qualifizierung`

**Branchenseiten** (Handwerk, Praxen, etc.):
- Volle Seitenstruktur wie Start.tsx:
  - Hero (branchenspezifisch)
  - ProblemSection (branchenspezifisch)
  - SystemSection (angepasste Module)
  - PlatformProof
  - PersonalSupport
  - FAQSection (branchenspezifisch)
  - FinalCTA
- ContactModal mit branch-spezifischem `source`

**Qualifizierung.tsx**:
- Direkte Formular-Seite (CTA-Endpunkt)
- Integriertes ContactModal oder Inline-Formular

**Thanks.tsx**:
- Bestätigungsseite nach Formular-Submit
- Redirect-Option zurück zur Startseite

### Step 01.2: ContactModal erweitern

Neue Source-Typen für Lead-Tracking:

```typescript
type LeadSource = 
  | "start" 
  | "growth" 
  | "handwerk" 
  | "praxen" 
  | "dienstleister" 
  | "immobilien" 
  | "kurzzeitvermietung" 
  | "qualifizierung";
```

### Step 01.3: Header anpassen

Neue Navigation:
- Logo → `/`
- Branchen-Dropdown (Handwerk, Praxen, Dienstleister, Immobilien, Kurzzeitvermietung)
- CTA-Button → `/qualifizierung`

### Step 01.4: Footer anpassen

Neue Links:
- Branchen-Links statt Start/Growth
- Impressum/Datenschutz (Platzhalter)

### Step 01.5: App.tsx Router erweitern

```tsx
// Neue Imports
import MasterHome from "./pages/landing/MasterHome";
import Handwerk from "./pages/landing/Handwerk";
import Praxen from "./pages/landing/Praxen";
import Dienstleister from "./pages/landing/Dienstleister";
import Immobilien from "./pages/landing/Immobilien";
import Kurzzeitvermietung from "./pages/landing/Kurzzeitvermietung";
import Qualifizierung from "./pages/landing/Qualifizierung";
import Thanks from "./pages/landing/Thanks";

<Routes>
  {/* Neue Public Landing Routes */}
  <Route path="/" element={<MasterHome />} />
  <Route path="/handwerk" element={<Handwerk />} />
  <Route path="/praxen" element={<Praxen />} />
  <Route path="/dienstleister" element={<Dienstleister />} />
  <Route path="/immobilien" element={<Immobilien />} />
  <Route path="/kurzzeitvermietung" element={<Kurzzeitvermietung />} />
  <Route path="/qualifizierung" element={<Qualifizierung />} />
  <Route path="/danke" element={<Thanks />} />
  
  {/* Auth - UNVERÄNDERT */}
  <Route path="/auth" element={<Auth />} />
  
  {/* Protected /app/* Block - UNVERÄNDERT */}
  <Route path="/app" element={...}>
    {/* alle bestehenden nested routes */}
  </Route>
  
  {/* Public Offer - UNVERÄNDERT */}
  <Route path="/offer/:token" element={<PublicOffer />} />
  
  {/* Catch-all */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Step 01.6: Alte Seiten löschen

Nach erfolgreicher Implementierung:
- `src/pages/Home.tsx` → Löschen
- `src/pages/Start.tsx` → Löschen  
- `src/pages/Growth.tsx` → Löschen

---

## Branchenspezifische Inhalte (Beispiele)

### Handwerk

| Section | Inhalt |
|---------|--------|
| Hero | "Für Handwerksbetriebe: Mehr Aufträge, weniger Chaos im Büro." |
| Problems | Termine, Angebote, Nachkalkulation, Mitarbeiterführung |
| Modules | Auftragsmanagement, Preiskalkulation, Mitarbeiterführung, Kundengewinnung |

### Praxen

| Section | Inhalt |
|---------|--------|
| Hero | "Für Praxen: Mehr Zeit für Patienten, weniger Verwaltungschaos." |
| Problems | Terminausfälle, Personal, Abrechnung, Work-Life-Balance |
| Modules | Praxisorganisation, Patientengewinnung, Team, Prozesse |

### Immobilien

| Section | Inhalt |
|---------|--------|
| Hero | "Für Immobilienprofis: Mehr Abschlüsse, bessere Prozesse." |
| Problems | Lead-Qualität, Follow-up, Objektakquise, Skalierung |
| Modules | Lead-Pipeline, Akquise-System, Kundenbetreuung, Team |

---

## Dateiübersicht

| Datei | Aktion |
|-------|--------|
| `src/pages/landing/MasterHome.tsx` | NEU erstellen |
| `src/pages/landing/Handwerk.tsx` | NEU erstellen |
| `src/pages/landing/Praxen.tsx` | NEU erstellen |
| `src/pages/landing/Dienstleister.tsx` | NEU erstellen |
| `src/pages/landing/Immobilien.tsx` | NEU erstellen |
| `src/pages/landing/Kurzzeitvermietung.tsx` | NEU erstellen |
| `src/pages/landing/Qualifizierung.tsx` | NEU erstellen |
| `src/pages/landing/Thanks.tsx` | NEU erstellen |
| `src/App.tsx` | Routes aktualisieren |
| `src/components/landing/ContactModal.tsx` | Source-Typen erweitern |
| `src/components/landing/Header.tsx` | Navigation anpassen |
| `src/components/landing/Footer.tsx` | Links anpassen |
| `src/pages/Home.tsx` | LÖSCHEN |
| `src/pages/Start.tsx` | LÖSCHEN |
| `src/pages/Growth.tsx` | LÖSCHEN |

---

## Unverändert bleiben

| Bereich | Status |
|---------|--------|
| `/app/*` Routing | ✅ Keine Änderung |
| `ProtectedRoute` Logik | ✅ Keine Änderung |
| `AppLayout` | ✅ Keine Änderung |
| Rollen-System (RBAC) | ✅ Keine Änderung |
| `/auth` Login-Flow | ✅ Keine Änderung |
| `/offer/:token` | ✅ Keine Änderung |

---

## Quick-Tests nach Implementierung

| Test | Erwartetes Ergebnis |
|------|---------------------|
| `/` aufrufen | Branchenauswahl-Seite |
| `/handwerk` aufrufen | Handwerk Landing Page |
| `/qualifizierung` aufrufen | Formular-Seite |
| `/danke` aufrufen | Danke-Seite |
| `/start` aufrufen | 404 (gelöscht) |
| `/app` (ausgeloggt) | Redirect zu `/auth` |
| `/app` (eingeloggt) | Dashboard |

