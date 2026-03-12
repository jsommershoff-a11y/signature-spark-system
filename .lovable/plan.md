

## Mobile-Optimierung der AGB-Seite

### Probleme auf kleinen Bildschirmen
1. **Padding/Spacing zu gross** -- `py-16` und `space-y-16` verschwenden Platz auf Mobile
2. **AGB-Titel** -- `text-3xl` ist auf Mobile zu gross
3. **Stripe Pricing Table** -- kann auf kleinen Screens horizontal ueberlaufen (overflow)
4. **Skool-Card Padding** -- `p-6` kann auf sehr kleinen Screens eng werden
5. **Feature-Grid** -- `sm:grid-cols-2` ist ok, aber Textgroesse koennte besser skalieren

### Aenderungen in `src/pages/landing/AGB.tsx`

1. **Container**: `py-10 md:py-16 space-y-10 md:space-y-16 px-4 sm:px-6` -- weniger Abstand auf Mobile
2. **AGB Headline**: `text-2xl md:text-3xl` statt fix `text-3xl`
3. **Stripe Container**: `overflow-x-auto` hinzufuegen fuer horizontales Scrolling falls noetig
4. **Skool Card**: `p-4 sm:p-6 md:p-8` fuer bessere Padding-Skalierung
5. **Skool Icon**: kleiner auf Mobile `h-10 w-10 md:h-14 md:w-14`
6. **CTA-Link**: auf Mobile als voller Button-Stil statt inline-Link fuer bessere Touch-Targets

Kleine, gezielte CSS-Klassenanpassungen -- keine strukturellen Aenderungen noetig.

