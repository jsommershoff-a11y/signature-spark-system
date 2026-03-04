
-- Step 01: Change all Social Media + Email tables RLS to admin-only

-- ============ SOCIAL_POSTS ============
DROP POLICY IF EXISTS "Staff can insert social posts" ON social_posts;
DROP POLICY IF EXISTS "Staff can read social posts" ON social_posts;
DROP POLICY IF EXISTS "Staff can update social posts" ON social_posts;
DROP POLICY IF EXISTS "Admin can delete social posts" ON social_posts;

CREATE POLICY "Admin full access social_posts" ON social_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ SOCIAL_LIBRARY_ITEMS ============
DROP POLICY IF EXISTS "Staff can insert library items" ON social_library_items;
DROP POLICY IF EXISTS "Staff can read library items" ON social_library_items;
DROP POLICY IF EXISTS "Staff can update library items" ON social_library_items;
DROP POLICY IF EXISTS "Admin can delete library items" ON social_library_items;

CREATE POLICY "Admin full access social_library_items" ON social_library_items FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ SOCIAL_STRATEGY_SETTINGS ============
DROP POLICY IF EXISTS "Staff can read strategy settings" ON social_strategy_settings;
DROP POLICY IF EXISTS "Staff can insert strategy settings" ON social_strategy_settings;
DROP POLICY IF EXISTS "Staff can update strategy settings" ON social_strategy_settings;
DROP POLICY IF EXISTS "Admin can delete strategy settings" ON social_strategy_settings;

CREATE POLICY "Admin full access social_strategy_settings" ON social_strategy_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ EMAIL_TEMPLATES ============
DROP POLICY IF EXISTS "Staff can insert email templates" ON email_templates;
DROP POLICY IF EXISTS "Staff can read email templates" ON email_templates;
DROP POLICY IF EXISTS "Staff can update email templates" ON email_templates;
DROP POLICY IF EXISTS "Admin can delete email templates" ON email_templates;

CREATE POLICY "Admin full access email_templates" ON email_templates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ EMAIL_SEQUENCES ============
DROP POLICY IF EXISTS "Staff can insert sequences" ON email_sequences;
DROP POLICY IF EXISTS "Staff can read sequences" ON email_sequences;
DROP POLICY IF EXISTS "Staff can update sequences" ON email_sequences;
DROP POLICY IF EXISTS "Admin can delete sequences" ON email_sequences;

CREATE POLICY "Admin full access email_sequences" ON email_sequences FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ EMAIL_SEQUENCE_STEPS ============
DROP POLICY IF EXISTS "Staff can insert sequence steps" ON email_sequence_steps;
DROP POLICY IF EXISTS "Staff can read sequence steps" ON email_sequence_steps;
DROP POLICY IF EXISTS "Staff can update sequence steps" ON email_sequence_steps;
DROP POLICY IF EXISTS "Admin can delete sequence steps" ON email_sequence_steps;

CREATE POLICY "Admin full access email_sequence_steps" ON email_sequence_steps FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ LEAD_SEQUENCE_ENROLLMENTS ============
DROP POLICY IF EXISTS "Staff can insert enrollments" ON lead_sequence_enrollments;
DROP POLICY IF EXISTS "Staff can read enrollments" ON lead_sequence_enrollments;
DROP POLICY IF EXISTS "Staff can update enrollments" ON lead_sequence_enrollments;
DROP POLICY IF EXISTS "Admin can delete enrollments" ON lead_sequence_enrollments;

CREATE POLICY "Admin full access lead_sequence_enrollments" ON lead_sequence_enrollments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ EMAIL_MESSAGES ============
DROP POLICY IF EXISTS "Staff can insert messages" ON email_messages;
DROP POLICY IF EXISTS "Staff can read messages" ON email_messages;
DROP POLICY IF EXISTS "Staff can update messages" ON email_messages;
DROP POLICY IF EXISTS "Admin can delete messages" ON email_messages;

CREATE POLICY "Admin full access email_messages" ON email_messages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ EMAIL_EVENTS ============
DROP POLICY IF EXISTS "Staff can insert events" ON email_events;
DROP POLICY IF EXISTS "Staff can read events" ON email_events;
DROP POLICY IF EXISTS "Public can insert tracking events" ON email_events;

CREATE POLICY "Admin full access email_events" ON email_events FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Keep public insert for tracking pixel
CREATE POLICY "Public tracking insert email_events" ON email_events FOR INSERT TO anon
  WITH CHECK (true);

-- ============ EMAIL_BROADCASTS ============
DROP POLICY IF EXISTS "Staff can insert broadcasts" ON email_broadcasts;
DROP POLICY IF EXISTS "Staff can read broadcasts" ON email_broadcasts;
DROP POLICY IF EXISTS "Staff can update broadcasts" ON email_broadcasts;
DROP POLICY IF EXISTS "Admin can delete broadcasts" ON email_broadcasts;

CREATE POLICY "Admin full access email_broadcasts" ON email_broadcasts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
