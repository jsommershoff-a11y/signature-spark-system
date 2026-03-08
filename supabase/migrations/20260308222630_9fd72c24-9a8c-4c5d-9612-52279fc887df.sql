
-- Seed Learning Paths
INSERT INTO public.learning_paths (id, name, description, icon, color, sort_order) VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'KI-Prompting Mastery', 'Lerne die Kunst des Prompt-Engineerings – von einfachen Anfragen bis zu komplexen Business-Prompts.', 'MessageSquare', 'orange', 1),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'KI im Marketing', 'Content-Erstellung, Social Media und E-Mail-Automatisierung mit KI-Tools.', 'Megaphone', 'blue', 2),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'KI in Vertrieb & CRM', 'Lead-Scoring, Gesprächsanalyse und KI-gestützte Angebotserstellung.', 'TrendingUp', 'green', 3),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'KI-Automatisierung', 'Workflows, API-Integrationen und Prozessautomatisierung mit KI.', 'Workflow', 'purple', 4);

-- Seed Courses (12 total, 3 per path)
INSERT INTO public.courses (id, name, description, learning_path_id, path_level, sort_order, published, version) VALUES
  ('ca010101-0101-0101-0101-010101010101', 'Prompting Grundlagen', 'Dein Einstieg in ChatGPT, Claude & Co.', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'starter', 1, true, 1),
  ('ca020202-0202-0202-0202-020202020202', 'Advanced Prompt Engineering', 'Chain-of-Thought, Few-Shot Learning und System-Prompts.', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'fortgeschritten', 2, true, 1),
  ('ca030303-0303-0303-0303-030303030303', 'Expert Prompting & Custom GPTs', 'Eigene GPTs bauen und KI-Agenten erstellen.', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'experte', 3, true, 1),
  ('ca040404-0404-0404-0404-040404040404', 'KI-Content Basics', 'Texte, Bilder und Videos mit KI erstellen.', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'starter', 1, true, 1),
  ('ca050505-0505-0505-0505-050505050505', 'Social Media mit KI', 'Content-Planung und Reels automatisiert produzieren.', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'fortgeschritten', 2, true, 1),
  ('ca060606-0606-0606-0606-060606060606', 'KI-Marketing Automation', 'E-Mail-Sequenzen und Kampagnen-Optimierung.', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'experte', 3, true, 1),
  ('ca070707-0707-0707-0707-070707070707', 'KI im Vertrieb – Einstieg', 'Wie KI deinen Vertriebsprozess revolutioniert.', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'starter', 1, true, 1),
  ('ca080808-0808-0808-0808-080808080808', 'KI-gestützte Gesprächsanalyse', 'Strukturogramm und Kaufbereitschaftsanalyse.', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'fortgeschritten', 2, true, 1),
  ('ca090909-0909-0909-0909-090909090909', 'Automatisierte Angebotserstellung', 'KI-basierte Angebote und Follow-up-Automation.', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'experte', 3, true, 1),
  ('ca101010-1010-1010-1010-101010101010', 'Automatisierung Basics', 'Einführung in Make, Zapier und No-Code-Workflows.', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'starter', 1, true, 1),
  ('ca111111-1111-1111-1111-111111111111', 'KI-Workflows in der Praxis', 'Lead-Import, E-Mail-Trigger und CRM-Automatisierung.', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'fortgeschritten', 2, true, 1),
  ('ca121212-1212-1212-1212-121212121212', 'KI-Agenten & API-Mastery', 'Eigene KI-Agenten und End-to-End-Automatisierung.', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'experte', 3, true, 1);

-- Modules for Course 1: Prompting Grundlagen
INSERT INTO public.modules (id, course_id, name, description, sort_order) VALUES
  ('aa110000-0000-0000-0000-000000000001', 'ca010101-0101-0101-0101-010101010101', 'Was ist KI?', 'Grundverständnis von KI, LLMs und wie sie funktionieren.', 1),
  ('aa110000-0000-0000-0000-000000000002', 'ca010101-0101-0101-0101-010101010101', 'Dein erster Prompt', 'Lerne die Anatomie eines guten Prompts.', 2),
  ('aa110000-0000-0000-0000-000000000003', 'ca010101-0101-0101-0101-010101010101', 'Prompt-Frameworks', 'Bewährte Strukturen für bessere Ergebnisse.', 3);

-- Lessons for Module 1
INSERT INTO public.lessons (module_id, name, description, lesson_type, duration_seconds, sort_order) VALUES
  ('aa110000-0000-0000-0000-000000000001', 'Willkommen zur KI-Revolution', 'Warum KI jetzt relevant ist.', 'video', 480, 1),
  ('aa110000-0000-0000-0000-000000000001', 'Wie funktionieren LLMs?', 'Token, Kontext und Wahrscheinlichkeiten.', 'video', 600, 2),
  ('aa110000-0000-0000-0000-000000000001', 'Quiz: KI-Grundlagen', 'Teste dein Wissen.', 'quiz', 300, 3),
  ('aa110000-0000-0000-0000-000000000002', 'Die Anatomie eines Prompts', 'Rolle, Kontext, Aufgabe, Format.', 'video', 720, 1),
  ('aa110000-0000-0000-0000-000000000002', 'Praxis: Erste Prompts schreiben', '5 Prompts für Business-Szenarien.', 'task', 900, 2),
  ('aa110000-0000-0000-0000-000000000002', 'Häufige Fehler vermeiden', 'Top-10-Prompting-Fehler.', 'video', 540, 3),
  ('aa110000-0000-0000-0000-000000000003', 'Das RISEN-Framework', 'Role, Instructions, Steps, End goal, Narrowing.', 'video', 660, 1),
  ('aa110000-0000-0000-0000-000000000003', 'Arbeitsblatt: Framework-Übungen', 'Wende Frameworks auf eigene Projekte an.', 'worksheet', 1200, 2),
  ('aa110000-0000-0000-0000-000000000003', 'Abschlusstest', 'Zeige was du gelernt hast.', 'quiz', 600, 3);

-- Modules for Course 4: KI-Content Basics
INSERT INTO public.modules (id, course_id, name, description, sort_order) VALUES
  ('aa110000-0000-0000-0000-000000000004', 'ca040404-0404-0404-0404-040404040404', 'KI-Tools im Überblick', 'Die wichtigsten Tools.', 1),
  ('aa110000-0000-0000-0000-000000000005', 'ca040404-0404-0404-0404-040404040404', 'Texte mit KI erstellen', 'Blogartikel, Webseiten, E-Mails.', 2),
  ('aa110000-0000-0000-0000-000000000006', 'ca040404-0404-0404-0404-040404040404', 'Bilder & Videos mit KI', 'Midjourney, DALL-E, Runway.', 3);

INSERT INTO public.lessons (module_id, name, description, lesson_type, duration_seconds, sort_order) VALUES
  ('aa110000-0000-0000-0000-000000000004', 'Die KI-Tool-Landschaft 2025', 'Strukturierter Überblick.', 'video', 540, 1),
  ('aa110000-0000-0000-0000-000000000004', 'ChatGPT vs. Claude vs. Gemini', 'Stärken und Schwächen.', 'video', 720, 2),
  ('aa110000-0000-0000-0000-000000000005', 'Blogartikel in 10 Minuten', 'Vom Thema zum Artikel.', 'video', 600, 1),
  ('aa110000-0000-0000-0000-000000000005', 'E-Mail-Texte die konvertieren', 'KI-Copywriting-Techniken.', 'video', 480, 2),
  ('aa110000-0000-0000-0000-000000000005', 'Praxis: 3 Texte erstellen', 'Blog, E-Mail und Social Post.', 'task', 1500, 3),
  ('aa110000-0000-0000-0000-000000000006', 'Bildgenerierung mit KI', 'Midjourney und DALL-E.', 'video', 660, 1),
  ('aa110000-0000-0000-0000-000000000006', 'Video-Content mit KI', 'Runway, HeyGen, Synthesia.', 'video', 780, 2);

-- Modules for Course 7: KI im Vertrieb
INSERT INTO public.modules (id, course_id, name, description, sort_order) VALUES
  ('aa110000-0000-0000-0000-000000000007', 'ca070707-0707-0707-0707-070707070707', 'KI im Vertriebsprozess', 'Wo KI den größten Impact hat.', 1),
  ('aa110000-0000-0000-0000-000000000008', 'ca070707-0707-0707-0707-070707070707', 'Lead-Qualifizierung mit KI', 'Automatische Bewertung.', 2);

INSERT INTO public.lessons (module_id, name, description, lesson_type, duration_seconds, sort_order) VALUES
  ('aa110000-0000-0000-0000-000000000007', 'Der KI-gestützte Vertriebsprozess', 'Vom Lead bis zum Abschluss.', 'video', 600, 1),
  ('aa110000-0000-0000-0000-000000000007', 'CRM & KI: Die perfekte Kombination', 'CRM mit KI-Insights aufladen.', 'video', 540, 2),
  ('aa110000-0000-0000-0000-000000000008', 'ICP-Scoring mit KI', 'Ideal Customer Profile bewerten.', 'video', 720, 1),
  ('aa110000-0000-0000-0000-000000000008', 'Arbeitsblatt: Dein ICP definieren', 'Dein ideales Kundenprofil.', 'worksheet', 900, 2),
  ('aa110000-0000-0000-0000-000000000008', 'Quiz: Lead-Qualifizierung', 'Teste dein Wissen.', 'quiz', 300, 3);

-- Modules for Course 10: Automatisierung Basics
INSERT INTO public.modules (id, course_id, name, description, sort_order) VALUES
  ('aa110000-0000-0000-0000-000000000009', 'ca101010-1010-1010-1010-101010101010', 'No-Code Automation Grundlagen', 'Make, Zapier und n8n.', 1),
  ('aa110000-0000-0000-0000-000000000010', 'ca101010-1010-1010-1010-101010101010', 'Dein erster KI-Workflow', 'Baue deinen ersten Workflow.', 2);

INSERT INTO public.lessons (module_id, name, description, lesson_type, duration_seconds, sort_order) VALUES
  ('aa110000-0000-0000-0000-000000000009', 'Was ist No-Code Automation?', 'Überblick der Plattformen.', 'video', 480, 1),
  ('aa110000-0000-0000-0000-000000000009', 'Make vs. Zapier vs. n8n', 'Welches Tool passt?', 'video', 600, 2),
  ('aa110000-0000-0000-0000-000000000010', 'Workflow: Lead → E-Mail → CRM', 'Kompletter Workflow.', 'video', 900, 1),
  ('aa110000-0000-0000-0000-000000000010', 'Praxis: Eigenen Workflow bauen', 'Dein erster Workflow.', 'task', 1800, 2),
  ('aa110000-0000-0000-0000-000000000010', 'Troubleshooting & Best Practices', 'Typische Fehler vermeiden.', 'video', 540, 3);

-- Placeholder modules for remaining courses
INSERT INTO public.modules (course_id, name, description, sort_order) VALUES
  ('ca020202-0202-0202-0202-020202020202', 'Chain-of-Thought Prompting', 'Schritt-für-Schritt-Reasoning.', 1),
  ('ca020202-0202-0202-0202-020202020202', 'Few-Shot & Multi-Shot', 'Mit Beispielen bessere Ergebnisse.', 2),
  ('ca020202-0202-0202-0202-020202020202', 'System-Prompts für Business', 'Professionelle System-Prompts.', 3),
  ('ca030303-0303-0303-0303-030303030303', 'Custom GPTs erstellen', 'Eigene GPTs bauen.', 1),
  ('ca030303-0303-0303-0303-030303030303', 'API-Prompt-Optimierung', 'Prompts für API-Calls.', 2),
  ('ca030303-0303-0303-0303-030303030303', 'KI-Agenten designen', 'Autonome Agenten steuern.', 3),
  ('ca050505-0505-0505-0505-050505050505', 'Content-Kalender mit KI', 'Monatliche Planung.', 1),
  ('ca050505-0505-0505-0505-050505050505', 'Reels & Kurzvideos', 'KI-gestützte Video-Skripte.', 2),
  ('ca060606-0606-0606-0606-060606060606', 'E-Mail-Sequenzen mit KI', 'Follow-up-Sequenzen.', 1),
  ('ca060606-0606-0606-0606-060606060606', 'A/B-Testing mit KI', 'KI-gestützte Test-Strategien.', 2),
  ('ca080808-0808-0808-0808-080808080808', 'Strukturogramm-Analyse', 'Kommunikationstypen erkennen.', 1),
  ('ca080808-0808-0808-0808-080808080808', 'Kaufbereitschaft messen', 'KI-basierte Scoring-Modelle.', 2),
  ('ca090909-0909-0909-0909-090909090909', 'Angebote mit KI erstellen', 'Personalisierte Angebote.', 1),
  ('ca090909-0909-0909-0909-090909090909', 'Follow-up Automation', 'Nachfass-Strategien.', 2),
  ('ca111111-1111-1111-1111-111111111111', 'CRM-Workflows automatisieren', 'Pipeline-Automation.', 1),
  ('ca111111-1111-1111-1111-111111111111', 'E-Mail-Trigger & Webhooks', 'Event-basierte Automation.', 2),
  ('ca121212-1212-1212-1212-121212121212', 'KI-Agenten für Business', 'Autonome Agenten im Einsatz.', 1),
  ('ca121212-1212-1212-1212-121212121212', 'API-Ketten & Orchestrierung', 'Multi-API-Workflows.', 2);
