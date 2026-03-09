-- Batch 2: Fortgeschrittene Verkaufstechniken + Structogram

-- Der Preis ist zu hoch
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Einwand: "Der Preis ist zu hoch"</h2><h3>Warum dieser Einwand kommt</h3><ul><li>Der Wert wurde nicht klar genug kommuniziert</li><li>Der Kunde vergleicht mit günstigeren (aber schlechteren) Alternativen</li><li>Budget-Unsicherheit, nicht echte Ablehnung</li></ul><h3>Die 4-Schritt-Methode</h3><ol><li><b>Bestätigen:</b> "Ich verstehe, dass die Investition gut überlegt sein will."</li><li><b>Isolieren:</b> "Ist der Preis der einzige Punkt, oder gibt es noch andere Bedenken?"</li><li><b>Umdeuten:</b> "Lassen Sie uns die Kosten pro gewonnenem Kunden berechnen..."</li><li><b>Social Proof:</b> "Herr Schreiner von AS Gärten hatte dieselbe Frage – nach 3 Monaten hatte er über 40 Bewerbungen."</li></ol><h3>ROI-Argument aufbauen</h3><pre>KI-Prompt:
Erstelle eine ROI-Rechnung für meinen Kunden:
Produkt: [X] für [Preis]€
Erwarteter Nutzen: [Y] neue Kunden/Monat
Durchschnittlicher Kundenwert: [Z]€

Berechne: Break-even-Zeitpunkt, ROI nach 6/12 Monaten,
Opportunitätskosten des Nicht-Handelns.
Formatiere als übersichtliche Tabelle.</pre><h3>Praxis-Skript</h3><p><b>Kunde:</b> "8.000€ ist schon eine Hausnummer..."</p><p><b>Du:</b> "Absolut, Herr Müller. Deshalb rechnen wir das mal durch: Wenn Sie durch unser System nur 2 zusätzliche Aufträge pro Monat gewinnen à 3.000€, sind das 36.000€ Mehrumsatz im Jahr. Die Investition hat sich in unter 3 Monaten amortisiert. Die eigentliche Frage ist: Was kostet es Sie, wenn Sie so weitermachen wie bisher?"</p>'::text)) WHERE id = 'a44d308a-513f-4d95-915a-20c17a7a1949';

-- Timing-Einwände meistern
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Timing-Einwände meistern</h2><h3>Typische Timing-Einwände</h3><ul><li>"Jetzt ist nicht der richtige Zeitpunkt"</li><li>"Ich muss erst noch [X] abschließen"</li><li>"Melden Sie sich nächstes Quartal"</li><li>"Wir haben gerade andere Prioritäten"</li></ul><h3>Die Wahrheit hinter Timing-Einwänden</h3><p>In 80% der Fälle bedeutet "nicht jetzt" eigentlich: <b>"Ich sehe noch nicht genug Dringlichkeit."</b></p><h3>Gegenstrategie: Kosten des Wartens</h3><pre>KI-Prompt:
Berechne die "Kosten des Nichtstuns" für meinen Kunden:
Branche: [X]
Aktuelles Problem: [Y]
Monatlicher Verlust durch das Problem: geschätzt [Z]€

Erstelle eine Übersicht:
- Kosten nach 3 Monaten Warten
- Kosten nach 6 Monaten Warten
- Verpasste Chancen (Opportunity Cost)
- Was die Konkurrenz in der Zeit erreicht</pre><h3>Praxis-Skript</h3><p><b>Kunde:</b> "Melden Sie sich im September wieder."</p><p><b>Du:</b> "Verstehe ich. Eine Frage dazu: Das Problem mit [fehlenden Bewerbern/sinkenden Umsätzen] – wird das im September besser sein? Oder verlieren Sie bis dahin weitere [X]€? Mein Vorschlag: Wir starten mit dem Quick-Win-Modul, das sofort wirkt, und skalieren im September."</p>'::text)) WHERE id = '8fe0d270-ded9-4ea9-930e-bfcca634f84f';

-- Einwand-Rollenspiel
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Praxis: Einwand-Rollenspiel</h2><h3>So funktioniert die Übung</h3><p>Nutze ChatGPT als Rollenspiel-Partner:</p><pre>Du bist ein skeptischer Geschäftsführer eines Handwerksbetriebs (20 MA, 3 Mio € Umsatz).

Ich bin Vertriebsberater und versuche, dir eine KI-Vertriebslösung für 8.000€ zu verkaufen.

Deine Einwände (wechsle zwischen diesen):
1. "Das ist zu teuer"
2. "Das funktioniert in unserer Branche nicht"
3. "Wir haben keine Zeit für sowas"
4. "Mein Vertrieb läuft doch"

Reagiere realistisch auf meine Argumente. Gib nach, wenn mein Argument überzeugend ist, aber nicht zu leicht. Am Ende bewerte meine Performance 1-10.</pre><h3>Aufgabe 1: Preis-Einwand</h3><p>Übe 3 verschiedene Antworten auf "Zu teuer" und notiere welche am besten funktioniert.</p><h3>Aufgabe 2: Branchen-Einwand</h3><p>Bereite 2 branchenspezifische Erfolgsbeispiele vor und teste sie im Rollenspiel.</p><h3>Aufgabe 3: Eigene Einwände</h3><p>Sammle die 3 häufigsten Einwände deiner echten Kunden und übe Antworten mit der KI.</p><h3>Bewertungsbogen</h3><table><tr><th>Kriterium</th><th>Punkte</th></tr><tr><td>Einwand korrekt identifiziert</td><td>/10</td></tr><tr><td>Empathie gezeigt</td><td>/10</td></tr><tr><td>Konkretes Gegenargument</td><td>/10</td></tr><tr><td>Zum nächsten Schritt geführt</td><td>/10</td></tr></table>'::text)) WHERE id = '758a4284-acd6-4cb6-b541-d37e7bec72d0';

-- Einführung ins Structogram
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Das Structogram: 3 Gehirne verstehen</h2><h3>Was ist das Structogram?</h3><p>Das Structogram basiert auf der Biostruktur-Analyse und teilt Persönlichkeiten in drei Grundtypen ein – benannt nach Gehirnregionen:</p><table><tr><th>Typ</th><th>Farbe</th><th>Gehirn</th><th>Kernmerkmal</th></tr><tr><td>Stammhirn-dominant</td><td>🔴 Rot</td><td>Reptiliengehirn</td><td>Durchsetzung, Ergebnis, Tempo</td></tr><tr><td>Zwischenhirn-dominant</td><td>🟢 Grün</td><td>Limbisches System</td><td>Beziehung, Harmonie, Empathie</td></tr><tr><td>Großhirn-dominant</td><td>🔵 Blau</td><td>Neocortex</td><td>Analyse, Fakten, Perfektion</td></tr></table><h3>Warum ist das im Vertrieb wichtig?</h3><p>Wenn du den Typ deines Gegenübers erkennst, kannst du deine Argumentation anpassen:</p><ul><li><b>Rot:</b> Komm auf den Punkt, zeig Ergebnisse, spare Smalltalk</li><li><b>Grün:</b> Bau Beziehung auf, zeig Empathie, gib Sicherheit</li><li><b>Blau:</b> Liefere Daten, sei präzise, gib Zeit zum Nachdenken</li></ul><h3>KI-Prompt: Typ erkennen</h3><pre>Analysiere diese Gesprächsnotizen und bestimme den Structogram-Typ:

[Notizen einfügen]

Bewerte für jeden Typ (Rot/Grün/Blau) auf einer Skala 1-10.
Empfehle die optimale Kommunikationsstrategie.
Gib 3 konkrete Formulierungen die für diesen Typ gut funktionieren.</pre>'::text)) WHERE id = 'fa8235c4-b929-4f0a-9375-1661d1320675';

-- Der Rote Typ
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Der Rote Typ: Dominant & Ergebnisorientiert</h2><h3>Erkennungsmerkmale</h3><ul><li>Spricht schnell und direkt</li><li>Unterbricht häufig</li><li>Fragt nach Zahlen und Ergebnissen</li><li>Wenig Geduld für Details</li><li>Entscheidet schnell</li><li>Fester Händedruck, aufrechte Haltung</li></ul><h3>Im Verkaufsgespräch</h3><table><tr><th>Do</th><th>Dont</th></tr><tr><td>Auf den Punkt kommen</td><td>Langatmige Einleitungen</td></tr><tr><td>Ergebnisse und ROI zeigen</td><td>Nur über Features reden</td></tr><tr><td>Optionen bieten ("A oder B?")</td><td>Nur eine Option präsentieren</td></tr><tr><td>Respekt zeigen, auf Augenhöhe</td><td>Unterwürfig auftreten</td></tr></table><h3>Power-Sätze für Rote</h3><ul><li>"Das Ergebnis in Zahlen: [X]€ Mehrumsatz in [Y] Monaten."</li><li>"Andere Unternehmer in Ihrer Position haben sich innerhalb von 48h entschieden."</li><li>"Hier ist der Plan: 3 Schritte, 90 Tage, messbare Ergebnisse."</li></ul><h3>KI-Prompt: Angebot für Roten Typ</h3><pre>Erstelle ein 1-Seiten-Angebot für einen "Roten Typ":
Produkt: [X]
Preis: [Y]€

Fokus auf: Ergebnisse, Zahlen, Geschwindigkeit
Kein Smalltalk, direkt zur Sache
Max 300 Wörter, mit Bullet Points und einer klaren Tabelle</pre>'::text)) WHERE id = '11e26ed8-fb31-4ca4-a963-1234a50e9537';

-- Der Grüne Typ
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Der Grüne Typ: Empathisch & Beziehungsorientiert</h2><h3>Erkennungsmerkmale</h3><ul><li>Spricht ruhig und warmherzig</li><li>Fragt nach Meinungen anderer</li><li>Erwähnt Team und Familie</li><li>Vermeidet Konflikte</li><li>Braucht Sicherheit und Vertrauen</li><li>Weicher Händedruck, offene Körpersprache</li></ul><h3>Im Verkaufsgespräch</h3><table><tr><th>Do</th><th>Dont</th></tr><tr><td>Smalltalk und Beziehung aufbauen</td><td>Direkt zum Geschäft kommen</td></tr><tr><td>Referenzen und Testimonials zeigen</td><td>Druck aufbauen</td></tr><tr><td>Sicherheiten bieten (Garantie)</td><td>Zu schnell abschließen wollen</td></tr><tr><td>Team einbeziehen</td><td>Nur den GF ansprechen</td></tr></table><h3>Power-Sätze für Grüne</h3><ul><li>"Herr Schreiner aus Köln hatte genau dieselbe Situation. Er hat sich getraut – und heute sagt er..."</li><li>"Sie gehen kein Risiko ein. Wenn es nicht funktioniert, bekommen Sie Ihr Geld zurück."</li><li>"Was würde Ihr Team dazu sagen, wenn Sie nächsten Monat 40 Bewerbungen hätten?"</li></ul><h3>KI-Prompt: E-Mail für Grünen Typ</h3><pre>Schreibe eine warmherzige Follow-up-E-Mail an einen "Grünen Typ":
Kontext: [Beschreibung des letzten Gesprächs]

Stil: Persönlich, empathisch, nicht verkäuferisch
Erwähne: Eine Erfolgsgeschichte eines ähnlichen Kunden
Biete: Garantie oder risikofreien Testlauf an
Schließe mit einer sanften Frage (kein harter CTA)</pre>'::text)) WHERE id = '015b6299-c28f-4a03-a7e2-a895dad99e6b';

-- Der Blaue Typ
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Der Blaue Typ: Analytisch & Detailorientiert</h2><h3>Erkennungsmerkmale</h3><ul><li>Stellt viele detaillierte Fragen</li><li>Möchte Daten, Statistiken, Belege</li><li>Nimmt sich Zeit für Entscheidungen</li><li>Liest das Kleingedruckte</li><li>Ordentlich, strukturiert, pünktlich</li><li>Zurückhaltende Körpersprache</li></ul><h3>Im Verkaufsgespräch</h3><table><tr><th>Do</th><th>Dont</th></tr><tr><td>Fakten und Daten liefern</td><td>Nur Emotionen nutzen</td></tr><tr><td>Detaillierte Unterlagen vorbereiten</td><td>Improvisieren</td></tr><tr><td>Zeit zum Nachdenken geben</td><td>Auf schnelle Entscheidung drängen</td></tr><tr><td>Schriftlich nachfassen</td><td>Nur mündlich kommunizieren</td></tr></table><h3>Power-Sätze für Blaue</h3><ul><li>"Hier sind die Daten aus 47 vergleichbaren Projekten..."</li><li>"Ich schicke Ihnen eine detaillierte Aufstellung per E-Mail, damit Sie alles in Ruhe prüfen können."</li><li>"Die Methodik basiert auf [X] und ist in [Y] Studien validiert."</li></ul><h3>KI-Prompt: Detailreiches Angebot</h3><pre>Erstelle ein detailliertes Angebot für einen analytischen Entscheider:
Produkt: [X], Preis: [Y]€, Laufzeit: [Z] Monate

Struktur:
1. Executive Summary (3 Sätze)
2. Problemanalyse mit Zahlen
3. Lösungsbeschreibung (jedes Modul einzeln)
4. ROI-Kalkulation als Tabelle
5. Implementierungsplan (Wochen-Timeline)
6. Referenzen mit messbaren Ergebnissen
7. AGB und Garantie-Details</pre>'::text)) WHERE id = '1d4f6404-1711-41bd-9fac-859983b864ba';

-- Analyse-Arbeitsblatt Structogram
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Arbeitsblatt: Kunden-Strukturanalyse</h2><h3>Schritt 1: Deine letzten 5 Kunden analysieren</h3><table><tr><th>Kunde</th><th>Rot (1-10)</th><th>Grün (1-10)</th><th>Blau (1-10)</th><th>Dominanter Typ</th></tr><tr><td>1. ___</td><td>___</td><td>___</td><td>___</td><td>___</td></tr><tr><td>2. ___</td><td>___</td><td>___</td><td>___</td><td>___</td></tr><tr><td>3. ___</td><td>___</td><td>___</td><td>___</td><td>___</td></tr><tr><td>4. ___</td><td>___</td><td>___</td><td>___</td><td>___</td></tr><tr><td>5. ___</td><td>___</td><td>___</td><td>___</td><td>___</td></tr></table><h3>Schritt 2: KI-gestützte Analyse</h3><pre>Analysiere diese Gesprächsnotizen und erstelle ein Structogram-Profil:

Kunde: [Name]
Branche: [X]
Gesprächsverlauf: [Notizen einfügen]

Bewerte:
- Rot-Anteil (Durchsetzung, Tempo, Ergebnis): _/10
- Grün-Anteil (Beziehung, Harmonie, Vertrauen): _/10
- Blau-Anteil (Analyse, Fakten, Perfektion): _/10

Empfehle:
1. Die 3 besten Argumentationslinien
2. Welche Einwände zu erwarten sind
3. Die optimale Abschlussstrategie</pre><h3>Schritt 3: Muster erkennen</h3><p>Analysiere deine Ergebnisse:</p><ul><li>Welcher Typ kauft am häufigsten bei dir?</li><li>Bei welchem Typ verlierst du am meisten Deals?</li><li>Wie kannst du deine Strategie für den schwächsten Typ verbessern?</li></ul>'::text)) WHERE id = '2faa4abb-4ae7-476b-a4e3-dbafee84a38d';
