

# Plan: Maximale SEO-Erreichbarkeit + Conversion-Optimierung der Startseite

## Zusammenfassung

Die Seite hat aktuell **keine SEO-Infrastruktur** (kein react-helmet-async, keine sitemap.xml, kein JSON-LD, `lang="en"` statt `"de"`, robots.txt blockt `/app/` nicht, keine dynamischen Meta-Tags). Ausserdem fehlen Conversion-Elemente wie ein schwebendes CTA-Widget und Urgency-Trigger. Der Content auf der Homepage muss die Kernbotschaften schaerfen: "Automatisierung = Ueberleben", "Dein Steuerberater kann dich in 3 Wochen ausschalten", "Wenn du die KI-Chance nutzen willst, musst du sicherstellen, dass du alles weisst."

---

## Phase 1: SEO-Infrastruktur

### 1.1 index.html bereinigen
- `lang="en"` auf `lang="de"` aendern
- `meta author` von "Lovable" auf "KRS Signature" aendern
- Bessere Title/Description mit Keywords: "Automatisierung fuer Unternehmen", "KI-Systeme", "Prozesse digitalisieren"
- `og:url` hinzufuegen

### 1.2 react-helmet-async installieren + SEO-Komponente
- Dependency `react-helmet-async` hinzufuegen
- `HelmetProvider` in `main.tsx` wrappen
- Wiederverwendbare `<SEOHead>` Komponente erstellen
- Pro oeffentliche Seite individuelle Meta-Tags (Title, Description, canonical, og:*)

### 1.3 Sitemap + robots.txt
- `public/sitemap.xml` erstellen mit allen oeffentlichen Routen (/, /handwerk, /praxen, /dienstleister, /immobilien, /kurzzeitvermietung, /qualifizierung, /community, /agb, /widerruf)
- `robots.txt` anpassen: `/app/` und `/auth` per Disallow blocken, Sitemap-URL referenzieren

### 1.4 JSON-LD Structured Data
- FAQ-Schema auf MasterHome (bereits FAQ-Daten vorhanden)
- Organization-Schema mit KRS Signature Infos
- LocalBusiness oder ProfessionalService Schema

---

## Phase 2: Conversion-Optimierung

### 2.1 Schwebendes CTA-Widget (FloatingCTA)
- Festes Widget unten rechts auf allen Landing-Seiten
- Gruender-Bild + "Potenzial-Analyse sichern" Button
- Erscheint nach 3 Sekunden Scroll, verschwindet im Footer-Bereich

### 2.2 Urgency-Messaging in HeroSection + Sections verschaerfen
- **Hero**: Neue Sub-Headline integrieren: "Dein Steuerberater kann dich in 3 Wochen ausschalten — wenn du deine Prozesse nicht im Griff hast."
- **EmotionalHookSection**: Neuen Punkt hinzufuegen: "Dein Steuerberater, dein Mitarbeiter, dein Kunde — alle wissen mehr ueber dein Unternehmen als du, weil nichts dokumentiert ist."
- **AiRealitySection**: Kernaussage verstaerken: "Wenn du die KI-Chance nutzen willst, musst du zuerst sicherstellen, dass du alles ueber dein eigenes Unternehmen weisst. Automatisierungen beginnen mit deinen eigenen Informationen in deinem eigenen System."

### 2.3 Sticky CTA-Banner (unterhalb Header)
- Dünner Banner unter dem Header: "Jetzt kostenlose Potenzial-Analyse sichern" mit Button
- Erscheint nach Scroll ueber die Hero-Section hinaus

---

## Phase 3: Content-Schaerfung fuer SEO-Keywords

### 3.1 Keyword-optimierte Headings
Aktuelle Headings sind gut, aber muessen staerker auf Suchbegriffe ausgerichtet werden:
- H1: "Automatisierung fuer Unternehmen" (Hauptkeyword)
- H2s anreichern mit: "Prozesse automatisieren", "KI fuer Mittelstand", "Unternehmensautomatisierung"
- Alt-Texte aller Bilder pruefen und mit Keywords anreichern

### 3.2 Neue Conversion-Section: "Steuerberater-Warnung"
Neue Section zwischen CompetitionSection und OfferSection:
- Headline: "Dein Steuerberater kann dich in 3 Wochen ausschalten."
- Inhalt: Wer seine Prozesse, Zahlen und Ablaeufe nicht systematisiert hat, ist verwundbar. Ein Steuerberater-Wechsel, ein Mitarbeiter-Ausfall oder ein Systemfehler reichen aus.
- CTA: "Sicher dir ab, was du aufgebaut hast."

---

## Technischer Ueberblick

**Dateien die erstellt werden:**
1. `src/components/landing/SEOHead.tsx` — Wiederverwendbare SEO-Komponente
2. `src/components/landing/conversion/FloatingCTA.tsx` — Schwebendes CTA-Widget
3. `src/components/landing/conversion/StickyCtaBanner.tsx` — Sticky Banner
4. `src/components/landing/home/VulnerabilitySection.tsx` — "Steuerberater"-Section
5. `public/sitemap.xml` — Sitemap

**Dateien die geaendert werden:**
1. `index.html` — lang, meta, author
2. `src/main.tsx` — HelmetProvider
3. `public/robots.txt` — Disallow /app/, Sitemap ref
4. `src/pages/landing/MasterHome.tsx` — SEOHead + neue Sections + FloatingCTA
5. `src/components/landing/home/HeroSection.tsx` — Urgency-Messaging
6. `src/components/landing/home/EmotionalHookSection.tsx` — Neuer Pain-Point
7. `src/components/landing/home/AiRealitySection.tsx` — KI-Chance Messaging
8. `src/components/landing/FAQSection.tsx` — JSON-LD Schema einbauen
9. `src/components/landing/PublicLayout.tsx` — FloatingCTA integrieren
10. Alle Branchen-Landingpages — individuelle SEOHead Tags

