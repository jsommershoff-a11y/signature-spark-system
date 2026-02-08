-- 1. Profil mit Namen aktualisieren
UPDATE profiles 
SET first_name = 'Jan', 
    last_name = 'Sommershoff', 
    full_name = 'Jan Sommershoff'
WHERE user_id = '2b61d31a-e087-4ce3-bc34-3e39786fa9bd';

-- 2. Mitarbeiter-Rolle hinzufuegen
INSERT INTO user_roles (user_id, role)
VALUES ('2b61d31a-e087-4ce3-bc34-3e39786fa9bd', 'mitarbeiter')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Member-Eintrag fuer LMS-Zugang erstellen
INSERT INTO members (user_id, profile_id, status, onboarded_at, last_active_at)
VALUES (
  '2b61d31a-e087-4ce3-bc34-3e39786fa9bd',
  'ce75e352-10e4-4d01-83cb-28436366845e',
  'active',
  now(),
  now()
);

-- 4. Call Queue fuer heute erstellen
INSERT INTO call_queues (assigned_to, date, generated_by)
VALUES (
  'ce75e352-10e4-4d01-83cb-28436366845e',
  '2026-02-08',
  'manual'
);

-- 5. Call Queue Items aus bestehenden Pipeline-Items generieren
WITH new_queue AS (
  SELECT id FROM call_queues 
  WHERE assigned_to = 'ce75e352-10e4-4d01-83cb-28436366845e' 
  AND date = '2026-02-08'
),
ranked_items AS (
  SELECT 
    pi.lead_id,
    pi.stage,
    pi.pipeline_priority_score,
    ROW_NUMBER() OVER (ORDER BY pi.pipeline_priority_score DESC) as priority_rank,
    CASE pi.stage::text
      WHEN 'new_lead' THEN 'Erstgespraech'
      WHEN 'setter_call_scheduled' THEN 'Geplanter Call'
      WHEN 'setter_call_done' THEN 'Follow-up'
      WHEN 'analysis_ready' THEN 'Analyse besprechen'
      WHEN 'offer_draft' THEN 'Angebot finalisieren'
      WHEN 'offer_sent' THEN 'Angebot nachfassen'
      WHEN 'payment_unlocked' THEN 'Zahlung pruefen'
      ELSE 'Kontaktieren'
    END as reason
  FROM pipeline_items pi
  WHERE pi.stage NOT IN ('won', 'lost')
  LIMIT 7
)
INSERT INTO call_queue_items (queue_id, lead_id, priority_rank, reason, status)
SELECT 
  (SELECT id FROM new_queue),
  ri.lead_id,
  ri.priority_rank,
  ri.reason,
  'pending'
FROM ranked_items ri;