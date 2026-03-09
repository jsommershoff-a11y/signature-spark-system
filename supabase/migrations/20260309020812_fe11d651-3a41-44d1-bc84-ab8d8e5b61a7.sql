
-- Enrich existing lessons with KI content, prompts and guides

-- Prompt-Frameworks für Profis - Grundlagen: Einführung
UPDATE lessons SET 
  description = 'Die wichtigsten Prompt-Frameworks: RACE, CRISP, Chain-of-Thought und mehr.',
  meta = '{"content_html": "<h2>Die 5 wichtigsten Prompt-Frameworks</h2><h3>1. RACE Framework</h3><p><b>R</b>ole – Definiere die Rolle der KI<br/><b>A</b>ction – Was soll getan werden?<br/><b>C</b>ontext – Hintergrundinformationen<br/><b>E</b>xpectation – Erwartetes Format</p><h3>2. CRISP Framework</h3><p><b>C</b>apacity – Rolle der KI<br/><b>R</b>ole – Expertise<br/><b>I</b>nsight – Fakten<br/><b>S</b>tatement – Anweisung<br/><b>P</b>ersonality – Stil</p><h3>3. Chain-of-Thought (CoT)</h3><p>Fordere die KI auf, Schritt für Schritt zu denken.</p><h3>4. Few-Shot Prompting</h3><p>Gib 2-3 Beispiele vor der Aufgabe.</p><h3>5. Tree-of-Thought</h3><p>Mehrere Lösungswege parallel erkunden.</p>"}'::jsonb
WHERE id = '6ceec942-b0c3-4093-9444-aade97fc8b76';

-- Prompt-Frameworks - Praxis
UPDATE lessons SET 
  description = 'Wende RACE und CoT auf echte Business-Szenarien an.',
  meta = '{"content_html": "<h2>Frameworks in der Praxis</h2><h3>Kaltakquise-E-Mail mit RACE</h3><pre>Role: Erfahrener B2B-Vertriebstexter\nAction: Kaltakquise-E-Mail schreiben\nContext: Handwerksbetriebe, 10-50 MA\nExpectation: Max 150 Wörter, ein CTA</pre><h3>Lead-Analyse mit CoT</h3><pre>Analysiere diesen Lead Schritt für Schritt:\n1. Bewerte Branche und Größe\n2. Prüfe Kaufbereitschaftssignale\n3. Identifiziere Entscheidungstyp\n4. Empfehle Ansprache-Strategie</pre><h3>Angebot mit CRISP</h3><pre>Capacity: Vertriebsberater\nRole: KI-Implementierung Mittelstand\nInsight: 25 MA, 2M Umsatz\nStatement: Angebot erstellen\nPersonality: Professionell, nahbar</pre>"}'::jsonb
WHERE id = 'd31d2962-1d5a-44f7-ae81-efb8ad60e803';

-- Prompt-Frameworks - Übung
UPDATE lessons SET 
  description = 'Erstelle dein eigenes Prompt-Playbook für 3 Business-Szenarien.',
  meta = '{"content_html": "<h2>Dein Prompt-Playbook</h2><h3>Aufgabe 1: Follow-up Generator</h3><pre>Role: Vertriebsprofi bei [Firma]\nAction: Follow-up nach Erstgespräch\nContext: Kunde [Name], Branche [X]\nExpectation: 100-150 Wörter, empathisch</pre><h3>Aufgabe 2: Gesprächsvorbereitung</h3><p>CoT-Prompt für Verkaufsgespräche.</p><h3>Aufgabe 3: LinkedIn-Post</h3><p>Few-Shot Prompt für konsistente Posts.</p>"}'::jsonb
WHERE id = 'e8ec4cce-5795-435d-9220-c237e8f8985b';

-- KI-Content Strategie - Grundlagen
UPDATE lessons SET 
  description = 'Warum Content-Strategie mit KI anders funktioniert.',
  meta = '{"content_html": "<h2>KI-Content Strategie</h2><h3>Vorteile</h3><ul><li>10x schnellere Erstellung</li><li>Einheitliche Markenstimme</li><li>Skalierung von 2 auf 14 Posts/Woche</li></ul><h3>Content-Pyramide</h3><ol><li><b>Pillar</b> – Fachartikel</li><li><b>Cluster</b> – Blog-Posts</li><li><b>Social</b> – Posts, Reels</li><li><b>Micro</b> – Captions</li></ol><h3>Prompt: Content-Kalender</h3><pre>Erstelle Content-Kalender für [Branche]:\n- 3 Pillar-Themen/Monat\n- 8 Cluster-Posts/Pillar\n- 20 Social-Snippets/Cluster\nZielgruppe: [ICP]</pre>"}'::jsonb
WHERE id = '00a874b5-f9d8-4d1c-ad1f-1d8e9d88c480';

-- KI-Lead Scoring - Grundlagen
UPDATE lessons SET 
  description = 'Wie KI-basiertes Lead Scoring funktioniert.',
  meta = '{"content_html": "<h2>KI Lead Scoring</h2><h3>6 Dimensionen</h3><ol><li><b>ICP-Fit</b></li><li><b>Engagement</b></li><li><b>Budget-Signale</b></li><li><b>Timing</b></li><li><b>Entscheider-Level</b></li><li><b>Strukturogramm-Match</b></li></ol><h3>Prompt</h3><pre>Bewerte Lead (0-100):\nName: [Name]\nBranche: [Branche]\nGröße: [MA]\nAnfrage: [Text]\n\nBewerte: ICP-Fit, Budget, Timing, Entscheider.\nGib Gesamtbewertung + 3 Schritte.</pre>"}'::jsonb
WHERE id = '576bf813-4f09-4175-a1e9-2e1ab67d9ef4';

-- Make & Zapier - Grundlagen
UPDATE lessons SET 
  description = 'Make, Zapier und n8n mit KI-Integrationen im Vergleich.',
  meta = '{"content_html": "<h2>No-Code KI-Tools</h2><h3>Make</h3><ul><li>Visueller Builder, KI-Module, ab 9 EUR</li></ul><h3>Zapier</h3><ul><li>6000+ Apps, einfach, ab 19 USD</li></ul><h3>n8n</h3><ul><li>Open Source, self-hosted, kostenlos</li></ul><h3>Top Workflows</h3><ol><li>Lead → KI bewertet → CRM → Notification</li><li>E-Mail → KI klassifiziert → Auto-Antwort</li><li>Transkript → KI analysiert → Follow-up</li></ol>"}'::jsonb
WHERE id = 'ff4bc923-254d-4f67-b966-fbbe0af12c09';

-- Remaining Praxis lessons
UPDATE lessons SET description = 'Hands-on: KI-Content für LinkedIn, Blog und Social Media.',
  meta = '{"content_html": "<h2>Content live erstellen</h2><h3>LinkedIn-Post</h3><pre>Schreibe LinkedIn-Post über [Thema]:\n- Hook erste Zeile\n- Persönliche Story\n- 3 Tipps\n- CTA + Hashtags</pre><h3>Blog-Artikel</h3><pre>800-Wörter SEO-Artikel:\nKeyword: [X]\nZielgruppe: [Y]\nStruktur: H2/H3, Bullets, Fazit</pre>"}'::jsonb
WHERE id = '3cf46994-3084-46cc-8b54-2d5427f9b026';

UPDATE lessons SET description = 'Lead-Scoring Prompts an realen Daten testen.',
  meta = '{"content_html": "<h2>Lead Scoring Praxis</h2><pre>Analysiere Lead:\n[Daten]\nBewerte 0-100:\n- Branchenfit (0-25)\n- Größe (0-25)\n- Kaufsignale (0-25)\n- Zeitdruck (0-25)\nEmpfehle: Anrufen / E-Mail / Nurturing</pre>"}'::jsonb
WHERE id = 'a5d3c75b-d04d-4f8f-a498-c9e514194b8f';

UPDATE lessons SET description = 'Baue deinen ersten KI-Automatisierungs-Workflow.',
  meta = '{"content_html": "<h2>Erster KI-Workflow</h2><ol><li>Trigger: Neuer Lead</li><li>KI: Bewertung mit GPT</li><li>Router: Score > 70 → Hot Lead</li><li>Slack-Notification</li><li>Auto-E-Mail</li></ol><pre>Bewerte JSON: {{lead_data}}\nAntworte NUR JSON:\n{\"score\": 0-100, \"priority\": \"hot/warm/cold\"}</pre>"}'::jsonb
WHERE id = 'd5dfec3f-a144-4a63-b359-32cb26c6b2ad';

-- Übungsaufgaben enrichment
UPDATE lessons SET description = 'Erstelle eine KI-Content-Strategie für dein Unternehmen.',
  meta = '{"content_html": "<h2>Aufgabe: Content-Strategie</h2><ol><li>Definiere 3 Pillar-Themen</li><li>Erstelle Prompts für jeden Content-Typ</li><li>Generiere einen Monatsplan mit KI</li></ol><pre>Du bist Content-Stratege.\nBranche: [X]\nZielgruppe: [Y]\nErstelle Monatsplan mit Themen, Formaten, Kanälen.</pre>"}'::jsonb
WHERE id = 'ee44bdcf-8e96-486c-98f5-7300cfeb2e27';

UPDATE lessons SET description = 'Bewerte 5 Leads mit dem KI-Scoring-System.',
  meta = '{"content_html": "<h2>Aufgabe: 5 Leads bewerten</h2><p>Nutze den Scoring-Prompt für 5 echte Leads aus deinem CRM.</p><p>Vergleiche KI-Score mit deiner Einschätzung.</p>"}'::jsonb
WHERE id = '28f02fdd-a3be-438f-a358-0a576d3fd24f';

UPDATE lessons SET description = 'Baue einen kompletten Lead-Qualifizierungs-Workflow.',
  meta = '{"content_html": "<h2>Aufgabe: Automation bauen</h2><ol><li>Wähle Make oder Zapier</li><li>Verbinde CRM als Trigger</li><li>Füge KI-Bewertungsmodul hinzu</li><li>Konfiguriere Benachrichtigungen</li></ol>"}'::jsonb
WHERE id = 'd19dbea8-13fc-4981-86c4-c97e8899111d';

-- Praxis-Übungen modules
UPDATE lessons SET description = 'Fortgeschrittene Scoring-Modelle mit KI kalibrieren.',
  meta = '{"content_html": "<h2>Scoring optimieren</h2><p>Lerne wie du dein Scoring-Modell mit historischen Daten verbesserst.</p><pre>Analysiere diese 10 abgeschlossenen Deals:\n[Daten]\nIdentifiziere Muster:\n- Welche Faktoren korrelieren mit Abschluss?\n- Welche Signale waren irreführend?\n- Schlage Gewichtungsanpassungen vor.</pre>"}'::jsonb
WHERE id = 'cd1c6899-716a-4080-8bc8-1b90b5118532';

UPDATE lessons SET description = 'Fortgeschrittene Content-Workflows automatisieren.',
  meta = '{"content_html": "<h2>Content Automation</h2><pre>Workflow: Blog zu Social\n1. Blog-Artikel fertig\n2. KI extrahiert 5 Key-Takeaways\n3. Generiert 3 LinkedIn-Posts\n4. Erstellt 2 Instagram-Captions\n5. Plant alles im Kalender</pre>"}'::jsonb
WHERE id = '35978c1c-7105-463e-8970-30696c7f3b78';

UPDATE lessons SET description = 'Prompt-Bibliothek für den Arbeitsalltag aufbauen.',
  meta = '{"content_html": "<h2>Prompt-Bibliothek</h2><h3>Kategorie: Vertrieb</h3><pre>- Erstgespräch vorbereiten\n- Einwände entkräften\n- Angebot formulieren\n- Follow-up schreiben</pre><h3>Kategorie: Marketing</h3><pre>- Social Post generieren\n- Newsletter schreiben\n- SEO-Artikel planen\n- Ad-Copy erstellen</pre><h3>Kategorie: Analyse</h3><pre>- Lead bewerten\n- Wettbewerber analysieren\n- Markttrends erkennen\n- KPI-Report erstellen</pre>"}'::jsonb
WHERE id = 'dfe14d61-ded5-4658-80d3-6e2a99b4dacb';

UPDATE lessons SET description = 'Komplexe Multi-Step Automationen bauen.',
  meta = '{"content_html": "<h2>Multi-Step Automation</h2><pre>Szenario: Vollautomatisches Lead-Nurturing\n1. Lead registriert sich\n2. KI bewertet und segmentiert\n3. Personalisierte E-Mail-Sequenz startet\n4. Nach 3 Tagen: KI prüft Engagement\n5. Hot Lead → Kalendereinladung\n6. Cold Lead → Weiteres Nurturing</pre>"}'::jsonb
WHERE id = '1a28ece9-cf90-454d-878c-388fd6deaf4b';

-- Remaining Strategie & Planung and Kick-off modules
UPDATE lessons SET description = 'Strategische Planung deiner KI-Prompt-Infrastruktur.',
  meta = '{"content_html": "<h2>Prompt-Strategie planen</h2><ol><li>Identifiziere wiederkehrende Aufgaben</li><li>Kategorisiere nach Komplexität</li><li>Wähle passendes Framework pro Kategorie</li><li>Erstelle Template-Bibliothek</li></ol>"}'::jsonb
WHERE id = '72f753ee-da15-43c2-8685-45cc2de708d6';

UPDATE lessons SET description = 'Content-Marketing-Strategie mit KI-Tools entwickeln.',
  meta = '{"content_html": "<h2>KI-Content-Strategie</h2><pre>Analysiere meinen aktuellen Content:\n[Top 5 Posts einfügen]\n\nIdentifiziere:\n1. Was funktioniert gut?\n2. Welche Themen fehlen?\n3. Optimale Posting-Zeiten\n4. Content-Lücken vs. Wettbewerb</pre>"}'::jsonb
WHERE id = 'a30458f0-8e1d-46a8-82e7-d4a5adf1bc77';

UPDATE lessons SET description = 'Lead-Scoring-Strategie für dein Vertriebsteam.',
  meta = '{"content_html": "<h2>Scoring-Strategie</h2><ol><li>Definiere dein ICP exakt</li><li>Gewichte Scoring-Dimensionen</li><li>Setze Schwellenwerte fest</li><li>Plane Review-Zyklen</li></ol><pre>Erstelle ICP-Definition:\nBranche: [X]\nGröße: [Y]\nBudget: [Z]\nSchmerzpunkte: [...]</pre>"}'::jsonb
WHERE id = '4eee3be7-9c12-49e0-82ca-6587720ae241';

UPDATE lessons SET description = 'Automations-Roadmap für 90 Tage erstellen.',
  meta = '{"content_html": "<h2>90-Tage Automations-Plan</h2><h3>Monat 1: Quick Wins</h3><ul><li>E-Mail-Antworten automatisieren</li><li>Lead-Notification einrichten</li></ul><h3>Monat 2: Workflows</h3><ul><li>Lead-Scoring implementieren</li><li>Follow-up-Sequenzen bauen</li></ul><h3>Monat 3: Optimierung</h3><ul><li>A/B-Testing der Prompts</li><li>KPI-Dashboard aufsetzen</li></ul>"}'::jsonb
WHERE id = '6df208a8-38a5-458e-873c-6669b40459d6';

-- Kick-off & Audit modules
UPDATE lessons SET description = 'Audit deiner aktuellen Prompt-Nutzung im Team.',
  meta = '{"content_html": "<h2>Prompt-Audit</h2><h3>Checkliste</h3><ul><li>Welche KI-Tools nutzt das Team?</li><li>Wie oft werden sie genutzt?</li><li>Gibt es Standard-Prompts?</li><li>Wo sind die größten Zeitfresser?</li></ul><pre>Erstelle eine Bestandsaufnahme:\n1. Liste alle wiederkehrenden Aufgaben\n2. Markiere KI-Potenzial (hoch/mittel/niedrig)\n3. Priorisiere Top 5 Automatisierungen</pre>"}'::jsonb
WHERE id = '5bd51bfd-8bb9-4fd0-9a27-f773002e6ffb';

UPDATE lessons SET description = 'Content-Audit: Was funktioniert, was nicht.',
  meta = '{"content_html": "<h2>Content-Audit</h2><pre>Analysiere meine letzten 20 Posts:\n[Links/Texte einfügen]\n\nBewerte pro Post:\n- Engagement-Rate (geschätzt)\n- Thema und Format\n- Was gut funktioniert hat\n- Verbesserungsvorschläge\n\nErstelle Ranking und Empfehlung.</pre>"}'::jsonb
WHERE id = '7864282f-c9d6-4eb9-8faf-e286340ca048';

UPDATE lessons SET description = 'Lead-Prozess Audit und KI-Potenzialanalyse.',
  meta = '{"content_html": "<h2>Vertriebsprozess-Audit</h2><ol><li>Dokumentiere aktuellen Lead-Flow</li><li>Identifiziere manuelle Schritte</li><li>Bewerte KI-Automatisierungspotenzial</li><li>Berechne Zeitersparnis</li></ol>"}'::jsonb
WHERE id = 'b5bce9ae-0074-4fb3-8f40-0dac507b26b5';

UPDATE lessons SET description = 'Automation-Audit: Welche Prozesse zuerst automatisieren.',
  meta = '{"content_html": "<h2>Automation-Audit</h2><pre>Bewerte jeden Prozess:\n- Häufigkeit (täglich/wöchentlich/monatlich)\n- Zeitaufwand pro Durchlauf\n- Fehleranfälligkeit\n- KI-Eignung (1-10)\n\nPriorisiere: Häufig + zeitintensiv + KI-geeignet = ZUERST</pre>"}'::jsonb
WHERE id = '77dbec91-22eb-43de-a571-54697d581521';

-- Praxis-Anwendung in Strategie modules
UPDATE lessons SET description = 'Prompt-Templates für den Alltag erstellen und testen.',
  meta = '{"content_html": "<h2>Templates erstellen</h2><h3>E-Mail-Antwort Template</h3><pre>Du bist Kundenberater bei [Firma].\nE-Mail: [Kunden-E-Mail]\nAntworte: Freundlich, lösungsorientiert, max 100 Wörter.\nBiete konkreten nächsten Schritt an.</pre><h3>Meeting-Zusammenfassung</h3><pre>Fasse dieses Meeting zusammen:\n[Notizen]\nFormat: Teilnehmer, Entscheidungen, Action Items, Deadlines</pre>"}'::jsonb
WHERE id = 'c99eeb08-5899-4683-aaaa-3a107ca56262';

UPDATE lessons SET description = 'Content-Plan für die nächsten 4 Wochen erstellen.',
  meta = '{"content_html": "<h2>4-Wochen Content-Plan</h2><pre>Erstelle Content-Plan:\nBranche: [X]\nZiele: [Leads/Branding/Recruiting]\nKanäle: LinkedIn, Instagram, Newsletter\n\nPro Woche:\n- 3 LinkedIn-Posts\n- 2 Instagram-Posts\n- 1 Newsletter\nInkl. Thema, Format, Hook, CTA</pre>"}'::jsonb
WHERE id = 'c7c2e409-aac5-4118-ab60-0250d0a6b1e1';

UPDATE lessons SET description = 'Lead-Scoring live konfigurieren und testen.',
  meta = '{"content_html": "<h2>Scoring konfigurieren</h2><ol><li>Lade 10 echte Leads</li><li>Definiere Gewichtung</li><li>Teste mit KI-Prompt</li><li>Vergleiche mit Bauchgefühl</li><li>Kalibriere Schwellenwerte</li></ol>"}'::jsonb
WHERE id = 'a1369c0b-d31e-48a8-b982-caa4b96b29e7';

UPDATE lessons SET description = 'Ersten Automatisierungs-Workflow live aufsetzen.',
  meta = '{"content_html": "<h2>Live-Setup</h2><ol><li>Account bei Make/Zapier erstellen</li><li>CRM verbinden</li><li>KI-Modul konfigurieren</li><li>Test-Durchlauf starten</li><li>Fehler beheben</li></ol>"}'::jsonb
WHERE id = '9eb93aab-82dc-48de-85b3-c28adf9e3e66';

-- Kick-off Praxis
UPDATE lessons SET description = 'Prompt-Audit durchführen und dokumentieren.',
  meta = '{"content_html": "<h2>Audit durchführen</h2><p>Dokumentiere alle Bereiche wo KI helfen kann und erstelle eine Prioritätenliste.</p>"}'::jsonb
WHERE id = '682e7e59-aff5-49ac-96a3-65dc79b8f814';

UPDATE lessons SET description = 'Content-Audit abschließen und Strategie ableiten.',
  meta = '{"content_html": "<h2>Audit abschließen</h2><p>Werte die Ergebnisse aus und leite 5 konkrete Maßnahmen ab.</p>"}'::jsonb
WHERE id = 'f04af69b-654c-4bbf-ab66-862d7d2c283a';

-- Scoring Praxis
UPDATE lessons SET description = 'Scoring-Modell mit historischen Daten verfeinern.',
  meta = '{"content_html": "<h2>Modell verfeinern</h2><pre>Vergleiche Scores mit tatsächlichen Abschlüssen der letzten 3 Monate.\nPasse Gewichtungen an basierend auf Ergebnissen.</pre>"}'::jsonb
WHERE id = '9961e5ee-c8df-445f-9e40-3d9cd25a7640';

UPDATE lessons SET description = 'Multi-Step Workflows testen und optimieren.',
  meta = '{"content_html": "<h2>Workflow optimieren</h2><p>Teste deinen Workflow mit 10 Test-Leads und optimiere basierend auf den Ergebnissen.</p>"}'::jsonb
WHERE id = '6d23e0c8-acdd-462d-88bc-b814a391d81a';

-- Praxis-Übungen Aufgaben
UPDATE lessons SET description = 'Scoring-Modell für deine Branche optimieren.',
  meta = '{"content_html": "<h2>Branchenspezifisches Scoring</h2><pre>Passe den Scoring-Prompt an:\nBranche: [Deine Branche]\nTypische Deal-Größe: [X EUR]\nSales-Cycle: [Y Wochen]\nEntscheider-Typen: [...]</pre>"}'::jsonb
WHERE id = 'e3e79a7e-3cb5-4789-a5e1-7e204e5cdea0';

UPDATE lessons SET description = 'Content-Workflow von Blog zu Social automatisieren.',
  meta = '{"content_html": "<h2>Blog-to-Social Workflow</h2><ol><li>Blog fertig → Trigger</li><li>KI: 5 Key-Takeaways extrahieren</li><li>KI: 3 LinkedIn-Posts generieren</li><li>KI: 2 Instagram-Captions</li><li>Alles in Kalender planen</li></ol>"}'::jsonb
WHERE id = '9aef8d4e-5f53-4c1b-9f54-5cfddbb5a25f';

UPDATE lessons SET description = 'Eigenes Prompt-Framework entwickeln und dokumentieren.',
  meta = '{"content_html": "<h2>Eigenes Framework</h2><p>Kombiniere Elemente aus RACE, CRISP und CoT zu deinem persönlichen Framework.</p>"}'::jsonb
WHERE id = 'c5bc4893-7d2b-4e80-a9c3-cbef1ce0d38b';

UPDATE lessons SET description = 'End-to-End Automatisierung planen und umsetzen.',
  meta = '{"content_html": "<h2>E2E Automation</h2><p>Verbinde alle Einzelworkflows zu einer durchgängigen Automatisierungs-Pipeline.</p>"}'::jsonb
WHERE id = '03b5d1f1-92cf-48e0-9f9a-2f5e6eaabb28';
