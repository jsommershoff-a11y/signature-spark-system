

# Plan: Homepage Conversion-Optimierung

## Ueberblick

Gezielte Text- und Struktur-Optimierung aller 12 bestehenden Sektionen. Keine neuen Komponenten, keine Dopplungen. Jede Sektion bekommt schaerfere Texte, klarere Funnel-Rolle und staerkere Conversion-Logik.

## Aenderungen pro Sektion

### 1. HeroSection.tsx
- Headline haerter: Fokus auf taeglichen Geldverlust statt nur "zu viel arbeiten"
- Subline konkretisieren: "Jede Stunde, die du manuell arbeitest, kostet dich Geld, Kunden und Wachstum"
- Zweite Subline streichen, stattdessen ein knapper Konsequenz-Satz
- Sterne-Zeile bleibt

### 2. EmotionalHookSection.tsx (Problem)
- 4 Punkte durch 6 konkretere Alltagssituationen ersetzen:
  - "Kundenanfragen liegen in WhatsApp, E-Mail und Excel verteilt"
  - "Follow-ups werden vergessen, weil niemand sie trackt"
  - "Dein Team fragt dich bei jeder Kleinigkeit, weil es keine klaren Ablaeufe gibt"
  - "Angebote werden zu spaet geschickt, weil der Prozess manuell ist"
  - "Informationen stecken in Koepfen statt in Systemen"
  - "Ohne dich steht alles still"
- Abschluss-Statement bleibt, ergaenzt um: "Und jeder Tag ohne System kostet dich bares Geld."

### 3. FivePillarsSection.tsx (Realitaet)
- 3 Punkte ausfuehrlicher und konkreter:
  - "Keine klare Struktur – Aufgaben entstehen, aber niemand weiss, wer was bis wann erledigt"
  - "Keine automatisierten Ablaeufe – jeder Handgriff passiert manuell und fehleranfaellig"
  - "Keine saubere Organisation – Informationen liegen verstreut, Uebergaben gehen verloren"
- Abschluss: "Alles laeuft ueber dich. Und genau deshalb waechst dein Unternehmen nicht."

### 4. SolutionSection.tsx
- Outcome-orientiert umschreiben. Statt "Anfragen werden automatisch erfasst" → "Keine Anfrage geht mehr verloren – egal ob sie per E-Mail, Formular oder WhatsApp kommt"
- Neue Punkte:
  - "Kein Follow-up wird mehr vergessen – dein System erinnert automatisch"
  - "Dein Team weiss immer, was als Naechstes zu tun ist – ohne Rueckfragen"
  - "Prozesse laufen zuverlaessig im Hintergrund – du greifst nur noch ein, wenn du willst"
- Abschluss: "Weniger Chaos. Weniger Abhaengigkeit. Mehr Kontrolle ueber dein Unternehmen."

### 5. AiRealitySection.tsx
- Misconceptions schaerfer: "Sie bezahlen Agenturen fuer Chatbots, die kein Kunde nutzt."
- Handwerker/Mittelstands-Argument als neuen Block am Ende einbauen (innerhalb der Sektion, kein neues Component):
  - Headline: "„KI bringt mir nichts" ist die teuerste Ausrede im Mittelstand."
  - Text: "Auf der Baustelle, in der Werkstatt, beim Kunden – da bist du unersetzlich. Aber in der Buchhaltung, Terminplanung, Angebotserstellung und Dokumentation? Da verlierst du jeden Tag Geld. Und genau dort greifen einfache Automatisierungen sofort."
- Prozesse-Liste erweitern: + "Terminplanung", "Dokumentation", "Rechnungsstellung"

### 6. CompetitionSection.tsx
- Rechte Karte (Konkurrenz) schaerfer: "Und das reicht, um dir Kunden wegzunehmen, schneller Angebote rauszuschicken und mit weniger Aufwand mehr Umsatz zu machen."
- Linke Karte: "Im Buero, in der Verwaltung, bei jedem Prozess der nicht am Kunden stattfindet – da bist du ersetzbar. Und dort verlierst du jeden Tag Geld."

### 7. OfferSection.tsx
- Subline schaerfer: "Warte nicht. Jeder Tag ohne System kostet dich Stunden und Umsatz."
- Option 1: Ergaenzen "Du sparst Geld, investierst aber Zeit."
- Option 2: Ergaenzen "Du investierst einmal, sparst ab Tag 1."

### 8. AiAnalysisWidget.tsx
- Intro-Text wirtschaftlicher: "Finde heraus, wie viele Stunden und Euro du jede Woche verlierst – weil Prozesse manuell laufen, die laengst automatisiert sein koennten."
- Ergebnis-Texte um wirtschaftliche Dimension ergaenzen: "Bei einem Stundensatz von 80 € entspricht das X–Y € pro Monat, die du verschenkst."
- Savings-Card um Euro-Berechnung ergaenzen (basierend auf 80 €/Std-Annahme)

### 9. ResultsSection.tsx
- Ergebnis-Punkte outcome-staerker:
  - "Weniger operative Abhaengigkeit von einzelnen Personen"
  - "Schnellere Reaktionszeiten auf Kundenanfragen"
  - "Sauberere Prozesse mit weniger manuellen Uebergaben"
  - "Bessere Planbarkeit fuer Wachstum und Skalierung"

### 10. AboutFounderSection.tsx
- Staerker positionieren: "Keine Theorie. Keine Frameworks. Funktionierende Systeme aus echter Praxis." als zusaetzlichen Absatz
- Badge-Text: "Aus der Praxis, nicht aus dem Lehrbuch"

### 11. FinalCtaSection.tsx
- Option 1 haerter: "Alles bleibt an dir haengen. Dein Team wartet. Anfragen gehen unter. Du arbeitest abends und am Wochenende."
- Option 2 konkreter: "Innerhalb von 14 Tagen laufen erste Prozesse automatisiert. Du gewinnst Zeit zurueck. Dein Team arbeitet eigenstaendig."
- Uebergangstext: "Jeder Tag, an dem du wartest, kostet dich Stunden, Geld und Nerven."

### 12. TrustLogosSection.tsx
- Untertitel ergaenzen: "Kompetenz in Integration und Automatisierung – nicht nur einzelne Tools, sondern vernetzte Systeme."

## Dateien die geaendert werden

Nur bestehende Dateien, keine neuen:
1. `src/components/landing/home/HeroSection.tsx`
2. `src/components/landing/home/EmotionalHookSection.tsx`
3. `src/components/landing/home/FivePillarsSection.tsx`
4. `src/components/landing/home/SolutionSection.tsx`
5. `src/components/landing/home/AiRealitySection.tsx`
6. `src/components/landing/home/CompetitionSection.tsx`
7. `src/components/landing/home/OfferSection.tsx`
8. `src/components/landing/home/AiAnalysisWidget.tsx`
9. `src/components/landing/home/ResultsSection.tsx`
10. `src/components/landing/home/AboutFounderSection.tsx`
11. `src/components/landing/home/FinalCtaSection.tsx`
12. `src/components/landing/home/TrustLogosSection.tsx`

Keine strukturellen Aenderungen an MasterHome.tsx. Keine neuen Komponenten. Designsystem, Tokens und Layout bleiben identisch.

