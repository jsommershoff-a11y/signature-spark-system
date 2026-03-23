

# Plan: Homepage-Relaunch mit allen Sektionen

## Seitenstruktur (komplett)

```text
1. Hero                → HeroSection.tsx neu
2. Trust-Logos         → Neue TrustLogosSection.tsx
3. Problem             → EmotionalHookSection.tsx ersetzen
4. Realität            → FivePillarsSection.tsx ersetzen
5. Lösung              → Neue SolutionSection.tsx
6. Angebot             → Neue OfferSection.tsx
7. Ergebnis            → Neue ResultsSection.tsx
8. Personal Brand      → AboutFounderSection.tsx ersetzen
9. Entscheidung        → FinalCtaSection.tsx ersetzen
10. FAQ                → bleibt
```

## Dateien

### Neu erstellen

1. **`TrustLogosSection.tsx`** -- Logo-Leiste (n8n, Make, Stripe, PayPal, ChatGPT, Google Drive, Outlook, Excel, Google Sheets), Grayscale-Hover, nutzt bestehende Assets aus `src/assets/trust/`

2. **`SolutionSection.tsx`** -- "Wir bauen dir einfache Automatisierungen..." mit 4 Checkmark-Punkten, Abschluss-Statement

3. **`OfferSection.tsx`** -- "Du hast zwei Möglichkeiten:" mit zwei Cards (Selbst umsetzen / Gemeinsam umsetzen), CTA zu /qualifizierung

4. **`ResultsSection.tsx`** -- "Unternehmen, die ihre Prozesse automatisieren:" mit 4 Ergebnis-Punkten + Abschluss

### Ersetzen (Inhalt komplett neu, Datei bleibt)

5. **`HeroSection.tsx`** -- Neue Headline "Du arbeitest zu viel, weil dir einfache Automatisierungen fehlen.", zwei CTAs ("Automatisierungen verstehen" scrollt runter, "Automatisierungen gemeinsam umsetzen" geht zu /qualifizierung)

6. **`EmotionalHookSection.tsx`** → Problem-Sektion mit Aufzählungspunkten als Karten

7. **`FivePillarsSection.tsx`** → Realität-Sektion: 3 Punkte + "Alles läuft manuell..."

8. **`AboutFounderSection.tsx`** → Personal Brand: "Ich bin kein klassischer Berater..." -- kein Foto, reiner Text, persönlich und direkt

9. **`FinalCtaSection.tsx`** → Entscheidung: Zwei Optionen-Cards (Weitermachen vs. System bauen), zwei CTAs

### Anpassen

10. **`MasterHome.tsx`** -- Neue Import-Reihenfolge, entferne CaseStudiesSection, AcademyPreviewSection, ProcessStepsSection aus dem Render

## Texte

Alle Texte werden wörtlich wie vorgegeben übernommen. Beide neuen Sektionen (Personal Brand + Entscheidung) nutzen die exakten Formulierungen aus der Vorgabe.

