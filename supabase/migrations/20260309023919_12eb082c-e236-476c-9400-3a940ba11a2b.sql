-- Fill placeholder lessons batch 1: Starter courses (Prompting, Content, SalesFlow, Automation)

-- Häufige Fehler vermeiden
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Die 10 häufigsten Prompting-Fehler</h2><h3>Fehler 1: Zu vage formulieren</h3><p>❌ <i>"Schreib mir was über Marketing"</i></p><p>✅ <i>"Schreibe 5 LinkedIn-Post-Ideen für B2B-Handwerksbetriebe zum Thema Mitarbeitergewinnung. Jeder Post soll eine provokante Frage als Hook nutzen und maximal 200 Wörter lang sein."</i></p><h3>Fehler 2: Keine Rolle zuweisen</h3><p>❌ <i>"Erstelle eine E-Mail"</i></p><p>✅ <i>"Du bist ein erfahrener E-Mail-Marketing-Experte mit 15 Jahren Erfahrung im B2B-Vertrieb. Schreibe eine Cold-Outreach-E-Mail..."</i></p><h3>Fehler 3: Kein Ausgabeformat angeben</h3><p>Sage explizit: "Antworte als nummerierte Liste", "Formatiere als Markdown-Tabelle" oder "Liefere JSON mit den Feldern: name, score, reason".</p><h3>Fehler 4: Alles in einen Prompt packen</h3><pre>Besser aufteilen:
Schritt 1: "Analysiere diese Zielgruppe: [X]"
Schritt 2: "Basierend auf der Analyse, erstelle 3 Headlines"
Schritt 3: "Wähle die beste und schreibe den Fließtext"</pre><h3>Fehler 5: Kontext vergessen</h3><p>Gib immer an: Branche, Zielgruppe, Tonalität, bisherige Ergebnisse.</p><h3>Fehler 6: Nicht iterieren</h3><pre>Follow-up-Prompts nutzen:
"Gut, aber mach den Ton persönlicher und füge Zahlen hinzu."
"Kürze auf die Hälfte, behalte die stärksten Argumente."</pre><h3>Fehler 7: Negative statt positive Anweisungen</h3><p>❌ "Nicht langweilig" → ✅ "Energisch, kurze Sätze, konkrete Beispiele"</p><h3>Fehler 8: Output ungeprüft verwenden</h3><p>Prüfe: Fakten korrekt? Zahlen plausibel? Tonalität passend?</p><h3>Fehler 9: Immer denselben Prompt</h3><p>A/B-teste deine Prompts – kleine Änderungen → große Ergebnis-Unterschiede.</p><h3>Fehler 10: Keine Prompt-Bibliothek</h3><p>Speichere jeden guten Prompt in einem Dokument nach Kategorie sortiert!</p><h3>💡 Meta-Prompt zum Verbessern</h3><pre>Analysiere und verbessere diesen Prompt:
[Prompt einfügen]

Prüfe auf: Klarheit der Rolle, ausreichend Kontext,
spezifisches Format, konkrete Constraints.
Liefere den verbesserten Prompt.</pre>'::text)) WHERE id = 'ce326a44-c562-4849-bd86-b7a2dbee912e';

-- RISEN Framework
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Das RISEN-Framework</h2><p>RISEN ist eines der effektivsten Frameworks für komplexe Business-Prompts.</p><h3>Die 5 Komponenten</h3><table><tr><th>Buchstabe</th><th>Bedeutung</th><th>Beispiel</th></tr><tr><td><b>R</b></td><td>Role</td><td>"Du bist ein Senior Sales Consultant"</td></tr><tr><td><b>I</b></td><td>Instructions</td><td>"Erstelle eine Einwand-Behandlung"</td></tr><tr><td><b>S</b></td><td>Steps</td><td>"1. Einwand verstehen 2. Empathie zeigen 3. Umdeuten"</td></tr><tr><td><b>E</b></td><td>End goal</td><td>"Kunde soll Folgetermin vereinbaren"</td></tr><tr><td><b>N</b></td><td>Narrowing</td><td>"Max 3 Sätze pro Schritt, professionell"</td></tr></table><h3>Praxis-Beispiel: Akquise-E-Mail</h3><pre>R: B2B-Vertriebsexperte für Handwerksbetriebe, 10+ Jahre Erfahrung.
I: Schreibe eine Cold-Outreach-E-Mail an den GF eines Malerbetriebs (15 MA).
S: 1. Eröffne mit branchenspezifischem Pain Point
   2. Zeige konkrete Lösung mit Zahlen
   3. Schließe mit niedrigschwelligem CTA
E: Empfänger soll 15-Min Discovery Call buchen.
N: Max 150 Wörter, keine Floskeln, ein Branchenbeispiel.</pre><h3>Praxis-Beispiel: Content-Plan</h3><pre>R: Social-Media-Strategin für KMU im DACH-Raum.
I: Erstelle LinkedIn-Carousel zum Thema "5 Führungsfehler".
S: 1. Slide 1: Provokante These als Hook
   2. Slides 2-6: Je ein Fehler mit Lösung
   3. Slide 7: CTA zum Kommentieren
E: Mind. 20 Kommentare und 5 Shares.
N: Duze, sparsam Emojis, max 30 Wörter pro Slide.</pre><h3>Wann RISEN nutzen?</h3><ul><li>Komplexe Texterstellung (Angebote, Proposals)</li><li>Mehrstufige Analysen</li><li>Content-Produktion mit klaren KPIs</li><li>Verkaufsgespräch-Vorbereitung</li></ul>'::text)) WHERE id = '9174e2db-b225-4ce8-84f1-9a6a53b659ca';

-- Framework-Übungen Arbeitsblatt
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Framework-Übungen</h2><h3>Übung 1: RACE anwenden</h3><pre>R (Role): Du bist ein erfahrener Texter für [Branche]
A (Action): Schreibe eine Google-Ads-Anzeige
C (Context): Zielgruppe: Hausbesitzer für Badsanierung, Budget 500€/Monat
E (Execute): 3 Varianten, je Headline (30 Zeichen), 2 Descriptions (90 Zeichen), CTA</pre><h3>Übung 2: RISEN für ein Angebot</h3><pre>R: Vertriebs-Berater für IT-Dienstleister
I: Erstelle ein individuelles Angebot für einen Kunden
S: 1. Pain Points zusammenfassen
   2. Lösung mit 3 konkreten Modulen
   3. Investitionsübersicht mit ROI-Rechnung
E: Kunde soll innerhalb von 48h unterschreiben
N: 2 Seiten max, professionell, mit Dringlichkeit</pre><h3>Übung 3: Chain-of-Thought für Gesprächsanalyse</h3><pre>Analysiere dieses Verkaufsgespräch Schritt für Schritt:
[Gespräch einfügen]

Schritt 1: Identifiziere die genannten Pain Points
Schritt 2: Bewerte die Kaufbereitschaft (1-10) mit Begründung
Schritt 3: Bestimme den Persönlichkeitstyp (Rot/Grün/Blau)
Schritt 4: Empfiehl die optimale Follow-up-Strategie</pre><h3>Übung 4: Prompt-Vergleich</h3><p>Teste denselben Use Case mit 2 Frameworks. Dokumentiere: Welches lieferte bessere Ergebnisse? Wo waren die größten Unterschiede?</p>'::text)) WHERE id = 'b24624c3-1087-49a4-8c52-7ca85add088a';

-- Abschlusstest Prompt-Frameworks
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Abschlusstest: Prompt-Frameworks</h2><h3>Frage 1</h3><p>Wofür steht "R" im RISEN-Framework?</p><ul><li>a) Result</li><li>b) Role ✅</li><li>c) Reference</li></ul><h3>Frage 2</h3><p>Was unterscheidet Chain-of-Thought von Few-Shot?</p><ul><li>a) CoT nutzt Beispiele, Few-Shot nicht</li><li>b) CoT fordert schrittweises Reasoning, Few-Shot gibt Beispiel-Paare ✅</li><li>c) Kein Unterschied</li></ul><h3>Frage 3</h3><p>Welches Framework für eine komplexe Angebotsstruktur?</p><ul><li>a) Ein-Satz-Prompt</li><li>b) RISEN mit detaillierten Steps ✅</li><li>c) Nur Rolle zuweisen</li></ul><h3>Praxis-Aufgabe</h3><p>Erstelle einen RISEN-Prompt für: <i>Ein Dachdecker (8 MA) möchte über Instagram Azubis gewinnen. Content-Plan für 4 Wochen.</i></p>'::text)) WHERE id = 'fe7036c2-3cc6-430a-9092-ace70d2a19a6';

-- Praxis 3 Texte erstellen
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Praxis: 3 Business-Texte mit KI</h2><h3>Aufgabe 1: Blogartikel</h3><pre>Du bist SEO-Content-Experte für [deine Branche].
Schreibe einen Blogartikel: "[Dein Thema]"
- 800-1000 Wörter, H2/H3-Überschriften
- Ein konkretes Fallbeispiel
- 3 Tipps zum Sofort-Umsetzen
- Meta-Description (max 155 Zeichen)
Tonalität: Professionell, Du-Ansprache</pre><h3>Aufgabe 2: Follow-up-E-Mail</h3><pre>Schreibe eine Follow-up-E-Mail an einen Interessenten, der vor 3 Tagen ein Angebot über [Y]€ erhalten hat.
Pain Point: [Z]
1. Persönliche Anrede mit Bezug zum Gespräch
2. Einen neuen Mehrwert bieten (nicht nur nachfragen!)
3. Soft CTA (Frage statt Aufforderung)
Max 120 Wörter.</pre><h3>Aufgabe 3: LinkedIn-Post</h3><pre>LinkedIn-Post für [Branche]-Unternehmer.
Hook: Kontraintuitive These zu [X]
Body: 3 kurze Absätze mit persönlicher Erfahrung
CTA: Offene Frage an die Community
Max 1300 Zeichen, Zeilenumbrüche nach jedem Satz.</pre>'::text)) WHERE id = 'ad337d85-69bd-4500-85d1-f4c9e15ce72e';

-- Bildgenerierung mit KI
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Bildgenerierung mit KI</h2><h3>Die Tools im Überblick</h3><table><tr><th>Tool</th><th>Stärke</th><th>Preis</th><th>Best für</th></tr><tr><td>Midjourney</td><td>Fotorealismus, Ästhetik</td><td>ab 10$/Monat</td><td>Marketing-Bilder, Mood-Boards</td></tr><tr><td>DALL-E 3</td><td>Text-Integration, Genauigkeit</td><td>In ChatGPT Plus</td><td>Social Media, Infografiken</td></tr><tr><td>Stable Diffusion</td><td>Flexibilität, Open Source</td><td>Kostenlos</td><td>Technische Anwender</td></tr><tr><td>Canva AI</td><td>Einfachheit, Templates</td><td>ab 12€/Monat</td><td>Schnelle Designs</td></tr></table><h3>Prompt-Anatomie für Bilder</h3><pre>Struktur: [Motiv] + [Stil] + [Details] + [Technische Parameter]

Beispiel Midjourney:
"Professional headshot of a confident business owner in modern office, natural lighting, warm tones, shallow depth of field --ar 1:1 --v 6"

Beispiel DALL-E:
"Erstelle ein minimalistisches Thumbnail für einen LinkedIn-Post über KI im Vertrieb. Blau-Töne, modern, mit abstraktem Netzwerk-Muster."</pre><h3>Praxis-Prompts nach Use Case</h3><h4>Social Media Header</h4><pre>"Create a professional LinkedIn banner for a business consultant. Modern, clean design with subtle gradient from dark blue to teal. Include abstract geometric shapes. 1584x396px"</pre><h4>Blog-Titelbild</h4><pre>"Minimalist illustration of a person working with AI on laptop, isometric view, soft pastel colors, clean white background, corporate style"</pre><h4>Produkt-Mockup</h4><pre>"Professional product photography style mockup of a digital dashboard on a MacBook Pro, modern desk setup, warm ambient lighting, 4k quality"</pre>'::text)) WHERE id = '9aa23450-d6c0-40a6-9dd3-d6b6971607fe';

-- Video-Content mit KI
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Video-Content mit KI erstellen</h2><h3>Die Video-KI-Landschaft</h3><table><tr><th>Tool</th><th>Use Case</th><th>Preis</th></tr><tr><td><b>Runway ML</b></td><td>Text-to-Video, Videobearbeitung</td><td>ab 12$/Monat</td></tr><tr><td><b>HeyGen</b></td><td>Avatar-Videos, Talking Head</td><td>ab 24$/Monat</td></tr><tr><td><b>Synthesia</b></td><td>Schulungsvideos, Erklärvideos</td><td>ab 22€/Monat</td></tr><tr><td><b>Opus Clip</b></td><td>Long-Form zu Short-Form</td><td>ab 9$/Monat</td></tr><tr><td><b>CapCut</b></td><td>Schnitt, Untertitel, Effects</td><td>Kostenlos</td></tr></table><h3>Workflow: Reel in 15 Minuten</h3><ol><li><b>Skript (3 Min):</b><pre>Erstelle ein 60-Sekunden Reel-Skript:
Thema: [X]
Hook (3 Sek): Provokante Frage oder Aussage
Problem (10 Sek): Pain Point der Zielgruppe
Lösung (30 Sek): 3 konkrete Schritte
CTA (5 Sek): Was soll der Zuschauer tun?</pre></li><li><b>Aufnehmen (5 Min):</b> Smartphone, gutes Licht, Blick in Kamera</li><li><b>Schnitt mit CapCut (5 Min):</b> Auto-Untertitel, Zoom-Effekte</li><li><b>Posting (2 Min):</b> Thumbnail, Hashtags, Caption</li></ol><h3>Prompt: Erklär-Video-Skript</h3><pre>Erstelle ein 3-Minuten Erklär-Video-Skript für Synthesia:
Thema: "Wie KI deinen Vertrieb revolutioniert"
Zielgruppe: Geschäftsführer KMU
Struktur: Intro → 3 Kernpunkte → Zusammenfassung → CTA
Tonalität: Professionell aber nahbar, Du-Ansprache
Füge Szenenanweisungen für visuelle Elemente ein.</pre>'::text)) WHERE id = 'd580c44b-367a-456a-b8ef-ba1c6be209e7';

-- Troubleshooting Automation
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Troubleshooting & Best Practices</h2><h3>Die 5 häufigsten Automation-Fehler</h3><table><tr><th>Fehler</th><th>Symptom</th><th>Lösung</th></tr><tr><td>Fehlende Fehlerbehandlung</td><td>Workflow stoppt komplett</td><td>Error Handler + Fallback-Route einbauen</td></tr><tr><td>Rate Limits ignoriert</td><td>429-Fehler, API-Sperre</td><td>Sleep-Module, Queue-System nutzen</td></tr><tr><td>Keine Testdaten</td><td>Fehler erst in Produktion</td><td>Immer mit Testdaten starten</td></tr><tr><td>Zu viele Schritte</td><td>Timeout, hohe Kosten</td><td>Workflows aufteilen</td></tr><tr><td>Keine Logs</td><td>Fehlerursache unklar</td><td>Logger-Module an kritischen Stellen</td></tr></table><h3>Best Practices</h3><ul><li><b>Idempotenz:</b> Workflows so bauen, dass doppelte Ausführung keinen Schaden anrichtet</li><li><b>Monitoring:</b> Slack/E-Mail-Benachrichtigung bei Fehlern</li><li><b>Dokumentation:</b> Jeden Workflow mit Namen, Zweck und Trigger beschreiben</li><li><b>Versionierung:</b> Vor Änderungen eine Kopie des Workflows anlegen</li></ul><h3>Debug-Checkliste</h3><ol><li>☐ Sind alle API-Keys gültig und nicht abgelaufen?</li><li>☐ Stimmen die Datenformate (JSON, String, Number)?</li><li>☐ Ist der Trigger korrekt konfiguriert?</li><li>☐ Gibt es Rate Limits beim Ziel-Service?</li><li>☐ Funktioniert jedes Modul einzeln?</li></ol><h3>KI-Prompt für Debugging</h3><pre>Ich habe einen Make.com Workflow der fehlschlägt:
Trigger: [X]
Module: [Y]
Fehlermeldung: [Z]

Analysiere mögliche Ursachen und schlage 3 Lösungen vor.</pre>'::text)) WHERE id = '7edb2f09-ffae-4000-b3e4-f8803f4ff730';

-- Lead-Bewertung Übung (SalesFlow)
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Übung: 5 Leads bewerten</h2><p>Bewerte folgende Leads nach dem ICP-Scoring-System:</p><h3>Lead 1: Thomas Müller</h3><table><tr><td>Firma</td><td>Müller Elektrotechnik GmbH</td></tr><tr><td>Branche</td><td>Elektro-Handwerk</td></tr><tr><td>Mitarbeiter</td><td>12</td></tr><tr><td>Jahresumsatz</td><td>1.8 Mio €</td></tr><tr><td>Pain Point</td><td>"Finde keine Fachkräfte mehr"</td></tr></table><p>Deine Bewertung: ICP-Score ___ /100 | Begründung: ___</p><h3>Lead 2: Sarah Weber</h3><table><tr><td>Firma</td><td>Weber Consulting</td></tr><tr><td>Branche</td><td>Unternehmensberatung</td></tr><tr><td>Mitarbeiter</td><td>3</td></tr><tr><td>Jahresumsatz</td><td>250.000€</td></tr><tr><td>Pain Point</td><td>"Brauche mehr Sichtbarkeit online"</td></tr></table><p>Deine Bewertung: ICP-Score ___ /100 | Begründung: ___</p><h3>KI-Prompt für Lead-Bewertung</h3><pre>Bewerte diesen Lead für mein ICP:
Mein ICP: [Beschreibung]
Lead-Daten: [Einfügen]

Bewerte auf einer Skala von 1-100:
- Branchen-Fit (0-25)
- Größen-Fit (0-25)
- Budget-Potenzial (0-25)
- Timing/Dringlichkeit (0-25)

Gesamtscore + Empfehlung (Hot/Warm/Cold)</pre>'::text)) WHERE id = '4775fb46-c91c-47a5-a1f4-be68b3e68b02';

-- Pipeline-Stages erklärt (SalesFlow)
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Pipeline-Stages erklärt</h2><h3>Die Customer Journey in 7 Stages</h3><table><tr><th>Stage</th><th>Bedeutung</th><th>Ziel</th><th>KI-Unterstützung</th></tr><tr><td>🟢 New Lead</td><td>Neuer Kontakt eingegangen</td><td>Qualifizierung</td><td>Auto-ICP-Score</td></tr><tr><td>📞 Setter Call</td><td>Erstgespräch geplant/durchgeführt</td><td>Bedarf ermitteln</td><td>Gesprächsanalyse</td></tr><tr><td>📊 Analysis Ready</td><td>KI-Analyse abgeschlossen</td><td>Strategie entwickeln</td><td>Strukturogramm</td></tr><tr><td>📄 Offer Sent</td><td>Angebot versendet</td><td>Entscheidung</td><td>Follow-up-Timing</td></tr><tr><td>🤝 Negotiation</td><td>In Verhandlung</td><td>Abschluss</td><td>Einwand-Analyse</td></tr><tr><td>✅ Won</td><td>Deal gewonnen</td><td>Onboarding</td><td>Auto-Willkommen</td></tr><tr><td>❌ Lost</td><td>Deal verloren</td><td>Learnings</td><td>Verlust-Analyse</td></tr></table><h3>Praxis-Beispiel</h3><p>Ein Malerbetrieb füllt das Kontaktformular aus → Lead landet automatisch in "New Lead" → ICP-Score wird berechnet → Bei Score > 70: automatisch Setter Call vorschlagen.</p><h3>KI-Prompt: Pipeline-Analyse</h3><pre>Analysiere meine aktuelle Sales Pipeline:
- 15 Leads in "New Lead" (durchschn. 5 Tage alt)
- 8 in "Setter Call" (3 durchgeführt, 5 geplant)
- 3 in "Offer Sent" (alle > 7 Tage)
- 2 in "Negotiation"

Identifiziere Engpässe und empfehle Maßnahmen
für jede Stage. Priorisiere nach Revenue-Impact.</pre>'::text)) WHERE id = '4d82c31b-09ba-4fc4-96d1-7104fb292eb0';

-- Leads durch die Pipeline führen (SalesFlow)
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Leads durch die Pipeline führen</h2><h3>Die goldenen Regeln</h3><ol><li><b>Speed to Lead:</b> Kontaktiere neue Leads innerhalb von 5 Minuten. Die Conversion-Rate sinkt nach 30 Minuten um 80%.</li><li><b>Multi-Touch:</b> Nutze mindestens 3 Kanäle (Telefon, E-Mail, LinkedIn).</li><li><b>Value First:</b> Jeder Touchpoint muss Mehrwert bieten, nicht nur "nachfragen".</li><li><b>Document Everything:</b> Notizen zu jedem Gespräch im CRM.</li></ol><h3>Follow-up-Sequenz Vorlage</h3><table><tr><th>Tag</th><th>Aktion</th><th>Kanal</th></tr><tr><td>Tag 0</td><td>Erstkontakt + Terminvorschlag</td><td>Telefon</td></tr><tr><td>Tag 1</td><td>Zusammenfassung + Ressource senden</td><td>E-Mail</td></tr><tr><td>Tag 3</td><td>LinkedIn-Vernetzung</td><td>LinkedIn</td></tr><tr><td>Tag 5</td><td>Check-in mit neuem Insight</td><td>E-Mail</td></tr><tr><td>Tag 7</td><td>Abschließender Anruf</td><td>Telefon</td></tr></table><h3>KI-Prompts für Follow-ups</h3><pre>Schreibe eine Follow-up-E-Mail (Tag 3):
Lead: [Name], Branche: [X]
Letztes Gespräch: [Zusammenfassung]
Angebot: [Y]€
Ziel: Termin für Detailbesprechung

Tonalität: Persönlich, nicht aufdringlich.
Füge einen relevanten Branchen-Insight hinzu.</pre>'::text)) WHERE id = '12386023-b9ab-4039-bc7c-a66cda57ce69';

-- Abschluss-Quiz SalesFlow
UPDATE lessons SET meta = jsonb_set(COALESCE(meta, '{}'), '{content_html}', to_jsonb('<h2>Abschluss-Quiz: SalesFlow Grundlagen</h2><h3>Frage 1</h3><p>Was bedeutet "Speed to Lead"?</p><ul><li>a) Leads schnell löschen</li><li>b) Neue Leads innerhalb von 5 Minuten kontaktieren ✅</li><li>c) Möglichst viele Leads generieren</li></ul><h3>Frage 2</h3><p>In welcher Pipeline-Stage wird die KI-Strukturanalyse durchgeführt?</p><ul><li>a) New Lead</li><li>b) Nach dem Setter Call → Analysis Ready ✅</li><li>c) Nach dem Angebot</li></ul><h3>Frage 3</h3><p>Was misst der ICP-Score?</p><ul><li>a) Die Bonität des Kunden</li><li>b) Wie gut ein Lead zum idealen Kundenprofil passt ✅</li><li>c) Die Anzahl der Kontaktpunkte</li></ul><h3>Frage 4</h3><p>Welche Regel gilt für Follow-ups?</p><ul><li>a) Maximal 1x nachfassen</li><li>b) Jeden Tag anrufen</li><li>c) Multi-Touch über mind. 3 Kanäle ✅</li></ul><h3>Frage 5</h3><p>Was ist das Ziel der Pipeline-Stage "Setter Call"?</p><ul><li>a) Sofort verkaufen</li><li>b) Bedarf ermitteln und qualifizieren ✅</li><li>c) Preisverhandlung</li></ul>'::text)) WHERE id = '0b3d4ff3-5cc6-4f23-9783-0cac5791f683';
