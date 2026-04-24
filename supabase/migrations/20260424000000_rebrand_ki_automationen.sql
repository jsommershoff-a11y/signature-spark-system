-- Rebrand: KRS Signature → KI Automationen (body_html + subject in email_templates)
-- Separate forward-only migration; die ursprüngliche Template-Migration (20260304060518) bleibt unverändert.

UPDATE email_templates
SET body_html = REPLACE(body_html, 'KRS Signature', 'KI Automationen');

UPDATE email_templates
SET body_html = REPLACE(body_html, 'krs-signature.de', 'ki-automationen.io');

UPDATE email_templates
SET body_html = REPLACE(body_html, 'Dein KRS Signature Team', 'KI-Automationen Team'),
    body_html = REPLACE(body_html, 'Ihr KRS Signature Team', 'KI-Automationen Team'),
    body_html = REPLACE(body_html, 'Dein KRS Team', 'KI-Automationen Team'),
    body_html = REPLACE(body_html, 'Ihr KRS Team', 'KI-Automationen Team');

UPDATE email_templates
SET subject = REPLACE(subject, 'KRS Signature', 'KI Automationen');
