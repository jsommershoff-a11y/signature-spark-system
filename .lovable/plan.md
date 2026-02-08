
# Logo-Integration im Header

## Ziel
Ersetzen des Text-Platzhalters im Header durch das offizielle KRS Signature Logo mit dem markanten Säulen-Icon.

## Logo-Auswahl
Ich werde die **erste Logo-Variante** (weißer Hintergrund, dunkles Icon mit orangem Akzent) verwenden, da diese am besten zum hellen Header passt.

## Umsetzung

### 1. Logo-Datei kopieren
- Speichern des Logos nach `src/assets/logo-signature.png`
- Verwendung der Version auf weißem Hintergrund

### 2. Header-Komponente aktualisieren
- Import des Logo-Bildes als ES6-Modul
- Ersetzen des Platzhalter-Divs durch ein `<img>`-Tag
- Logo-Größe: ca. 40-48px Höhe für optimale Header-Darstellung
- Beibehalten des "KRS Signature" Textlabels neben dem Icon für bessere Lesbarkeit

### Vorher/Nachher

```text
VORHER:
+---------------------------+
| [K-Box] KRS Signature     |
+---------------------------+

NACHHER:
+---------------------------+
| [Logo-Icon] KRS Signature |
+---------------------------+
```

### Betroffene Dateien
- `src/assets/logo-signature.png` (neu)
- `src/components/landing/Header.tsx` (aktualisiert)
