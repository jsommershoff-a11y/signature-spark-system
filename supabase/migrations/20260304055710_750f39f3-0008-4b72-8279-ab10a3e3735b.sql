
-- Seed preset email sequences
INSERT INTO public.email_sequences (name, description, trigger_type, status, is_preset, created_by)
VALUES 
  ('Freebie Follow-up', 'Automatische Nachfass-Sequenz nach Lead-Registrierung. Ziel: Upsell auf 499€ Produkt.', 'lead_registered', 'draft', true, '2824ab54-05a2-4358-8a98-4ec7ae1262f9'),
  ('Kunden Onboarding', 'Nach Kauf: Portal-Aktivierung und erste Schritte.', 'product_purchased', 'draft', true, '2824ab54-05a2-4358-8a98-4ec7ae1262f9')
ON CONFLICT DO NOTHING;

-- Seed steps for Freebie Follow-up
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_minutes, subject_override)
SELECT id, step_order, delay_minutes, subject_override
FROM (
  SELECT id FROM public.email_sequences WHERE name = 'Freebie Follow-up' AND is_preset = true LIMIT 1
) seq,
(VALUES 
  (1, 0, 'Willkommen – Dein Freebie ist da'),
  (2, 1440, 'Hast du schon reingeschaut?'),
  (3, 4320, 'Die 3 größten Fehler beim Kundengewinnen'),
  (4, 10080, 'Exklusives Angebot: Signature System für 499€')
) AS steps(step_order, delay_minutes, subject_override)
ON CONFLICT DO NOTHING;

-- Seed steps for Kunden Onboarding
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_minutes, subject_override)
SELECT id, step_order, delay_minutes, subject_override
FROM (
  SELECT id FROM public.email_sequences WHERE name = 'Kunden Onboarding' AND is_preset = true LIMIT 1
) seq,
(VALUES 
  (1, 0, 'Willkommen im Signature System – Dein Zugang'),
  (2, 1440, 'Dein erster Schritt im Portal'),
  (3, 4320, 'Hast du deinen Fahrplan gesehen?')
) AS steps(step_order, delay_minutes, subject_override)
ON CONFLICT DO NOTHING;
