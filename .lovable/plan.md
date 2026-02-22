

## 3 neue Gruender-Fotos einsetzen

### Zusammenfassung

Die 3 hochgeladenen Bilder ersetzen das bisherige einzelne `founder-portrait.jpeg` an den 3 Stellen, wo es aktuell verwendet wird. Jedes Bild wird gezielt der passenden Sektion zugeordnet.

### Bildzuordnung

| Bild | Dateiname | Einsatzort | Begruendung |
|------|-----------|------------|-------------|
| Bild 2 (Hotel/Lounge, professionell) | `founder-hero.jpeg` | **HeroSection.tsx** -- Hintergrund + Video-Thumbnail | Professionelles Setting, dunkler Hintergrund passt zum Hero-Overlay |
| Bild 3 (Buero, Strickjacke + Hemd) | `founder-about.jpeg` | **AboutFounderSection.tsx** -- Gruender-Portrait | Business-casual im Buero-Setting, strahlt Kompetenz und Nahbarkeit aus |
| Bild 1 (Couch, Buch, entspannt) | `founder-personal.jpeg` | **PersonalSupport.tsx** -- Persoenliches Sparring | Lockeres, nahbares Setting -- passt zum "Partner auf Augenhoehe"-Thema |

### Schritte

#### Step 01 -- Bilder in src/assets kopieren

3 neue Dateien anlegen:
- `src/assets/founder-hero.jpeg` (aus Bild 2)
- `src/assets/founder-about.jpeg` (aus Bild 3)
- `src/assets/founder-personal.jpeg` (aus Bild 1)

Das alte `src/assets/founder-portrait.jpeg` bleibt bestehen (koennte von Branchen-Landingpages referenziert werden).

#### Step 02 -- HeroSection.tsx aktualisieren

Import aendern: `founder-portrait.jpeg` wird zu `founder-hero.jpeg`

#### Step 03 -- AboutFounderSection.tsx aktualisieren

Import aendern: `founder-portrait.jpeg` wird zu `founder-about.jpeg`

#### Step 04 -- PersonalSupport.tsx aktualisieren

Import aendern: `founder-portrait.jpeg` wird zu `founder-personal.jpeg`

### Keine weiteren Aenderungen noetig

- Kein Layout- oder CSS-Umbau
- Keine neuen Dependencies
- Consumer-Dateien (MasterHome, Branchen-Pages) bleiben unveraendert

