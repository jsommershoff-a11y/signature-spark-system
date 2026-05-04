# Admin Dashboard UI Guidelines

Diese Richtlinie definiert die Struktur, das Layout und die Komponenten für das Admin-Dashboard der KI-Automatisierungsplattform (`dein-automatisierungsberater.de`), basierend auf der Analyse des `signature-spark-system` Repositories.

## 1. Layout-Struktur (AdminLayout)

Das Admin-Dashboard nutzt ein konsistentes Zwei-Spalten-Layout auf Desktop-Geräten und eine horizontal scrollbare Navigation auf Mobile.

*   **Desktop:** Linke Sub-Navigation (224px, fixed) und rechter Main-Content (max-width: 1280px).
*   **Mobile:** Horizontale Scroll-Leiste unter dem Main-Header.
*   **Background:** Der Main-Content nutzt den `app-scope` Background (`--background: 30 25% 98%` / Cream).
*   **Header:** Jede Seite beginnt mit der `<PageHeader />` Komponente (Eyebrow "Verwaltung", Titel, Description).

## 2. Farbpalette & Tokens

Die UI basiert auf den KRS Signature Brand-Farben:

*   **Primary (Orange):** `--primary: 20 96% 48%` (#F56A00) – Genutzt für aktive States, CTAs und wichtige KPIs.
*   **Accent (Tannengrün):** `--accent: 160 61% 15%` (#0F3E2E) – Genutzt für sekundäre Hervorhebungen und Hover-States.
*   **Success (Grün):** `--success: 160 55% 22%` – Genutzt für "OK"-Status, verbundene Integrationen und positive KPIs.
*   **Warning (Gelb/Orange):** `--warning: 20 96% 48%` – Genutzt für auslaufende Trials oder Warnungen.
*   **Destructive (Rot):** `--destructive: 0 84% 60%` – Genutzt für Fehler (z.B. Webhook-Fails) und kritische Aktionen.

## 3. Kernkomponenten

### 3.1. Admin-Navigation (`adminNav`)
Die linke Sidebar enthält folgende Kernbereiche mit entsprechenden Icons (Lucide React):
1.  Übersicht (`LayoutDashboard`)
2.  Nutzer (`Users`)
3.  Leads (`UserPlus`)
4.  Kunden (`Building2`)
5.  Abos (`CreditCard`)
6.  Trials (`Clock`)
7.  Upgrade-Funnel (`TrendingUp`)
8.  Audit-Log (`ScrollText`)
9.  Inbound E-Mail (`Inbox`)
10. Support-Tickets (`LifeBuoy`)
11. Einstellungen (`SettingsIcon`)

*Aktiver State:* `bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]`

### 3.2. KPI-Tiles (`AdminKpiTiles.tsx`)
Die KPI-Karten nutzen das `<Tile />` Pattern:
*   **Container:** White Card, rounded-16, `surface-card-hover` Effekt.
*   **Icon-Box:** 40x40px, abgerundet, Hintergrundfarbe basierend auf Accent (`primary/10`, `success/10`, etc.).
*   **Werte:** 24px bis 32px Font-Size, bold, tracking-tight.
*   **Hint:** Kleiner Text unter dem Wert (z.B. "+12% vs. Vormonat").

### 3.3. Datentabellen
Alle Listen (Nutzer, Leads, Abos) nutzen die standardisierte Shadcn-UI `<Table />`:
*   **Filter-Row:** Oben liegende Row mit Search-Input und Dropdowns (z.B. nach Rolle, Status).
*   **Badges:** Status und Rollen werden als `<Badge />` visualisiert (z.B. `Member Pro` in Orange, `Admin` in Dark).
*   **Aktionen:** Dropdowns oder Icon-Buttons am rechten Rand (Edit, View).

### 3.4. Einstellungs-Tabs (`AdminSettings.tsx`)
Komplexe Seiten wie die Einstellungen nutzen horizontale Tabs (`<TabsList />`):
*   **Design:** `bg-muted/60` Container, abgerundete Trigger-Buttons (`rounded-xl`).
*   **Inhalte:** Integrationen (Grid aus Cards mit Status-Dot), Webhooks, E-Mail-Templates.

## 4. Spezifische Seiten-Vorgaben

### 4.1. Übersicht (`AdminOverview.tsx`)
*   Oberer Bereich: 5 KPI-Tiles (Nutzer, Leads, Kunden, MRR, Health).
*   Mittlerer Bereich: 2x3 Grid aus Section-Cards (Einstiegspunkte in die Unterseiten).
*   Unterer Bereich: Quick-Links zu Logs und Webhooks.

### 4.2. Abos & Trials (`AdminSubscriptions.tsx` / `AdminTrials.tsx`)
*   **Tabelle:** Stripe-Abo-Daten (Produkt, Betrag, Intervall, Periode).
*   **Funnel:** Visuelle Darstellung des Upgrade-Funnels (Gesehen -> Geklickt -> Checkout -> Konvertiert) mit Prozentbalken.

### 4.3. Einstellungen (`AdminSettings.tsx`)
*   **Integrationen-Grid:** Karten für n8n, Make, HubSpot, Stripe, Sipgate, Zoom, etc. mit Status-Indikator (Grün = Verbunden, Grau = Nicht verbunden, Gelb = Konfigurieren).

## 5. Implementierungs-Hinweise
*   Alle Komponenten müssen responsive sein (`flex-col` auf Mobile, `flex-row` ab `md` oder `lg`).
*   Icons stammen einheitlich aus `lucide-react`.
*   Daten werden primär über Supabase geladen, Status-Updates nutzen `sonner` Toasts.
