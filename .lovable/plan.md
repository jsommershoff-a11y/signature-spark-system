

## Testimonial-Foto prominent neben dem Zitat anzeigen

### Aenderung

**`src/components/landing/conversion/TestimonialGrid.tsx`**: Das Layout wird von einem einfachen Card-Layout zu einem zweispaltigen Layout umgebaut:

- **Links**: Das Foto von Rene Schreiner gross und prominent (z.B. 200x200px, abgerundet) angezeigt
- **Rechts**: Name, Firma, Zitat und Badge wie bisher
- Auf Mobile stapeln sich Bild (zentriert) und Text untereinander
- Der kleine Avatar entfaellt, stattdessen wird das Bild als eigenstaendiges, grosses Element dargestellt

### Technische Umsetzung

- Card-Inhalt wird zu `flex flex-col md:flex-row items-center gap-6`
- Linke Spalte: `<img>` mit `w-40 h-40 md:w-48 md:h-48 rounded-2xl object-cover shadow-md`
- Rechte Spalte: Name, Firma-Link, Zitat, Badge
- Container-Breite wird auf `max-w-2xl` erweitert fuer das breitere Layout
- Kein neuer Import noetig, das bestehende `renePhoto` wird weiterverwendet

