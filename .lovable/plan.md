

# Plan: Trust-Logos verbessern + weitere Tools hinzufuegen

## Problem
Die lokalen PNG-Assets sind schlecht erkennbar (wahrscheinlich zu klein/niedrige Qualitaet). Die Grayscale-Darstellung reduziert die Sichtbarkeit zusaetzlich.

## Loesung

### 1. Weg von lokalen Assets, hin zu hochwertigen SVG/CDN-Logos
Statt der generierten PNGs werden offizielle, hochaufloesende Logos als inline-SVGs oder von bekannten CDNs (z.B. simpleicons.org SVGs) verwendet. Das garantiert scharfe Darstellung in jeder Groesse.

### 2. Visuelle Verbesserungen
- Logos groesser: `h-10` → `h-12 md:h-14`
- Grayscale entfernen, stattdessen reduzierte Opacity (`opacity-50 hover:opacity-100`)
- Weisser Hintergrund-Container pro Logo fuer besseren Kontrast (`bg-white/80 rounded-xl p-4 shadow-sm`)
- Besserer Gap und Grid-Layout statt flex-wrap

### 3. Weitere Tools hinzufuegen
Zusaetzlich zu den bestehenden 9:
- **Zapier** (Automatisierung)
- **Slack** (Kommunikation)
- **HubSpot** (CRM)
- **Notion** (Organisation)
- **Google Calendar** (Terminplanung)
- **WhatsApp Business** (Kundenkommunikation)

Gesamt: 15 Tools

### 4. Technische Umsetzung
- **`TrustLogosSection.tsx`** komplett ueberarbeiten:
  - Inline-SVG-Icons fuer alle 15 Tools (aus simpleicons.org / eigene SVG-Paths)
  - Alternativ: `react-icons/si` Package fuer Simple Icons (bereits gaengig)
  - Grid-Layout `grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5`
  - Jedes Logo in einer weissen Card mit Schatten
  - Kein Grayscale mehr, stattdessen sanfte Opacity-Animation
- Lokale PNG-Assets bleiben erhalten (kein Breaking Change auf Community-Seite)

### Dateiaenderungen
- **Aendern**: `src/components/landing/home/TrustLogosSection.tsx` -- kompletter Rewrite mit SVG-Icons und neuem Layout

