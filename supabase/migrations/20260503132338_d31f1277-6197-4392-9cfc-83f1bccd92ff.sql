-- Backfill: für jedes pipeline_item ohne bestehenden stage_changed-Eintrag
-- ein initiales Event mit from_stage=null, to_stage=current stage, created_at=stage_updated_at
WITH fallback_admin AS (
  SELECT p.id
  FROM profiles p
  JOIN user_roles ur ON ur.user_id = p.user_id
  WHERE ur.role = 'admin'::app_role
  ORDER BY p.created_at ASC
  LIMIT 1
),
candidates AS (
  SELECT
    pi.id            AS pipeline_item_id,
    pi.lead_id,
    pi.stage::text   AS to_stage,
    COALESCE(pi.stage_updated_at, pi.created_at, now()) AS at,
    COALESCE(l.owner_user_id, (SELECT id FROM fallback_admin)) AS actor
  FROM pipeline_items pi
  JOIN crm_leads l ON l.id = pi.lead_id
  WHERE pi.lead_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM activities a
      WHERE a.lead_id = pi.lead_id
        AND a.type = 'stage_changed'::activity_type
        AND a.metadata->>'pipeline_item_id' = pi.id::text
    )
)
INSERT INTO activities (lead_id, user_id, type, content, metadata, created_at)
SELECT
  c.lead_id,
  c.actor,
  'stage_changed'::activity_type,
  'Stage initial gesetzt: → ' || c.to_stage,
  jsonb_build_object(
    'from_stage', NULL,
    'to_stage', c.to_stage,
    'pipeline_item_id', c.pipeline_item_id,
    'via', 'backfill'
  ),
  c.at
FROM candidates c
WHERE c.actor IS NOT NULL;