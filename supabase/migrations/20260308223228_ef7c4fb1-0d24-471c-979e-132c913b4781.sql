
-- Seed new courses for all 4 paths × 3 new tiers

-- KI-Prompting Mastery
INSERT INTO courses (id, name, description, learning_path_id, path_level, price_tier, price_cents, sort_order, published, includes_done_for_you) VALUES 
('ca140101-0101-4101-8101-010101010101', 'Prompt-Frameworks für Profis', 'Fortgeschrittene Prompt-Techniken und Templates für den Business-Alltag', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'fortgeschritten', 'low_budget', 49900, 4, true, false),
('ca150101-0101-4101-8101-010101010101', 'KI-Strategie & Custom GPTs Masterclass', 'Baue eigene GPTs und KI-Strategien für dein Unternehmen', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'experte', 'mid_range', 500000, 5, true, false),
('ca160101-0101-4101-8101-010101010101', 'KI-Prompting VIP: Done-for-You', 'Komplette Prompt-Bibliothek und Custom GPTs – inkl. 1:1 Coaching', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'experte', 'high_class', 1200000, 6, true, true);

-- KI im Marketing
INSERT INTO courses (id, name, description, learning_path_id, path_level, price_tier, price_cents, sort_order, published, includes_done_for_you) VALUES 
('ca140202-0202-4202-8202-020202020202', 'KI-Content Strategie Workshop', 'Content-Planung und SEO mit KI-Tools', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'fortgeschritten', 'low_budget', 49900, 4, true, false),
('ca150202-0202-4202-8202-020202020202', 'Marketing Automation Masterclass', 'Komplette Marketing-Funnels mit KI aufbauen', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'experte', 'mid_range', 500000, 5, true, false),
('ca160202-0202-4202-8202-020202020202', 'KI-Marketing VIP: Done-for-You', 'KI-Marketing-Stack wird für dich aufgesetzt – Funnels, Automations, Content', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'experte', 'high_class', 1200000, 6, true, true);

-- KI in Vertrieb & CRM
INSERT INTO courses (id, name, description, learning_path_id, path_level, price_tier, price_cents, sort_order, published, includes_done_for_you) VALUES 
('ca140303-0303-4303-8303-030303030303', 'KI-gestütztes Lead Scoring', 'Leads automatisch bewerten und priorisieren mit KI', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'fortgeschritten', 'low_budget', 49900, 4, true, false),
('ca150303-0303-4303-8303-030303030303', 'Sales Pipeline Automation Masterclass', 'CRM-Workflows voll automatisieren', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'experte', 'mid_range', 500000, 5, true, false),
('ca160303-0303-4303-8303-030303030303', 'KI-Vertrieb VIP: Done-for-You', 'KI-Vertriebsmaschine wird für dich gebaut – CRM, Scoring, Follow-ups', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'experte', 'high_class', 1200000, 6, true, true);

-- KI-Automatisierung
INSERT INTO courses (id, name, description, learning_path_id, path_level, price_tier, price_cents, sort_order, published, includes_done_for_you) VALUES 
('ca140404-0404-4404-8404-040404040404', 'Make & Zapier Automatisierungen', 'No-Code KI-Workflows für den Geschäftsalltag', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'fortgeschritten', 'low_budget', 49900, 4, true, false),
('ca150404-0404-4404-8404-040404040404', 'Enterprise Automation Masterclass', 'KI-Agenten, API-Integrationen und Enterprise-Workflows', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'experte', 'mid_range', 500000, 5, true, false),
('ca160404-0404-4404-8404-040404040404', 'KI-Automatisierung VIP: Done-for-You', 'Komplette Geschäftsprozess-Automatisierung – inkl. KI-Agenten', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'experte', 'high_class', 1200000, 6, true, true);

-- Generate modules and lessons for all new courses
DO $$
DECLARE
  rec RECORD;
  mod_id uuid;
  module_names text[];
  i int;
BEGIN
  FOR rec IN 
    SELECT c.id as course_id, c.price_tier::text as pt
    FROM courses c
    WHERE c.id IN (
      'ca140101-0101-4101-8101-010101010101','ca150101-0101-4101-8101-010101010101','ca160101-0101-4101-8101-010101010101',
      'ca140202-0202-4202-8202-020202020202','ca150202-0202-4202-8202-020202020202','ca160202-0202-4202-8202-020202020202',
      'ca140303-0303-4303-8303-030303030303','ca150303-0303-4303-8303-030303030303','ca160303-0303-4303-8303-030303030303',
      'ca140404-0404-4404-8404-040404040404','ca150404-0404-4404-8404-040404040404','ca160404-0404-4404-8404-040404040404'
    )
  LOOP
    IF rec.pt = 'low_budget' THEN
      module_names := ARRAY['Grundlagen', 'Praxis-Übungen', 'Abschluss-Projekt'];
    ELSIF rec.pt = 'mid_range' THEN
      module_names := ARRAY['Strategie & Planung', 'Implementierung', 'Optimierung & Skalierung', 'Abschluss-Projekt'];
    ELSE
      module_names := ARRAY['Kick-off & Audit', 'Done-for-You Implementierung', '1:1 Coaching & Übergabe'];
    END IF;

    FOR i IN 1..array_length(module_names, 1) LOOP
      mod_id := gen_random_uuid();
      INSERT INTO modules (id, course_id, name, sort_order) VALUES (mod_id, rec.course_id, module_names[i], i);
      INSERT INTO lessons (module_id, name, lesson_type, sort_order, duration_seconds) VALUES
        (mod_id, 'Einführung & Überblick', 'video', 1, 600),
        (mod_id, 'Praxis-Anwendung', 'video', 2, 720),
        (mod_id, 'Übungsaufgabe', 'task', 3, 900);
    END LOOP;
  END LOOP;
END $$;
