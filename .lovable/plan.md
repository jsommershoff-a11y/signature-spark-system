

# KRS Signature – Landingpage-Projekt

## Überblick

Drei neue Seiten im Baulig-Stil für dein Signature System:
- **Homepage (/)**: Elegante Weiche zwischen Start und Growth
- **Start-Page (/start)**: Für Gründer, die strukturiert starten wollen
- **Growth-Page (/growth)**: Für Unternehmer mit Wachstumsschmerz

---

## Design-Konzept

### Farbschema
- **Primär**: Tiefblau (#1e40af bis #1e3a8a) – vertrauenswürdig, B2B-professionell
- **Akzent**: Helles Blau für CTAs und Highlights
- **Hintergrund**: Weiß mit subtilen blauen Abstufungen
- **Text**: Dunkelblau bis Schwarz für optimale Lesbarkeit

### Stil-Elemente
- Große, impactvolle Headlines (ähnlich Baulig)
- Viel Weißraum für klare Struktur
- Subtile Schatten und Cards für Tiefe
- CTA-Buttons in auffälligem Kontrastblau
- Icons für visuelle Unterstützung der Module/Bereiche

---

## Seite 1: Homepage (/)

### Inhalt
- **Headline**: "Signature System – Die Plattform + persönliches Sparring für echte Unternehmer"
- **Zwei Karten als Auswahloptionen**:
  1. **"Ich gründe gerade"** → Link zu /start
  2. **"Ich wachse und stoße an Grenzen"** → Link zu /growth
- Logo-Platzhalter im Header
- Kurze Value Proposition

---

## Seite 2: Start-Landingpage (/start)

### Aufbau (Top to Bottom)
1. **Hero-Section**
   - Headline + Subline wie vorgegeben
   - CTA-Button "Kostenloses Klarheitsgespräch sichern"
   - Visueller Anker (Illustration oder Gradient)

2. **Problem-Section**
   - Die 4 Gründer-Probleme als visuelle Liste
   - Emotionale Ansprache

3. **System-Section (5 Module)**
   - Nummerierte Karten oder Timeline-Darstellung
   - Icons für jedes Modul

4. **Plattform-Proof**
   - Überschrift "Ein Blick ins Signature System"
   - 4 Checkpoints als Features
   - **Screenshot-Platzhalter** für Mitgliederbereich

5. **Persönliche Begleitung**
   - 3 Bullet-Points
   - CTA wiederholen

6. **FAQ-Accordion**
   - 3 Fragen mit aufklappbaren Antworten

7. **Finaler CTA**
   - Nochmals starker Call-to-Action

---

## Seite 3: Growth-Landingpage (/growth)

### Aufbau (Top to Bottom)
1. **Hero-Section**
   - Headline + Subline für Wachstumsschmerz
   - CTA-Button "Strategiegespräch sichern"

2. **Problem-Section**
   - 4 Wachstums-Engpässe visuell dargestellt

3. **System-Section (6 Bereiche)**
   - 6 Karten/Grid mit den Skalierungs-Bereichen
   - Icons für jeden Bereich

4. **Plattform-Proof**
   - "Von Chaos zu Organisation"
   - 4 Features mit Checkmarks
   - **Screenshot-Platzhalter**

5. **Persönliches Sparring**
   - 3 Begleitungs-Punkte
   - CTA wiederholen

6. **Outcome-Section**
   - 4 erwartbare Ergebnisse als Cards oder Liste

7. **FAQ-Accordion**
   - 3 Fragen

8. **Finaler CTA**

---

## Kontaktformular (Lead-Erfassung)

### Formular-Felder
- Name
- E-Mail
- Telefon (optional)
- Nachricht/Anliegen (optional)
- Quelle (automatisch: "start" oder "growth")

### Technische Umsetzung
- Modal oder eigene Seite bei CTA-Klick
- Validierung mit Zod
- Speicherung in Supabase-Tabelle `leads`
- Erfolgs-Bestätigung nach Absenden

---

## Technische Umsetzung

### Neue Dateien
- `src/pages/Home.tsx` – Weiche
- `src/pages/Start.tsx` – Start-Landingpage
- `src/pages/Growth.tsx` – Growth-Landingpage
- `src/components/landing/` – Wiederverwendbare Sektionen
  - `Hero.tsx`
  - `ProblemSection.tsx`
  - `SystemSection.tsx`
  - `PlatformProof.tsx`
  - `PersonalSupport.tsx`
  - `FAQSection.tsx`
  - `CTAButton.tsx`
  - `ContactModal.tsx`

### Supabase-Tabelle
- Neue Tabelle `leads` mit RLS-Policies
- Felder: id, name, email, phone, message, source, created_at

### Routing
- `/` → Home (Weiche)
- `/start` → Start-Landingpage
- `/growth` → Growth-Landingpage

---

## Platzhalter für später
- Logo-Upload-Bereich
- Screenshot-Platzhalter für Mitgliederbereich
- Social Proof / Testimonials Section (vorbereitet)
- Case Studies (vorbereitet)

