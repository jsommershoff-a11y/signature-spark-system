-- Tighten email_events public INSERT: require valid message_id from a sent message
DROP POLICY IF EXISTS "Public tracking insert email_events" ON email_events;
CREATE POLICY "Public tracking insert email_events" ON email_events
FOR INSERT TO anon
WITH CHECK (
  message_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = message_id
    AND status = 'sent'
  )
);