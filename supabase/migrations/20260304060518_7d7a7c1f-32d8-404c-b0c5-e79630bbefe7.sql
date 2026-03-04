
-- Step 02: Seed 10 email templates + Angebot Follow-up sequence + link + activate

-- 1. Insert 10 email templates
INSERT INTO public.email_templates (name, subject, body_html, variables, created_by) VALUES
('freebie_welcome', 'Willkommen – Dein Freebie ist da', '<h2>Hallo {{first_name}},</h2><p>vielen Dank für dein Interesse! Hier ist dein Freebie-Download.</p><p>Viel Spaß beim Lesen!</p><p>Beste Grüße,<br>Dein KRS Signature Team</p>', ARRAY['first_name','company'], 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d'),
('freebie_value', 'Hast du schon reingeschaut?', '<h2>Hi {{first_name}},</h2><p>wir wollten kurz nachfragen – hast du schon einen Blick in das Freebie geworfen?</p><p>Hier sind die 3 wichtigsten Takeaways, die du sofort umsetzen kannst...</p><p>Beste Grüße,<br>Dein KRS Signature Team</p>', ARRAY['first_name','company'], 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d'),
('upsell_offer', 'Die 3 größten Fehler beim Kundengewinnen', '<h2>{{first_name}}, aufgepasst!</h2><p>Die meisten Unternehmer machen diese 3 Fehler bei der Kundengewinnung:</p><ol><li>Kein System</li><li>Keine Nachfass-Strategie</li><li>Kein klares Angebot</li></ol><p>Unser Signature System löst alle drei. Jetzt für nur 499€.</p>', ARRAY['first_name','company'], 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d'),
('last_call', 'Exklusives Angebot: Signature System für 499€', '<h2>Letzte Chance, {{first_name}}!</h2><p>Dein exklusiver Zugang zum Signature System läuft bald ab.</p><p>Sichere dir jetzt deinen Platz für nur 499€.</p><p>Beste Grüße,<br>Dein KRS Signature Team</p>', ARRAY['first_name','company'], 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d'),
('offer_reminder', 'Dein Angebot wartet auf dich', '<h2>Hallo {{first_name}},</h2><p>wir haben dir gestern ein maßgeschneidertes Angebot erstellt.</p><p>Hast du Fragen? Wir helfen dir gerne weiter.</p><p>Beste Grüße,<br>Dein KRS Signature Team</p>', ARRAY['first_name','company'], 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d'),
('trust_case', 'So hat {{company}} es geschafft', '<h2>{{first_name}}, echte Ergebnisse sprechen für sich.</h2><p>Unsere Kunden erzielen im Schnitt 30% mehr Abschlüsse in den ersten 90 Tagen.</p><p>Schau dir die Erfolgsgeschichten an.</p>', ARRAY['first_name','company'], 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d'),
('last_chance', 'Letzte Erinnerung: Dein Angebot', '<h2>{{first_name}},</h2><p>dein persönliches Angebot läuft bald ab.</p><p>Sichere dir jetzt die Zusammenarbeit, bevor der Platz vergeben ist.</p><p>Beste Grüße,<br>Dein KRS Signature Team</p>', ARRAY['first_name','company'], 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d'),
('portal_access', 'Willkommen im Signature System – Dein Zugang', '<h2>Herzlichen Glückwunsch, {{first_name}}!</h2><p>Dein Zugang zum Signature System Portal ist jetzt freigeschaltet.</p><p>Logge dich ein und starte mit deinem ersten Modul.</p>', ARRAY['first_name','company'], 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d'),
('system_setup', 'Dein erster Schritt im Portal', '<h2>Hi {{first_name}},</h2><p>hast du dich schon eingeloggt? Hier ist dein Fahrplan für die ersten 7 Tage:</p><ol><li>Profil vervollständigen</li><li>Erstes Modul starten</li><li>Community beitreten</li></ol>', ARRAY['first_name','company'], 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d'),
('support_invite', 'Hast du deinen Fahrplan gesehen?', '<h2>{{first_name}},</h2><p>wir wollen sicherstellen, dass du den maximalen Nutzen aus dem System ziehst.</p><p>Buche dir jetzt deinen persönlichen Onboarding-Call.</p>', ARRAY['first_name','company'], 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d');

-- 2. Insert "Angebot Follow-up" sequence
INSERT INTO public.email_sequences (name, description, trigger_type, status, is_preset, created_by)
VALUES ('Angebot Follow-up', 'Automatische Nachfass-Sequenz nach Angebotserstellung.', 'offer_created', 'draft', true, 'bd3a0e04-da58-47f9-874f-1b9fc6ad297d');

-- 3. Insert steps for Angebot Follow-up
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_minutes, subject_override)
SELECT seq.id, v.step_order, v.delay_minutes, v.subject_override
FROM (SELECT id FROM email_sequences WHERE name = 'Angebot Follow-up' AND is_preset = true LIMIT 1) seq,
(VALUES (1, 1440, 'Dein Angebot wartet auf dich'), (2, 4320, 'So hat es andere geschafft'), (3, 7200, 'Letzte Erinnerung: Dein Angebot')) AS v(step_order, delay_minutes, subject_override);

-- 4. Link Freebie Follow-up steps to templates
UPDATE email_sequence_steps SET template_id = (SELECT id FROM email_templates WHERE name = 'freebie_welcome') WHERE sequence_id = 'ba2d7c86-7333-4ba6-81ef-fea1262e9efc' AND step_order = 1;
UPDATE email_sequence_steps SET template_id = (SELECT id FROM email_templates WHERE name = 'freebie_value') WHERE sequence_id = 'ba2d7c86-7333-4ba6-81ef-fea1262e9efc' AND step_order = 2;
UPDATE email_sequence_steps SET template_id = (SELECT id FROM email_templates WHERE name = 'upsell_offer') WHERE sequence_id = 'ba2d7c86-7333-4ba6-81ef-fea1262e9efc' AND step_order = 3;
UPDATE email_sequence_steps SET template_id = (SELECT id FROM email_templates WHERE name = 'last_call') WHERE sequence_id = 'ba2d7c86-7333-4ba6-81ef-fea1262e9efc' AND step_order = 4;

-- 5. Link Kunden Onboarding steps to templates
UPDATE email_sequence_steps SET template_id = (SELECT id FROM email_templates WHERE name = 'portal_access') WHERE sequence_id = '7d0fc414-9ea4-4f2d-ac1f-1ea83034b4d7' AND step_order = 1;
UPDATE email_sequence_steps SET template_id = (SELECT id FROM email_templates WHERE name = 'system_setup') WHERE sequence_id = '7d0fc414-9ea4-4f2d-ac1f-1ea83034b4d7' AND step_order = 2;
UPDATE email_sequence_steps SET template_id = (SELECT id FROM email_templates WHERE name = 'support_invite') WHERE sequence_id = '7d0fc414-9ea4-4f2d-ac1f-1ea83034b4d7' AND step_order = 3;

-- 6. Link Angebot Follow-up steps to templates
UPDATE email_sequence_steps SET template_id = (SELECT id FROM email_templates WHERE name = 'offer_reminder') WHERE sequence_id = (SELECT id FROM email_sequences WHERE name = 'Angebot Follow-up') AND step_order = 1;
UPDATE email_sequence_steps SET template_id = (SELECT id FROM email_templates WHERE name = 'trust_case') WHERE sequence_id = (SELECT id FROM email_sequences WHERE name = 'Angebot Follow-up') AND step_order = 2;
UPDATE email_sequence_steps SET template_id = (SELECT id FROM email_templates WHERE name = 'last_chance') WHERE sequence_id = (SELECT id FROM email_sequences WHERE name = 'Angebot Follow-up') AND step_order = 3;

-- 7. Activate all 3 sequences
UPDATE email_sequences SET status = 'active' WHERE is_preset = true;
