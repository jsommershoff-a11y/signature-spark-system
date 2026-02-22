

## Logo-Austausch: Altes Logo raus, neues KRS Signature Logo rein

### Ausgangslage

Aktuell werden zwei verschiedene Logo-Dateien im Projekt verwendet:
- `src/assets/logo-krs-signature.png` (Landing-Seiten: Header, Footer, StickyConversionHeader)
- `src/assets/logo-signature.png` (App-Bereich: AppLayout, Auth-Seite)

### Aenderungen

**Step 01 — Neue Logo-Datei ins Projekt kopieren**

Die hochaufgeloeste Version `KRS_Signature_Universal_HighRes_1080x1080.png` wird als `src/assets/krs-logo.png` ins Projekt kopiert. Nur eine einzige Datei fuer alle Verwendungszwecke.

**Step 02 — Alle Imports auf das neue Logo umstellen**

Folgende 5 Dateien werden aktualisiert (nur die Import-Zeile aendern):

| Datei | Alter Import | Neuer Import |
|---|---|---|
| `src/components/landing/Header.tsx` | `logo-krs-signature.png` | `krs-logo.png` |
| `src/components/landing/Footer.tsx` | `logo-krs-signature.png` | `krs-logo.png` |
| `src/components/landing/conversion/StickyConversionHeader.tsx` | `logo-krs-signature.png` | `krs-logo.png` |
| `src/components/app/AppLayout.tsx` | `logo-signature.png` | `krs-logo.png` |
| `src/pages/Auth.tsx` | `logo-signature.png` | `krs-logo.png` |

**Step 03 — Alte Logo-Dateien loeschen**

- `src/assets/logo-krs-signature.png` entfernen
- `src/assets/logo-signature.png` entfernen

### Hinweis

Das neue Logo hat einen orangefarbenen Hintergrund, der auf den orangefarbenen Headern nahtlos verschmilzt. Auf der Auth-Seite (heller Hintergrund) wird das quadratische Logo mit dem Orange-Hintergrund als markantes Branding-Element wirken.

